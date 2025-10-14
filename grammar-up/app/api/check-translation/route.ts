import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { vietnameseText, userAnswer } = await request.json()

    if (!vietnameseText || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = `Bạn là giáo viên tiếng Anh CHUYÊN NGHIỆP và CÔNG BẰNG. Nhiệm vụ: kiểm tra câu dịch có ĐÚNG về NGỮ PHÁP và NGHĨA không.

Câu tiếng Việt: "${vietnameseText}"
Câu dịch của học sinh: "${userAnswer}"

QUY TẮC CHẤM ĐIỂM:

✅ CHẤP NHẬN khi đáp ứng 3 điều chính:
1. ĐÚNG NGHĨA hoàn toàn với câu tiếng Việt
2. NGỮ PHÁP đúng 100% (cấu trúc câu, thì, động từ, giới từ...)
3. CHÍNH TẢ đúng của các từ

✅ BỎ QUA các vấn đề sau (KHÔNG tính là lỗi):
- Viết hoa/thường chữ cái đầu câu (chấp nhận cả "They..." và "they...")
- Dấu chấm cuối câu (chấp nhận cả có và không có)
- Dấu phẩy không quan trọng
- Khoảng trắng thừa/thiếu

✅ CHẤP NHẬN các cách diễn đạt TƯƠNG ĐƯƠNG nếu đúng nghĩa:
- Các thì tương đương khi phù hợp: 
  * "I finished" = "I have finished" (khi không có context cụ thể)
  * "I have been to" = "I visited" = "I went to"
- Viết tắt: "don't" = "do not", "I've" = "I have"
- Động từ tương đương: "like to eat" = "like eating", "go" = "come" = "get to", "learn" = "study"
- Tính từ/trạng từ tương đương: "like" = "enjoy" = "love"
- Tên địa danh: "Hanoi" = "Ha Noi" = "Hà Nội"

✅ LINH HOẠT về THÌ:
- Nếu câu tiếng Việt có "đã" → chấp nhận cả Past Simple VÀ Present Perfect
  * "Tôi đã hoàn thành" → "I finished" ✅ HOẶC "I have finished" ✅
  * "Tôi đã đi" → "I went" ✅ HOẶC "I have been" ✅
- Nếu không có context thời gian cụ thể → cả 2 thì đều đúng

❌ CHỈ BÁO SAI khi có lỗi THỰC SỰ:
- Sai nghĩa hoàn toàn
- Sai ngữ pháp rõ ràng: thiếu s/es bắt buộc, sai động từ, sai giới từ, sai cấu trúc
- Sai chính tả TỪ (ví dụ: "enjoi" → "enjoy", "studyed" → "studied")
- Dùng sai thì KHI có dấu hiệu rõ ràng (yesterday → phải Past, for 5 years → phải Present Perfect)
- Thiếu/thừa mạo từ a/an/the khi BẮT BUỘC

VÍ DỤ ĐÚNG:
✅ "they don't like to eat vegetables" (đúng nghĩa, ngữ pháp, chính tả)
✅ "They don't like to eat vegetables." (có viết hoa và dấu chấm)
✅ "they do not like eating vegetables" (cách diễn đạt tương đương)
✅ "i have finished my homework" (đúng nghĩa, ngữ pháp - không cần viết hoa)
✅ "I have finished my homework" (có viết hoa)
✅ "i finished my homework" (dùng Past Simple - cũng đúng nếu không có context)
✅ "I have been to Vietnam" (Present Perfect)
✅ "I went to Vietnam" (Past Simple - cũng đúng)

VÍ DỤ SAI:
❌ "they doesnt like eat vegetables" (sai: doesnt → don't, thiếu "to")
❌ "they dont likes to eat vegetables" (sai: likes → like)
❌ "i have finish my homework" (sai: finish → finished)
❌ "i has finished my homework" (sai: has → have)

Trả về JSON (CHỈ JSON):
{
  "isCorrect": true hoặc false
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a FAIR English teacher. Accept equivalent expressions and tenses if grammar and meaning are correct. Always respond in valid JSON format only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      )
    }

    const parsed = JSON.parse(result)
    
    return NextResponse.json({
      isCorrect: parsed.isCorrect
    })

  } catch (error) {
    console.error('Error checking translation:', error)
    return NextResponse.json(
      { error: 'Failed to check translation', isCorrect: false },
      { status: 500 }
    )
  }
}