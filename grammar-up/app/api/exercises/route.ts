import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'
import { getCurrentUser } from '@/lib/auth/get-user'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ✅ Remove cache configuration to show new content immediately
export const dynamic = 'force-dynamic' // Always get fresh data

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
    
    // ✅ Remove cache headers to ensure fresh data
    return NextResponse.json(exercisesWithScores)
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
      const prompt = `Bạn là chuyên gia tạo đề thi tiếng Anh. Hãy tạo CHÍNH XÁC ${questionCount} câu hỏi cho bài tập:

🎯 CHỦ ĐỀ CHÍNH: "${exerciseName}"
📝 YÊU CẦU CHI TIẾT: ${additionalRequirements || 'Không có yêu cầu đặc biệt'}
📊 LOẠI CÂU HỎI CẦN TẠO: ${selectedTypes.join(', ')}
🎚️ ĐỘ KHÓ: ${difficulty || 'A1'}

🔥 QUAN TRỌNG - ĐỌC KỸ:
- Tất cả ${questionCount} câu hỏi phải TRỰC TIẾP liên quan đến "${exerciseName}"
- Nếu "${exerciseName}" là ngữ pháp (vd: "Present Simple", "Past Perfect") → tạo câu hỏi về chính xác thì đó
- Nếu "${exerciseName}" là chủ đề (vd: "Daily Activities", "Food") → tạo câu hỏi về từ vựng và cấu trúc liên quan
- Nếu có yêu cầu chi tiết → làm theo CHÍNH XÁC yêu cầu đó

💡 VÍ DỤ MINH HỌA:
- Nếu chủ đề "Present Simple" → tạo câu về S + V(s/es), Do/Does, thói quen
- Nếu chủ đề "Past Perfect" → tạo câu về had + V3, before/after, sequence
- Nếu chủ đề "Conditional 0" → tạo câu về If + Present, Present (sự thật hiển nhiên)
- Nếu chủ đề "Food and Drinks" → tạo câu về từ vựng thức ăn, đồ uống

🎯 PHÂN BỔ CÂU HỎI:
- Tổng cộng: ${questionCount} câu
- Phân bổ đều theo tỷ lệ: ${selectedTypes.map(type => {
  const count = Math.ceil(questionCount / selectedTypes.length);
  return `${type}: ${count} câu`;
}).join(', ')}

📋 CẤU TRÚC JSON TRẢ VỀ:
{
  "questions": [
    {
      "type": "MCQ" | "CLOZE" | "ORDER" | "TRANSLATE",
      "prompt": "Câu hỏi cụ thể về ${exerciseName}",
      "concept": "${exerciseName.toLowerCase().replace(/\s+/g, '_')}",
      "level": "${difficulty || 'A1'}",
      "explain": "Giải thích ngắn gọn bằng tiếng Việt",
      "data": {
        // MCQ (Trắc nghiệm):
        "choices": ["đáp án 1", "đáp án 2", "đáp án 3", "đáp án 4"],
        "answerIndex": 0
        
        // CLOZE (Điền từ):
        "template": "Câu có {{1}} chỗ trống về ${exerciseName}",
        "answers": ["từ đúng"],
        "options": ["từ đúng", "từ sai 1", "từ sai 2", "từ sai 3"], 
        "correctIndex": 0
        
        // ORDER (Sắp xếp từ):
        "tokens": ["các", "từ", "cần", "sắp", "xếp", "về", "${exerciseName}"]
        
        // TRANSLATE (Dịch):
        "vietnameseText": "Câu tiếng Việt liên quan ${exerciseName}",
        "correctAnswer": "Câu tiếng Anh tương ứng"
      }
    }
  ]
}

✅ CHECKLIST BẮT BUỘC:
□ Tất cả câu hỏi liên quan trực tiếp đến "${exerciseName}"
□ Có đúng ${questionCount} câu hỏi
□ Phân bổ đều các loại: ${selectedTypes.join(', ')}
□ MCQ có 4 lựa chọn với 1 đáp án đúng
□ CLOZE dùng {{1}}, {{2}} cho chỗ trống
□ ORDER có từ bị trộn lẫn
□ TRANSLATE từ tiếng Việt sang tiếng Anh
□ Mức độ phù hợp với ${difficulty || 'A1'}
□ Có explain cho mỗi câu
□ Concept = "${exerciseName.toLowerCase().replace(/\s+/g, '_')}"

🚨 LƯU Ý CUỐI:
- KHÔNG tạo câu hỏi chung chung không liên quan
- KHÔNG dùng placeholder như "example", "sample"
- Chỉ trả về JSON, không giải thích thêm`

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
        "possibleAnswers": ["goes", "go", "went"],
        "options": ["goes", "go", "went", "runs"],
        "correctIndex": 0
        
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
Possible words to fill: ${q.rawData.options.join(', ')}

