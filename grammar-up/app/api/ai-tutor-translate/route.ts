import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiTutorRateLimiter } from '@/lib/rate/rate_limit'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Bạn cần đăng nhập để sử dụng AI Tutor' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated:', user.id)

    // 2. Rate Limiting
    const { success, limit, remaining, reset } = await aiTutorRateLimiter.limit(user.id)

    if (!success) {
      return NextResponse.json(
        { 
          error: 'Bạn đã hết lượt sử dụng AI Tutor miễn phí (3 lần/ngày).',
          remaining: 0,
          reset: Math.floor(reset / 1000),
        },
        { status: 429 }
      )
    }

    console.log('✅ Rate limit OK:', { remaining, limit })

    // 3. Get request data
    const { question, userAnswer, correctAnswer, questionType } = await request.json()

    if (!question || !userAnswer || !correctAnswer || !questionType) {
      return NextResponse.json(
        { error: 'Thiếu thông tin câu hỏi' },
        { status: 400 }
      )
    }

    console.log('🤖 Calling OpenAI for translation feedback...')

    // 4. OpenAI prompt
    const prompt = `Bạn là một gia sư tiếng Anh Gen Z thân thiện và công bằng.
Học sinh vừa trả lời một câu hỏi tiếng Anh. Nhiệm vụ của bạn là kiểm tra toàn diện — bao gồm cả chính tả, ngữ pháp và cấu trúc câu.

Câu hỏi: ${question}
Đáp án đúng: ${correctAnswer}
Đáp án của học sinh: ${userAnswer}
Loại câu hỏi: ${questionType}

Hãy thực hiện theo thứ tự:
1. Kiểm tra lỗi chính tả hoặc đánh máy.
2. So sánh cấu trúc câu giữa hai đáp án:
   - Chủ ngữ (subject) có giống hoặc phù hợp không?
   - Động từ (verb) có đúng thì và dạng không?
   - Tân ngữ (object) và trật tự từ có đúng không?
3. Sau đó, so sánh ý nghĩa tổng thể — nếu ý nghĩa tương đương nhưng cấu trúc sai, hãy nói rõ lỗi nào sai.
4. Nếu học sinh dùng cấu trúc khác nhưng vẫn diễn đạt đúng ý, hãy ghi nhận điều đó.
5. Giải thích dễ hiểu, thân thiện, không gạch đầu dòng hay số thứ tự.
6. Kết thúc bằng 1 câu khích lệ kiểu: "Cố lên nha, ai cũng sai mà hihi 🙆‍♂️"

Giọng văn: thân thiện, tự nhiên, Gen Z vibe.
Ngắn gọn (tối đa 200 từ), không liệt kê số, không quá hàn lâm.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Bạn là một gia sư tiếng Anh chuyên nghiệp, thân thiện và kiên nhẫn. Bạn giỏi giải thích ngữ pháp một cách đơn giản và dễ hiểu.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300,
    })

    const feedback = completion.choices[0].message.content

    console.log('✅ OpenAI response received')

    // 5. Return response with rate limit info
    return NextResponse.json({ 
      feedback,
      remaining,
      limit,
      reset: Math.floor(reset / 1000),
    }, {
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': Math.floor(reset / 1000).toString(),
      }
    })

  } catch (error: any) {
    console.error('❌ AI Tutor Translate Error:', error)
    
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'OpenAI API đang quá tải, vui lòng thử lại sau' },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      { error: 'Không thể tạo feedback từ AI tutor' },
      { status: 500 }
    )
  }
}
