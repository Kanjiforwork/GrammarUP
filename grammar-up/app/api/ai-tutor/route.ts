import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer, questionType } = await request.json()

    const prompt = `Bạn là một gia sư tiếng Anh Gen Z thân thiện và kiên nhẫn. Học sinh vừa trả lời sai một câu hỏi ngữ pháp.

Câu hỏi: ${question}
Đáp án đúng: ${correctAnswer}
Đáp án của học sinh: ${userAnswer}
Loại câu hỏi: ${questionType}

Hãy:
- Chào học viên, dùng 1 trong 3 cụm sau: Hế lu, À câu này hơi mẹo nè (Nếu mẹo), À câu này không khó đâu (Nếu dễ)
- Giải thích tại sao đáp án của học sinh sai (ngắn gọn, dễ hiểu)
- Giải thích tại sao đáp án đúng là đúng
- Khuyến khích học sinh (1 câu ngắn): "Cố lên nha, ai cũng sai mà hihi" 🙆‍♂️ hoặc tương tự

Trả lời bằng tiếng Việt, giọng điệu thân thiện, Gen Z, Tối đa 150 từ.  `

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
    console.error('AI Tutor Error:', error)
    return NextResponse.json(
      { error: 'Không thể tạo feedback từ AI tutor' },
      { status: 500 }
    )
  }
}