Choose the grammatically CORRECT word/phrase.

Return JSON:
{
  "correctIndex": 0,
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
              answers: [q.rawData.options[answerResult.correctIndex]],
              options: q.rawData.options,
              correctIndex: answerResult.correctIndex
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

    // ✅ Add type validation helper
    function validateQuestionData(type: string, data: any): { isValid: boolean; error?: string } {
      switch (type) {
        case 'MCQ':
          if (!data.choices || !Array.isArray(data.choices) || data.choices.length < 2) {
            return { isValid: false, error: 'MCQ cần có ít nhất 2 lựa chọn' }
          }
          if (typeof data.answerIndex !== 'number' || data.answerIndex < 0 || data.answerIndex >= data.choices.length) {
            return { isValid: false, error: 'MCQ cần có answerIndex hợp lệ' }
          }
          break
        case 'CLOZE':
          if (!data.template) {
            return { isValid: false, error: 'CLOZE cần có template' }
          }
          if (!data.options || !Array.isArray(data.options) || data.options.length < 2) {
            return { isValid: false, error: 'CLOZE cần có ít nhất 2 lựa chọn' }
          }
          if (typeof data.correctIndex !== 'number' || data.correctIndex < 0 || data.correctIndex >= data.options.length) {
            return { isValid: false, error: 'CLOZE cần có correctIndex hợp lệ' }
          }
          break
        case 'ORDER':
          if (!data.tokens || !Array.isArray(data.tokens) || data.tokens.length < 2) {
            return { isValid: false, error: 'ORDER cần có ít nhất 2 từ' }
          }
          break
        case 'TRANSLATE':
          if (!data.vietnameseText || !data.correctAnswer) {
            return { isValid: false, error: 'TRANSLATE cần có vietnameseText và correctAnswer' }
          }
          break
        default:
          return { isValid: false, error: `Loại câu hỏi không hỗ trợ: ${type}` }
      }
      return { isValid: true }
    }

    // Step 3: Create exercise with questions in a single transaction
    // ✅ FIXED: Proper validation and database creation
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

      // ✅ FIXED: Let Prisma generate IDs automatically and validate data
      const questionsToCreate = questionsData.map((qData, index) => {
        // Validate question data structure
        const validation = validateQuestionData(qData.type, qData.data)
        if (!validation.isValid) {
          throw new Error(`Câu hỏi ${index + 1}: ${validation.error}`)
        }

        // Ensure valid enums
        const questionType = ['MCQ', 'CLOZE', 'ORDER', 'TRANSLATE'].includes(qData.type) ? qData.type : 'MCQ'
        const questionLevel = ['A1', 'A2', 'B1', 'B2'].includes(qData.level) ? qData.level : (difficulty || 'A1')

        return {
          // ✅ FIXED: Remove manual ID, let Prisma generate it
          type: questionType as any, // Cast to enum
          prompt: qData.prompt,
          concept: qData.concept || 'general',
          level: questionLevel as any, // Cast to enum  
          lessonId: lessonId || null,
          explain: qData.explain || null,
          data: qData.data,
          source: 'USER_CREATED' as const,
          isPublic: false,
          createdById: userId,
        }
      })

      // ✅ FIXED: Use create instead of createMany to get IDs back
      const createdQuestions = []
      for (const questionData of questionsToCreate) {
        const question = await tx.question.create({
          data: questionData
        })
        createdQuestions.push(question)
      }

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
