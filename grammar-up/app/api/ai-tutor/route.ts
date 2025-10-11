import OpenAI from 'openai'
import { NextRequest, NextResponse } from 'next/server'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { question, userAnswer, correctAnswer, questionType } = await request.json()

    const prompt = `You are a friendly Gen Z English tutor. A student just answered an English question.

Question: ${question}
Student's answer: ${userAnswer}
Expected correct answer: ${correctAnswer}
Question type: ${questionType}

YOUR TASK:
1. First, independently analyze if the student's answer is grammatically correct
2. Check for spelling, grammar, and sentence structure errors
3. Compare with the expected answer
4. If the student is ACTUALLY CORRECT but different from expected answer, acknowledge it!

IMPORTANT: 
- The "correct answer" might be wrong! Use your grammar expertise to judge.
- For "Neither...nor" / "Either...or": verb agrees with CLOSEST subject
- Be fair and accurate in your assessment

Response format (in Vietnamese, Gen Z friendly):
1. Greeting: Use "Hế lu" or "À câu này..." (1 line)
2. Analysis: 
   - If student is WRONG: Explain why (grammar rules, spelling, etc.)
   - If student is ACTUALLY RIGHT but marked wrong: "Ê khoan, câu này bạn làm đúng mà! Đáp án gợi ý có vẻ bị nhầm..."
   - If expected answer is wrong: Point it out clearly
3. Correct explanation: Explain the right grammar rule

Tone: Friendly, natural, Gen Z vibe
Length: Max 200 words, no numbered lists, not too academic

Think step by step before responding.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // ← Upgraded to GPT-4o
      messages: [
        {
          role: 'system',
          content: 'You are an expert English grammar tutor who is friendly, fair, and accurate. You can detect when provided "correct answers" are actually wrong. Always prioritize grammatical correctness over the given answer.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 400,
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