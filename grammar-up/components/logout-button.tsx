'use client'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
    const router = useRouter()
    const handleLogout = async () => {
        await supabase.auth.signOut() 
        router.refresh()
        router.push('/')
      }
      
      return (
        <button onClick={handleLogout} className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold">
        Đăng xuất
      </button>
      )
}