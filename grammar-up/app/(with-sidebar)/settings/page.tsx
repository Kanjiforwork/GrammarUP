'use client'

import { useState } from "react"
import { LogoutButton } from "@/components/logout-button"
export default function SettingsPage() {
  const [oceanBackground, setOceanBackground] = useState(() => {
    // Load from localStorage, default to TRUE if not set
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('oceanBackground')
      // If null (never set), return true (default enabled)
      return saved === null ? true : saved === 'true'
    }
    return true // Default to enabled
  })

  const handleToggleBackground = (checked: boolean) => {
    setOceanBackground(checked)
    localStorage.setItem('oceanBackground', checked.toString())
  }

  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Settings</h1>
      <p className="text-lg text-gray-600 mb-8">Cài đặt ứng dụng</p>
      
      <div className="max-w-2xl space-y-6">
        {/* Ocean Background Toggle */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Giao diện</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Nền biển động</p>
              <p className="text-sm text-gray-600">Bật hiệu ứng sóng biển cho trang bài tập</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={oceanBackground}
                onChange={(e) => handleToggleBackground(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-teal-500"></div>
            </label>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Vùng nguy hiểm</h3>
<LogoutButton></LogoutButton>
        </div>
      </div>
    </div>
  );
}