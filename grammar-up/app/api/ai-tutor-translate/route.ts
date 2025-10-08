import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer, questionType } = await request.json()

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

    return NextResponse.json({ feedback })
  } catch (error) {
    console.error('AI Tutor Translate Error:', error)
    return NextResponse.json(
      { error: 'Không thể tạo feedback từ AI tutor' },
      { status: 500 }
    )
  }
}