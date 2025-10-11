import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getCurrentUser } from '@/lib/auth/get-user'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    console.log('🔍 Fetching exercises...')
    
    // Get current user
    const user = await getCurrentUser()
    let userId: string | null = null
    
    if (user) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email }
      })
      userId = dbUser?.id || null
    }

    const exercises = await prisma.exercise.findMany({
      orderBy: {
        sortOrder: 'asc',
      },
      include: {
        lesson: true,
        _count: {
          select: {
            exerciseQuestions: true,
          },
        },
        exerciseQuestions: {
          include: {
            question: true
          }
        }
      },
    })

    // For each exercise, calculate latest score if user is logged in
    const exercisesWithScores = await Promise.all(exercises.map(async (exercise) => {
      let latestScore = null
      
      if (userId) {
        // Get all question IDs in this exercise
        const questionIds = exercise.exerciseQuestions.map(eq => eq.question.id)
        
        if (questionIds.length > 0) {
          // Get the latest attempt timestamp for this exercise
          const latestAttempt = await prisma.attempt.findFirst({
            where: {
              userId,
              questionId: { in: questionIds }
            },
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              createdAt: true
            }
          })

          if (latestAttempt) {
            // Get all attempts from that session (within 1 hour window)
            const sessionStart = new Date(latestAttempt.createdAt.getTime() - 60 * 60 * 1000)
            const sessionEnd = new Date(latestAttempt.createdAt.getTime() + 60 * 60 * 1000)
            
            const sessionAttempts = await prisma.attempt.findMany({
              where: {
                userId,
                questionId: { in: questionIds },
                createdAt: {
                  gte: sessionStart,
                  lte: sessionEnd
                }
              },
              select: {
                isCorrect: true,
                questionId: true
              }
            })

            // Calculate score (count unique correct questions)
            const correctQuestions = new Set(
              sessionAttempts.filter(a => a.isCorrect).map(a => a.questionId)
            )
            const totalQuestions = questionIds.length
            const score = correctQuestions.size
            const percentage = Math.round((score / totalQuestions) * 100)

            latestScore = {
              score,
              totalQuestions,
              percentage,
              completedAt: latestAttempt.createdAt
            }
          }
        }
      }

      return {
        ...exercise,
        latestScore
      }
    }))

    console.log('✅ Found exercises:', exercisesWithScores.length)
    return NextResponse.json(exercisesWithScores)
  } catch (error) {
    console.error('❌ Error fetching exercises:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, exerciseName, additionalRequirements, difficulty, questionTypes, questionCount, manualContent, lessonId } = body

    console.log('📝 Creating exercise:', { mode, exerciseName })

    // Step 1: Generate questions using GPT-4o-mini
    let questionsData: any[] = []

    if (mode === 'ai') {
      // Validate AI mode inputs
      const selectedTypes = Object.entries(questionTypes)
        .filter(([_, selected]) => selected)
        .map(([type]) => type)

      if (selectedTypes.length === 0) {
        return NextResponse.json(
          { error: 'Vui lòng chọn ít nhất một loại câu hỏi' },
          { status: 400 }
        )
      }

      // Build AI prompt
      const prompt = `Bạn là một chuyên gia tạo đề thi tiếng Anh. Hãy tạo ${questionCount} câu hỏi cho bài tập "${exerciseName}".

Thông tin:
- Độ khó: ${difficulty}
- Loại câu hỏi: ${selectedTypes.join(', ')}
- Yêu cầu thêm: ${additionalRequirements || 'Không có'}

Phân bổ câu hỏi đều cho các loại đã chọn.

Định dạng JSON cho từng loại:

MCQ (Multiple Choice):
{
  "type": "MCQ",
  "prompt": "Câu hỏi",
  "concept": "present_simple_verb",
  "level": "${difficulty}",
  "data": {
    "choices": ["lựa chọn 1", "lựa chọn 2", "lựa chọn 3", "lựa chọn 4"],
    "answerIndex": 0
  }
}

CLOZE (Fill in the blank):
{
  "type": "CLOZE",
  "prompt": "Hoàn thành câu",
  "concept": "present_simple_verb",
  "level": "${difficulty}",
  "data": {
    "template": "I {{1}} to school every day.",
    "answers": ["go"]
  }
}

ORDER (Word ordering):
{
  "type": "ORDER",
  "prompt": "Sắp xếp các từ theo đúng thứ tự",
  "concept": "present_simple_word_order",
  "level": "${difficulty}",
  "data": {
    "tokens": ["I", "go", "to", "school"]
  }
}

TRANSLATE (Translation):
{
  "type": "TRANSLATE",
  "prompt": "Dịch câu sau sang tiếng Anh",
  "concept": "present_simple_translation",
  "level": "${difficulty}",
  "data": {
    "vietnameseText": "Tôi đi học mỗi ngày.",
    "correctAnswer": "I go to school every day."
  }
}

Trả về CHÍNH XÁC JSON array với ${questionCount} câu hỏi, không thêm text giải thích:
{ "questions": [...] }`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Bạn là một chuyên gia tạo đề thi tiếng Anh. Chỉ trả về JSON, không giải thích thêm.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' }
      })

      const result = JSON.parse(completion.choices[0].message.content || '{}')
      questionsData = result.questions || []

      if (questionsData.length === 0) {
        throw new Error('AI không tạo được câu hỏi')
      }

      console.log(`✅ AI generated ${questionsData.length} questions`)
    } else {
      // Manual mode - support both plain text and JSON
      const content = manualContent.trim()
      
      // Try to detect if it's JSON
      const looksLikeJSON = content.startsWith('{') || content.startsWith('[')
      
      if (looksLikeJSON) {
        // JSON mode - validate directly
        try {
          const parsed = JSON.parse(content)
          questionsData = Array.isArray(parsed) ? parsed : parsed.questions || []
          
          if (questionsData.length === 0) {
            return NextResponse.json(
              { error: 'Không tìm thấy câu hỏi nào trong JSON' },
              { status: 400 }
            )
          }
          
          console.log(`✅ Parsed ${questionsData.length} questions from JSON`)
        } catch {
          return NextResponse.json(
            { error: 'JSON không hợp lệ. Vui lòng kiểm tra cú pháp.' },
            { status: 400 }
          )
        }
      } else {
        // Plain text mode - use AI to convert to structured format (2-step process)
        console.log('📝 Converting plain text to structured questions...')
        
        // STEP 1: Parse text into structured format (WITHOUT determining answers)
        const parsingPrompt = `Bạn là chuyên gia phân tích đề thi tiếng Anh. Nhiệm vụ: Chuyển text thành cấu trúc JSON.

QUAN TRỌNG: Chỉ chấp nhận 4 loại câu hỏi:
- MCQ (Multiple Choice) - Trắc nghiệm
- CLOZE (Fill in the blank) - Điền từ  
- ORDER (Word ordering) - Sắp xếp từ
- TRANSLATE (Translation) - Dịch câu

Nội dung từ người dùng:
"""
${content}
"""

Hãy phân tích và chuyển đổi thành JSON:

{
  "questions": [
    {
      "type": "MCQ" | "CLOZE" | "ORDER" | "TRANSLATE",
      "prompt": "Câu hỏi chính (không bao gồm các lựa chọn)",
      "concept": "grammar_topic",
      "level": "A1" | "A2" | "B1" | "B2",
      "rawData": {
        // MCQ: danh sách tất cả lựa chọn theo thứ tự
        "choices": ["the many", "the less", "the fewer", "the little"],
        
        // CLOZE: template với {{1}} và danh sách từ có thể điền
        "template": "He {{1}} to school",
        "possibleAnswers": ["goes", "go", "went"]
        
        // ORDER: danh sách các từ cần sắp xếp
        "tokens": ["I", "go", "to", "school"]
        
        // TRANSLATE: text tiếng Việt cần dịch
        "vietnameseText": "Tôi đi học mỗi ngày"
      }
    }
  ],
  "rejected": [
    { "reason": "Lý do từ chối nếu không phải 4 dạng cho phép" }
  ]
}

LƯU Ý:
- Với MCQ: Lấy TOÀN BỘ nội dung của các lựa chọn (A. the many, B. the less...) → bỏ chữ cái A, B, C, D
- KHÔNG xác định đáp án đúng ở bước này
- Chỉ tập trung parse và structure hóa data`

        const parsingCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Bạn là chuyên gia parse dữ liệu. Chỉ parse và structure, KHÔNG xác định đáp án. Trả về JSON.'
            },
            {
              role: 'user',
              content: parsingPrompt
            }
          ],
          temperature: 0.2,
          response_format: { type: 'json_object' }
        })

        const parseResult = JSON.parse(parsingCompletion.choices[0].message.content || '{}')
        const parsedQuestions = parseResult.questions || []
        const rejected = parseResult.rejected || []

        if (rejected.length > 0) {
          console.log('⚠️ Some questions were rejected:', rejected)
        }

        if (parsedQuestions.length === 0) {
          return NextResponse.json(
            { 
              error: 'Không tìm thấy câu hỏi hợp lệ. Chỉ hỗ trợ 4 dạng: Trắc nghiệm, Điền từ, Sắp xếp, Dịch câu.',
              rejected: rejected
            },
            { status: 400 }
          )
        }

        console.log(`✅ Parsed ${parsedQuestions.length} questions structure`)

        // STEP 2: Determine correct answers for each question
        console.log('🎯 Determining correct answers...')
        
        questionsData = []
        
        for (let i = 0; i < parsedQuestions.length; i++) {
          const q = parsedQuestions[i]
          
          let answerPrompt = ''
          
          if (q.type === 'MCQ') {
            answerPrompt = `You are an expert English grammar teacher. A student needs to know the CORRECT answer.

Question: ${q.prompt}
Choices:
${q.rawData.choices.map((c: string, idx: number) => `${idx}. ${c}`).join('\n')}

IMPORTANT:
- Apply ALL English grammar rules correctly (subject-verb agreement, tenses, conditionals, etc.)
- For "Neither...nor" / "Either...or": verb agrees with the CLOSEST subject
- For comparative structures: ensure correct form (fewer/less, many/much, etc.)
- Double-check your answer before responding

Return JSON:
{
  "answerIndex": 0,
  "explanation": "Brief explanation why this is correct (in Vietnamese)"
}

Think step by step and provide the grammatically correct answer.`
          } else if (q.type === 'CLOZE') {
            answerPrompt = `You are an expert English grammar teacher.

Template: ${q.rawData.template}
Possible words to fill: ${q.rawData.possibleAnswers.join(', ')}

Choose the grammatically CORRECT word/phrase.

Return JSON:
{
  "correctAnswer": "goes",
  "explanation": "Brief explanation (in Vietnamese)"
}`
          } else if (q.type === 'ORDER') {
            answerPrompt = `You are an expert English grammar teacher.

Words to arrange: ${q.rawData.tokens.join(', ')}

Arrange into a grammatically CORRECT English sentence.

Return JSON:
{
  "correctOrder": ["I", "go", "to", "school"],
  "explanation": "Brief explanation (in Vietnamese)"
}`
          } else if (q.type === 'TRANSLATE') {
            answerPrompt = `You are an expert English translator.

Vietnamese: ${q.rawData.vietnameseText}

Translate to natural, grammatically correct English.

Return JSON:
{
  "correctAnswer": "I go to school every day.",
  "explanation": "Brief explanation (in Vietnamese)"
}`
          }

          const answerCompletion = await openai.chat.completions.create({
            model: 'gpt-4o', // ← Upgraded to GPT-4o (not mini)
            messages: [
              {
                role: 'system',
                content: 'You are an expert English grammar teacher with 100% accuracy. Think carefully and apply all grammar rules correctly before answering.'
              },
              {
                role: 'user',
                content: answerPrompt
              }
            ],
            temperature: 0.1, // Very low for consistency
            response_format: { type: 'json_object' }
          })

          const answerResult = JSON.parse(answerCompletion.choices[0].message.content || '{}')
          
          // Build final question data
          let finalData: any = {}
          
          if (q.type === 'MCQ') {
            finalData = {
              choices: q.rawData.choices,
              answerIndex: answerResult.answerIndex
            }
          } else if (q.type === 'CLOZE') {
            finalData = {
              template: q.rawData.template,
              answers: [answerResult.correctAnswer]
            }
          } else if (q.type === 'ORDER') {
            finalData = {
              tokens: answerResult.correctOrder || q.rawData.tokens
            }
          } else if (q.type === 'TRANSLATE') {
            finalData = {
              vietnameseText: q.rawData.vietnameseText,
              correctAnswer: answerResult.correctAnswer
            }
          }
          
          questionsData.push({
            type: q.type,
            prompt: q.prompt,
            concept: q.concept,
            level: q.level,
            explain: answerResult.explanation,
            data: finalData
          })
          
          console.log(`  ✅ Determined answer for question ${i + 1}/${parsedQuestions.length}`)
        }

        console.log(`✅ Converted ${questionsData.length} questions with correct answers`)
        if (rejected.length > 0) {
          console.log(`⚠️ Rejected ${rejected.length} unsupported questions`)
        }
      }
    }

    // Step 2: Validate questions structure and types
    const validTypes = ['MCQ', 'CLOZE', 'ORDER', 'TRANSLATE']
    const invalidQuestions = []

    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i]
      
      if (!q.type || !q.prompt || !q.data) {
        invalidQuestions.push(`Câu ${i + 1}: Thiếu type, prompt hoặc data`)
        continue
      }

      if (!validTypes.includes(q.type)) {
        invalidQuestions.push(`Câu ${i + 1}: Loại "${q.type}" không được hỗ trợ. Chỉ chấp nhận: MCQ, CLOZE, ORDER, TRANSLATE`)
      }
    }

    if (invalidQuestions.length > 0) {
      return NextResponse.json(
        { 
          error: 'Có câu hỏi không hợp lệ',
          details: invalidQuestions
        },
        { status: 400 }
      )
    }

    // Step 3: Create exercise with questions in a single transaction
    const exercise = await prisma.$transaction(async (tx) => {
      // Create exercise
      const newExercise = await tx.exercise.create({
        data: {
          title: exerciseName,
          description: additionalRequirements || `Bài tập ${mode === 'ai' ? 'AI tạo' : 'tự nhập'} - ${questionsData.length} câu hỏi`,
          lessonId: lessonId || null,
          source: 'USER_CREATED',
          isPublic: false,
        }
      })

      // Create questions and link to exercise
      for (let i = 0; i < questionsData.length; i++) {
        const qData = questionsData[i]
        
        const question = await tx.question.create({
          data: {
            type: qData.type,
            prompt: qData.prompt,
            concept: qData.concept || 'general',
            level: qData.level || difficulty || 'A1',
            lessonId: lessonId || null,
            explain: qData.explain || null,
            data: qData.data,
            source: 'USER_CREATED',
            isPublic: false,
          }
        })

        await tx.exerciseQuestion.create({
          data: {
            exerciseId: newExercise.id,
            questionId: question.id,
            sortOrder: i + 1,
          }
        })
      }

      return newExercise
    })

    console.log('🎉 Exercise created successfully:', exercise.id)

    return NextResponse.json({
      success: true,
      exercise: {
        id: exercise.id,
        title: exercise.title,
        questionCount: questionsData.length
      }
    })

  } catch (error) {
    console.error('❌ Error creating exercise:', error)
    
    // Return specific error messages
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Không thể tạo bài tập. Vui lòng thử lại.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.' },
      { status: 500 }
    )
  }
}
