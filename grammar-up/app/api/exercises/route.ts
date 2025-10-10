import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function GET() {
  try {
    console.log('🔍 Fetching exercises...')
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
      },
    })

    console.log('✅ Found exercises:', exercises.length)
    return NextResponse.json(exercises)
  } catch (error) {
    console.error('❌ Error fetching exercises:', error)
    // Log the full error details
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
    "answers": ["go, home, bad, not"]
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
        model: 'gpt-4o',
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
      // Manual mode - parse content
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(manualContent)
        questionsData = Array.isArray(parsed) ? parsed : parsed.questions || []
      } catch {
        return NextResponse.json(
          { error: 'Nội dung không đúng định dạng JSON. Vui lòng kiểm tra lại.' },
          { status: 400 }
        )
      }

      if (questionsData.length === 0) {
        return NextResponse.json(
          { error: 'Không tìm thấy câu hỏi nào trong nội dung' },
          { status: 400 }
        )
      }

      console.log(`✅ Parsed ${questionsData.length} questions from manual input`)
    }

    // Step 2: Validate questions structure
    for (const q of questionsData) {
      if (!q.type || !q.prompt || !q.data) {
        return NextResponse.json(
          { error: 'Cấu trúc câu hỏi không hợp lệ. Thiếu type, prompt hoặc data.' },
          { status: 400 }
        )
      }

      const validTypes = ['MCQ', 'CLOZE', 'ORDER', 'TRANSLATE']
      if (!validTypes.includes(q.type)) {
        return NextResponse.json(
          { error: `Loại câu hỏi không hợp lệ: ${q.type}` },
          { status: 400 }
        )
      }
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
