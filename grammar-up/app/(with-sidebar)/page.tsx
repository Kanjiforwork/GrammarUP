import Image from "next/image";
import GoogleLoginButton from "@/components/google-login-button";
import { getCurrentUser } from "@/lib/auth/get-user"

export default async function Home() {
  const user = await getCurrentUser()
  
  // If not logged in - show full landing page
  if (!user) {
    return (
      <section className="min-h-screen w-full flex items-center justify-center px-6 relative overflow-hidden bg-white">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left content */}
          <div className="flex flex-col space-y-10 text-center lg:text-left">
            {/* Logo/Title */}
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-900">
                Grammar<span className="text-teal-500">Up</span>
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full mx-auto lg:mx-0" />
              <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed font-light max-w-xl mx-auto lg:mx-0">
                Nâng cao ngữ pháp tiếng Anh của bạn với trải nghiệm học tập được cá nhân hóa bởi AI
              </p>
            </div>
            
            {/* CTA Button - larger and more prominent */}
            <div className="flex justify-center lg:justify-start">
              <GoogleLoginButton />
            </div>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200 max-w-xl mx-auto lg:mx-0">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 mx-auto">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">AI Thông minh</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 mx-auto">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">Bài tập đa dạng</p>
              </div>
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500 mx-auto">
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                  </svg>
                </div>
                <p className="text-sm text-gray-600 font-medium">Theo dõi tiến độ</p>
              </div>
            </div>
          </div>
          
          {/* Right content - Dolphin */}
          <div className="relative flex items-center justify-center">
            <div className="absolute w-[500px] h-[500px] bg-gradient-to-br from-teal-100/30 to-teal-200/20 rounded-full blur-3xl -z-10" />
            <Image 
              src="/dolphin_hello.png" 
              alt="GrammarUp Mascot"
              width={600}
              height={600}
              className="object-contain select-none pointer-events-none"
              priority
            />
          </div>
        </div>
      </section>
    );
  }
  
  // If logged in - show welcome back message
  return (
    <section className="min-h-screen w-full flex items-center justify-center px-6 lg:px-20 relative overflow-hidden bg-white">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left content */}
        <div className="flex flex-col space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-gray-900">
              Grammar<span className="text-teal-500">Up</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-teal-500 to-teal-300 rounded-full" />
          </div>
          
          {/* Welcome message */}
          <div className="space-y-2">
            <p className="text-2xl lg:text-3xl font-semibold text-gray-800">
              Xin chào, <span className="text-teal-600">{user.username}</span>! 👋
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              Chào mừng trở lại! Sẵn sàng tiếp tục hành trình học tập của bạn.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">AI Thông minh</p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">Bài tập đa dạng</p>
            </div>
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-500">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              </div>
              <p className="text-sm text-gray-600 font-medium">Theo dõi tiến độ</p>
            </div>
          </div>
        </div>
        
        {/* Right content - Dolphin */}
        <div className="relative flex items-center justify-center lg:justify-end">
          <div className="absolute w-96 h-96 bg-gradient-to-br from-teal-100/30 to-teal-200/20 rounded-full blur-3xl -z-10" />
          <Image 
            src="/dolphin_hello.png" 
            alt="GrammarUp Mascot"
            width={500}
            height={500}
            className="object-contain select-none pointer-events-none"
            priority
          />
        </div>
      </div>
    </section>
  );
}
