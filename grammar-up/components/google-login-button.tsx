'use client'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function GoogleLoginButton() {
  const supabase = createClientComponentClient()

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
  return (
    <button onClick={handleGoogleLogin} className="mt-5 px-4 py-4 w-fit text-xl bg-dolphin text-white rounded-xl hover:bg-teal-400 hover:shadow-2xl transition-all duration-400 ease-in-out">
    BẮT ĐẦU NGAY
  </button>
  );
}
