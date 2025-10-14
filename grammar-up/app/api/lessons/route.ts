import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-user'
import { prisma } from '@/lib/prisma'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// ✅ Add cache configuration
export const revalidate = 60 // Revalidate every 60 seconds
export const dynamic = 'force-dynamic' // Always get fresh data for user-specific content

// GET /api/lessons - Fetch all lessons
export async function GET() {
  try {
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

    // ✅ OPTIMIZED: Only select necessary fields, avoid loading heavy blocks data
    const lessons = await prisma.lesson.findMany({
      where: {
        OR: [
          { createdById: userId },
          { source: 'OFFICIAL' }
        ]
      },
      select: {
        id: true,
        title: true,
        description: true,
        source: true,
        createdAt: true,
        unit: {
          select: {
            title: true
          }
        },
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

    // ✅ Add cache headers for better performance
    return NextResponse.json(lessons, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      }
    })
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

    // ✅ REMOVED strict validation - let AI generate and let user judge quality

    // Step 1: Generate lesson content using AI
    const prompt = `Bạn là chuyên gia tạo bài học tiếng Anh. Hãy tạo một bài học về:

📌 CHỦ ĐỀ: "${lessonName}"
📝 MÔ TẢ: "${lessonDescription}"
📋 YÊU CẦU THÊM: ${additionalRequirements || 'Không có - bạn tự do sáng tạo!'}

💡 HƯỚNG DẪN:
- User muốn học về "${lessonName}"
- Nếu user cho chi tiết → làm theo yêu cầu đó
- Nếu user chỉ cho tiêu đề ngắn → bạn tự phát triển nội dung hữu ích
- Tạo bài học thực tế, dễ hiểu, sinh động

📊 CẤU TRÚC BÀI HỌC:
Bài học có ${blockCount || 4} blocks theo thứ tự:

1. **INTRO** (Giới thiệu):
   - Chào mừng học viên
   - Giải thích học viên sẽ học được gì
   - Tạo động lực

2. **WHAT** (Lý thuyết):
   - Giải thích kiến thức cốt lõi
   - Ví dụ minh họa
   - Cấu trúc/công thức (nếu có)

3. **HOW** (Thực hành):
   - Hướng dẫn vận dụng
   - Các bước thực hiện
   - Tips & tricks

4. **REMIND** (Nhắc nhở):
   - Tổng kết điểm quan trọng
   - Lời khuyên cuối cùng
   - Động viên

📄 ĐỊNH DẠNG JSON TRẢ VỀ:
{
  "blocks": [
    {
      "type": "INTRO",
      "order": 1,
      "data": {
        "title": "Welcome to...",
        "content": "Detailed introduction text...",
        "examples": []
      }
    },
    {
      "type": "WHAT",
      "order": 2,
      "data": {
        "title": "What is...",
        "content": "Theory explanation...",
        "examples": ["Example 1", "Example 2"]
      }
    },
    {
      "type": "HOW",
      "order": 3,
      "data": {
        "title": "How to use...",
        "content": "Step by step guide...",
        "examples": ["Usage example 1"]
      }
    },
    {
      "type": "REMIND",
      "order": 4,
      "data": {
        "title": "Remember",
        "content": "Key takeaways...",
        "examples": []
      }
    }
  ]
}

✨ LƯU Ý:
- Nội dung bằng Tiếng Anh (hoặc theo ngôn ngữ user yêu cầu)
- Dễ hiểu, thực tế, có giá trị học tập
- Ví dụ cụ thể, không dùng placeholder
- Chỉ trả về JSON, không giải thích thêm`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Bạn là giáo viên tiếng Anh chuyên nghiệp. Tạo nội dung bài học sinh động, dễ hiểu, có giá trị thực tế. Luôn tạo nội dung ngay cả khi yêu cầu đơn giản - hãy sáng tạo và phát triển thành bài học chất lượng. Chỉ trả về JSON.'
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
    // ✅ OPTIMIZED: Use shorter transaction with createMany
    const lesson = await prisma.$transaction(async (tx) => {
      // Get user from database
      const dbUser = await tx.user.findUnique({
        where: { email: user.email }
      })

      if (!dbUser) {
        throw new Error('User not found')
      }

      // Get or create unit for user-generated lessons
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

      // ✅ Create lesson WITH createdById and source
      const newLesson = await tx.lesson.create({
        data: {
          title: lessonName.trim(),
          description: lessonDescription.trim(),
          unitId: unit.id,
          sortOrder: 0,
          createdById: dbUser.id,
          source: 'USER_CREATED',
          isPublic: false
        }
      })

      // ✅ OPTIMIZED: Use createMany instead of loop
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
    }, {
      timeout: 15000, // ✅ Increase timeout to 15s for Vercel
      maxWait: 5000,  // ✅ Max wait for connection
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