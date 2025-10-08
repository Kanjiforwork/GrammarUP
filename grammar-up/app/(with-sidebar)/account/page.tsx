'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AccountPage() {
  const [userEmail, setUserEmail] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserEmail(user.email || '')
        setUserName(user.user_metadata?.name || user.user_metadata?.full_name || '')
      }
      
      setIsLoading(false)
    }
    
    loadUser()
  }, [])

  // Show loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Account</h1>
      <p className="text-lg text-gray-600 mb-8">Quản lý tài khoản của bạn</p>
      
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Thông tin cá nhân</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-lg text-gray-800">
                {userEmail || 'Chưa có thông tin'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Tên</label>
              <p className="text-lg text-gray-800">
                {userName || 'Chưa có thông tin'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Tiến độ học tập</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Bài học hoàn thành</p>
              <p className="text-2xl font-bold text-blue-600">5/20</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bài tập hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">12/50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}