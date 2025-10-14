import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// GET /api/lessons - Fetch all lessons
export async function GET() {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const lessons = await prisma.lesson.findMany({
      include: {
        unit: {
          select: {
            title: true
          }
        },
        blocks: true,
        _count: {
          select: {
            blocks: true,
            questions: true
          }
        }
      },
      orderBy: [
        { unit: { sortOrder: 'asc' } },
        { sortOrder: 'asc' }
      ]
    })

    return NextResponse.json(lessons)
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json(
      { error: 'Failed to fetch lessons' },
      { status: 500 }
    )
  }
}

// POST /api/lessons - Create new lesson
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lessonName, lessonDescription, additionalRequirements, difficulty, blockCount } = body

    // Validation
    if (!lessonName?.trim()) {
      return NextResponse.json({ error: 'Lesson name is required' }, { status: 400 })
    }

    if (!lessonDescription?.trim()) {
      return NextResponse.json({ error: 'Lesson description is required' }, { status: 400 })
    }

    console.log('📝 Creating lesson with AI:', { lessonName, blockCount, difficulty })

    // Step 1: Generate lesson content using AI
    const prompt = `Bạn là một giáo viên tiếng Anh chuyên nghiệp. Tạo nội dung bài học "${lessonName}" với ${blockCount} blocks.

Thông tin:
- Tên bài học: ${lessonName}
- Mô tả: ${lessonDescription}
- Độ khó: ${difficulty}
- Yêu cầu thêm: ${additionalRequirements || 'Không có'}

CẤU TRÚC BÀI HỌC (${blockCount} blocks):

1. Block INTRO (order: 1):
- title: Tiêu đề bài học (giữ nguyên "${lessonName}")
- subtitle: Mô tả ngắn gọn (1 câu)
- kahootHint: Gợi ý warm-up (ví dụ: "3 câu đúng/sai về...")
- cta: "Bắt đầu học"

2. Block WHAT (order: 2):
- heading: "Dùng để làm gì?"
- content: Giải thích chi tiết công dụng/mục đích sử dụng (2-3 câu)
- examples: Array gồm 2-3 ví dụ, mỗi example có format:
  { en: "câu tiếng Anh", vi: "câu tiếng Việt" }
- notes: Array gồm 1-2 lưu ý quan trọng

3. Block HOW (order: 3):
- heading: "Cấu trúc và cách sử dụng"
- content: Giải thích cấu trúc ngữ pháp với format rõ ràng (sử dụng \\n cho xuống dòng)
  Ví dụ: "Khẳng định: S + V(s/es)\\nPhủ định: S + do/does + not + V\\nNghi vấn: Do/Does + S + V?"
- notes: Array gồm 2-4 quy tắc/lưu ý ngữ pháp quan trọng
- examples: Array gồm 2-3 ví dụ minh họa cấu trúc:
  { en: "câu tiếng Anh", vi: "câu tiếng Việt" }

4. Block REMIND (order: 4):
- question: Câu hỏi ôn tập kiến thức vừa học (về cấu trúc hoặc cách dùng)
- options: Array gồm 4 đáp án
- answerIndex: Index của đáp án đúng (0-3)
- explain: Giải thích tại sao đáp án đó đúng (2-3 câu)

5-${blockCount}. Các block MINIQUIZ (order: 5 đến ${blockCount}):
Tạo ${blockCount - 4} câu hỏi trắc nghiệm để luyện tập, mỗi block có:
- question: Câu hỏi cụ thể (điền từ, chọn đáp án đúng, tìm lỗi sai...)
- options: Array gồm 4 đáp án
- answerIndex: Index của đáp án đúng (0-3)
- explain: Giải thích đáp án (1-2 câu)

Các câu hỏi MINIQUIZ phải:
- Tăng dần độ khó
- Đa dạng (câu khẳng định, phủ định, nghi vấn, lựa chọn từ đúng...)
- Phù hợp độ khó ${difficulty}
- Sát với nội dung đã dạy

QUAN TRỌNG:
- Nội dung phải cụ thể, chi tiết, không dùng placeholder
- Ví dụ phải thực tế, dễ hiểu
- Câu hỏi phải có giá trị luyện tập thực sự
- Đáp án phải chính xác 100%

Trả về CHÍNH XÁC JSON với cấu trúc:
{
  "blocks": [
    {
      "type": "INTRO",
      "order": 1,
      "data": { "title": "...", "subtitle": "...", "kahootHint": "...", "cta": "Bắt đầu học" }
    },
    {
      "type": "WHAT",
      "order": 2,
      "data": {
        "heading": "Dùng để làm gì?",
        "content": "...",
        "examples": [{"en": "...", "vi": "..."}, ...],
        "notes": ["...", "..."]
      }
    },
    {
      "type": "HOW",
      "order": 3,
      "data": {
        "heading": "Cấu trúc và cách sử dụng",
        "content": "...",
        "notes": ["...", "...", "..."],
        "examples": [{"en": "...", "vi": "..."}, ...]
      }
    },
    {
      "type": "REMIND",
      "order": 4,
      "data": {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answerIndex": 0,
        "explain": "..."
      }
    },
    {
      "type": "MINIQUIZ",
      "order": 5,
      "data": {
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "answerIndex": 0,
        "explain": "..."
      }
    }
    // ... more MINIQUIZ blocks
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Bạn là giáo viên tiếng Anh chuyên nghiệp với kinh nghiệm soạn giáo án. Tạo nội dung bài học chi tiết, cụ thể, có giá trị giáo dục cao. Chỉ trả về JSON, không giải thích thêm.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')
    const blocks = result.blocks || []

    if (blocks.length === 0) {
      throw new Error('AI không tạo được nội dung bài học')
    }

    console.log(`✅ AI generated ${blocks.length} blocks`)

    // Step 2: Validate block structure
    const requiredBlocks = ['INTRO', 'WHAT', 'HOW', 'REMIND']
    const blockTypes = blocks.map((b: any) => b.type)
    
    for (const requiredType of requiredBlocks) {
      if (!blockTypes.includes(requiredType)) {
        throw new Error(`Thiếu block bắt buộc: ${requiredType}`)
      }
    }

    // Step 3: Create lesson and blocks in database
    const lesson = await prisma.$transaction(async (tx) => {
      // Get or create unit
      let unit = await tx.unit.findFirst({
        where: { title: 'Generated Lessons' }
      })
      
      if (!unit) {
        unit = await tx.unit.create({
          data: {
            title: 'Generated Lessons',
            description: 'AI-generated lesson content',
            sortOrder: 999
          }
        })
      }

      // Create lesson
      const newLesson = await tx.lesson.create({
        data: {
          title: lessonName.trim(),
          description: lessonDescription.trim(),
          unitId: unit.id,
          sortOrder: 0
        }
      })

      // Create all blocks
      const blockData = blocks.map((block: any) => ({
        lessonId: newLesson.id,
        type: block.type,
        order: block.order,
        data: block.data
      }))

      await tx.lessonBlock.createMany({
        data: blockData
      })

      return newLesson
    })

    // Step 4: Return created lesson with blocks
    const createdLesson = await prisma.lesson.findUnique({
      where: { id: lesson.id },
      include: {
        unit: true,
        blocks: {
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            blocks: true,
            questions: true
          }
        }
      }
    })

    console.log('🎉 Lesson created successfully:', createdLesson?.id)

    return NextResponse.json({ 
      lesson: createdLesson,
      message: 'Lesson created successfully',
      blocksCreated: blocks.length
    })

  } catch (error) {
    console.error('❌ Error creating lesson:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || 'Không thể tạo bài học' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi không xác định' },
      { status: 500 }
    )
  }
}