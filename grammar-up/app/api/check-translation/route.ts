import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { vietnameseText, userAnswer, suggestedAnswer } = await request.json()

    if (!vietnameseText || !userAnswer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const prompt = `Bạn là giáo viên tiếng Anh CHUYÊN NGHIỆP và YÊU CẦU CAO. Nhiệm vụ: kiểm tra câu dịch có ĐÚNG không.

Câu tiếng Việt: "${vietnameseText}"
Câu dịch của học sinh: "${userAnswer}"
Đáp án tham khảo: "${suggestedAnswer}"

QUY TẮC CHẤM ĐIỂM (NGHIÊM NGẶT):

✅ CHẤP NHẬN khi và chỉ khi:
1. ĐÚNG NGHĨA hoàn toàn với câu tiếng Việt
2. NGỮ PHÁP hoàn hảo 100% (KHÔNG có lỗi ngữ pháp dù nhỏ), thiếu dấu chấm hoặc dấu phẩy cuối câu bỏ qua
3. CHÍNH TẢ hoàn hảo 100% (KHÔNG có lỗi chính tả dù nhỏ)
4. Sử dụng ĐÚNG THÌ (ví dụ: Present Perfect khi yêu cầu)
5. Có thể chấp nhận các cách diễn đạt TƯƠNG ĐƯƠNG nếu đáp ứng 4 điều trên:
   - "go home" = "come home" = "get home" = "arrive home"
   - "like" = "enjoy" = "love"
   - "learn" = "study"
   - "to + V" = "V-ing" (với một số động từ như like, love)
   - "have/has" = "'ve/'s" (viết tắt hợp lệ)

❌ BÁO SAI nếu có BẤT KỲ lỗi nào sau:
- Sai nghĩa
- Sai ngữ pháp (kể cả lỗi nhỏ: thiếu s/es, sai động từ, sai giới từ, sai thì...)
- Sai chính tả (kể cả lỗi nhỏ: "enjoi" thay vì "enjoy", "studyed" thay vì "studied"...)
- Sai dấu câu cơ bản (thiếu dấu chấm câu, thiếu apostrophe trong viết tắt...)
- Dùng sai thì
- Thiếu/thừa mạo từ (a/an/the) khi cần thiết
- Nếu Là nơi chốn: Hanoi, Ha Noi thì y như nhau, Cả hai đều đúng

⚠️ LƯU Ý:
- Viết hoa/thường đầu câu: không viết hoa chữ cái đầu câu
- Dấu chấm cuối câu: có thể bỏ qua (không bắt buộc)

Trả về JSON (CHỈ JSON, không gì khác):
{
  "isCorrect": true hoặc false
}

Ví dụ:
✅ ĐÚNG: "I have been to Vietnam." / "I have been to Vietnam" (cả 2 đều ok)
✅ ĐÚNG: "She has never eaten sushi."
❌ SAI: "she has never eaten sushi" (thiếu viết hoa đầu câu)
❌ SAI: "She has never ate sushi" (sai ngữ pháp: ate → eaten)
❌ SAI: "She has never eated sushi" (sai chính tả: eated → eaten)
❌ SAI: "She never eat sushi" (sai thì: thiếu has)
❌ SAI: "I have been Vietnam" (sai ngữ pháp: thiếu "to")`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a STRICT English teacher. Accept equivalent expressions ONLY if grammar and spelling are 100% correct. Always respond in valid JSON format only.'
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