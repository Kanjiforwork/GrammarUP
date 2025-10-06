'use client'

import { LogoutButton } from "@/components/logout-button"

export default function SettingsPage() {
  return (
    <div className="w-full min-h-screen p-8">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">Settings</h1>
      <p className="text-lg text-gray-600 mb-8">Cài đặt ứng dụng</p>
      
      <div className="max-w-2xl space-y-6">
        {/* Logout Button */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Vùng nguy hiểm</h3>
          <LogoutButton></LogoutButton>
        </div>
      </div>
    </div>
  );
}