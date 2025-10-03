'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react' // ← Thêm này
import Link from 'next/link' // ← Thêm này để tạo link
import { User } from '@supabase/auth-helpers-nextjs'

export default function GoogleLoginButton() {
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<User | null>(null) // ← Thêm này
  const [loading, setLoading] = useState(true) // ← Thêm này

  const handleGoogleLogin = async () => {
    console.log('Starting Google login...')
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google'
        // ← Bỏ hết options, để Supabase tự handle
      })
      
      if (error) {
        console.error('Login error:', error)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }
  // Thêm vào trong component
useEffect(() => {
  // Kiểm tra user hiện tại
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }
  
  getUser()
  
  // Lắng nghe thay đổi auth state
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    setUser(session?.user || null)
    setLoading(false)
  })
  
  return () => subscription.unsubscribe()
}, [])
 // Thêm vào cuối component, thay return cũ
if (loading) {
  return (
    <button className="mt-5 px-4 py-4 w-fit text-xl bg-gray-300 text-gray-600 rounded-xl cursor-not-allowed">
      Đang kiểm tra...
    </button>
  )
}

if (user) {
  // Đã đăng nhập → hiện nút "Bắt đầu học"
  return (
    <Link href="/lessons" className="mt-5 px-4 py-4 w-fit text-xl bg-teal-300 text-white rounded-xl hove:bg-lightdolphin hover:shadow-2xl transition-all duration-400 ease-in-out inline-block text-center">
      BẮT ĐẦU HỌC
    </Link>
  )
}

// Chưa đăng nhập → hiện nút login
return (
  <button onClick={handleGoogleLogin} className="mt-5 px-4 py-4 w-fit text-xl bg-dolphin text-white rounded-xl hover:bg-teal-400 hover:shadow-2xl transition-all duration-400 ease-in-out">
    BẮT ĐẦU NGAY
  </button>
)
}
