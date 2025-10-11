'use client'

import Image from 'next/image'
import GoogleLoginButton from './google-login-button'

interface LoginGateProps {
  message?: string
}

export function LoginGate({ message = "Vui lòng đăng nhập để tiếp tục" }: LoginGateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-md px-6">
        {/* Dolphin mascot */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl scale-150" />
            <Image
              src="/dolphin_hello.png"
              alt="GrammarUp mascot"
              width={140}
              height={140}
              className="relative object-contain"
              priority
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            Grammar<span className="text-teal-500">Up</span>
          </h1>
          <p className="text-sm text-gray-500">
            {message}
          </p>
        </div>

        {/* Login button */}
        <div className="flex flex-col items-center gap-4">
          <GoogleLoginButton />
          
          {/* Divider */}
          <div className="w-full flex items-center gap-4 my-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400">Miễn phí</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Features */}
          <div className="w-full space-y-3">
            {[
              'AI phản hồi thông minh',
              'Bài tập đa dạng',
              'Theo dõi tiến độ'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
