import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getCurrentUser } from '@/lib/auth/get-user'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ✅ Add cache configuration
export const revalidate = 60 // Revalidate every 60 seconds
export const dynamic = 'force-dynamic' // Always get fresh data for user-specific content

export async function GET() {
  try {
    console.log('🔍 Fetching exercises...')
    
    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = dbUser.id

    // ✅ OPTIMIZED: Select only necessary fields
    const exercises = await prisma.exercise.findMany({
      where: {
        OR: [
          { createdById: userId },
          { source: 'OFFICIAL' }
        ]
      },
      orderBy: {
        sortOrder: 'asc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        source: true,
        createdAt: true,
        _count: {
          select: {
            exerciseQuestions: true,
          },
        },
        exerciseQuestions: {
          select: {
            question: {
              select: {
                id: true
              }
            }
          }
        }
      },
    })

    // ✅ OPTIMIZATION: Batch fetch all attempts in ONE query
    const allQuestionIds = exercises.flatMap(ex => 
      ex.exerciseQuestions.map(eq => eq.question.id)
    )

    const allAttempts = allQuestionIds.length > 0 
      ? await prisma.attempt.findMany({
          where: {
            userId,
            questionId: { in: allQuestionIds }
          },
          select: {
            questionId: true,
            isCorrect: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        })
      : []

    // Group attempts by question for O(1) lookup
    const attemptsByQuestion = new Map<string, typeof allAttempts>()
    for (const attempt of allAttempts) {
      if (!attemptsByQuestion.has(attempt.questionId)) {
        attemptsByQuestion.set(attempt.questionId, [])
      }
      attemptsByQuestion.get(attempt.questionId)!.push(attempt)
    }

    // ✅ Calculate scores efficiently
    const exercisesWithScores = exercises.map((exercise) => {
      let latestScore = null
      
      const questionIds = exercise.exerciseQuestions.map(eq => eq.question.id)
      
      if (questionIds.length > 0) {
        const exerciseAttempts = questionIds
          .flatMap(qId => attemptsByQuestion.get(qId) || [])
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

        if (exerciseAttempts.length > 0) {
          const latestAttempt = exerciseAttempts[0]
          const sessionStart = new Date(latestAttempt.createdAt.getTime() - 60 * 60 * 1000)
          const sessionEnd = new Date(latestAttempt.createdAt.getTime() + 60 * 60 * 1000)
          
          const sessionAttempts = exerciseAttempts.filter(a => 
            a.createdAt >= sessionStart && a.createdAt <= sessionEnd
          )

          const correctQuestions = new Set(
            sessionAttempts.filter(a => a.isCorrect).map(a => a.questionId)
          )
          const score = correctQuestions.size
          const percentage = Math.round((score / questionIds.length) * 100)

          latestScore = {
            score,
            totalQuestions: questionIds.length,
            percentage,
            completedAt: latestAttempt.createdAt
          }
        }
      }

      return {
        ...exercise,
        latestScore
      }
    })

    console.log('✅ Found exercises:', exercisesWithScores.length)
    
    // ✅ Add cache headers
    return NextResponse.json(exercisesWithScores, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    })
  } catch (error) {
    console.error('❌ Error fetching exercises:', error)
    return NextResponse.json({ error: 'Failed to fetch exercises' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, exerciseName, additionalRequirements, difficulty, questionTypes, questionCount, manualContent, lessonId } = body

    console.log('📝 Creating exercise:', { mode, exerciseName })

    // Get current user
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userId = dbUser.id

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

      // ✅ REMOVED strict validation - let AI generate and let user judge quality

      // Build AI prompt
      const prompt = `Bạn là chuyên gia tạo đề thi tiếng Anh. Hãy tạo ${questionCount} câu hỏi cho bài tập:

📌 CHỦ ĐỀ: "${exerciseName}"
📋 CHI TIẾT THÊM: ${additionalRequirements || 'Không có - bạn tự do sáng tạo!'}

🎯 CÁCH TẠO CÂU HỎI:
- User muốn luyện tập về "${exerciseName}"
- Nếu user cho thêm chi tiết (vd: "tập trung vào cấu trúc if...then") → làm theo yêu cầu đó
- Nếu user chỉ cho tiêu đề ngắn (vd: "if 0", "present simple") → bạn tự phát triển câu hỏi phù hợp
- Tạo câu hỏi thực tế, đa dạng tình huống, giúp user luyện tập hiệu quả

💡 VÍ DỤ CÁCH HIỂU CHỦ ĐỀ:
- "if 0" hoặc "conditional 0" → Câu điều kiện loại 0
- "Present Simple" → Thì hiện tại đơn
- "Daily activities" → Hoạt động hàng ngày (tự chọn ngữ pháp phù hợp)

// ...existing code...
`

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
            model: 'gpt-4o',
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
            temperature: 0.1,
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
    // ✅ OPTIMIZED: Use batch create to reduce transaction time
    const exercise = await prisma.$transaction(async (tx) => {
      // Create exercise WITH createdById
      const newExercise = await tx.exercise.create({
        data: {
          title: exerciseName,
          description: additionalRequirements || `Bài tập ${mode === 'ai' ? 'AI tạo' : 'tự nhập'} - ${questionsData.length} câu hỏi`,
          lessonId: lessonId || null,
          source: 'USER_CREATED',
          isPublic: false,
          createdById: userId,
        }
      })

      // ✅ FIXED: Use createMany instead of createManyAndReturn for Vercel compatibility
      const questionsToCreate = questionsData.map((qData, index) => ({
        id: `${newExercise.id}_q${index + 1}_${Date.now()}`, // Generate unique IDs
        type: qData.type,
        prompt: qData.prompt,
        concept: qData.concept || 'general',
        level: qData.level || difficulty || 'A1',
        lessonId: lessonId || null,
        explain: qData.explain || null,
        data: qData.data,
        source: 'USER_CREATED' as const,
        isPublic: false,
        createdById: userId,
      }))

      // Create all questions in batch
      await tx.question.createMany({
        data: questionsToCreate,
        skipDuplicates: true
      })

      // ✅ Fetch created questions to get their actual IDs
      const createdQuestions = await tx.question.findMany({
        where: {
          id: { in: questionsToCreate.map(q => q.id) }
        },
        orderBy: { createdAt: 'asc' }
      })

      // ✅ OPTIMIZED: Batch create exercise-question relationships
      const exerciseQuestionData = createdQuestions.map((question, index) => ({
        exerciseId: newExercise.id,
        questionId: question.id,
        sortOrder: index + 1,
      }))

      await tx.exerciseQuestion.createMany({
        data: exerciseQuestionData
      })

      return newExercise
    }, {
      timeout: 30000, // ✅ Increase timeout to 30s for Vercel serverless
      maxWait: 10000, // ✅ Increase maxWait to 10s
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
