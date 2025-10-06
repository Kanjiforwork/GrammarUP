'use client'
import { supabase } from '@/lib/supabase/client'

interface GoogleLoginButtonProps {
  isLoggedIn?: boolean
}

export default function GoogleLoginButton({ isLoggedIn = false }: GoogleLoginButtonProps) {
  const handleGoogleLogin = async () => {
    console.log('Starting Google login...')
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false, // Đảm bảo redirect về callback
        }
      })
      
      if (error) {
        console.error('Login error:', error)
      } else {
        console.log('Redirecting to Google...', data)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
    }
  }

  if (isLoggedIn) {
    return null
  }

  return (
    <button 
      onClick={handleGoogleLogin} 
      className="mt-5 px-4 py-4 w-fit text-xl bg-teal-500 text-white rounded-xl hover:bg-teal-400 hover:shadow-2xl transition-all duration-400 ease-in-out"
    >
      BẮT ĐẦU NGAY
    </button>
  )
}