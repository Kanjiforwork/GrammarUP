import Image from "next/image";
import { Card } from "@/components/ui/card"
import GoogleLoginButton from "@/components/google-login-button";
import { getCurrentUser } from "@/lib/auth/get-user"


export default async function Home() {
  const user = await getCurrentUser()
  return (
    <section className="min-h-dvh w-full flex flex-col lg:flex-row px-8 lg:px-20">
      <div className=" flex flex-col pt-60 ">
        <h1 className="text-7xl pt-10 font-bold text-dolphin">Grammar Up</h1>
        
        {user ? (
          <p className="text-xl font-semibold mt-5">
            Xin chào, <span className="text-teal-600">{user.username}</span>! 👋
          </p>
        ) : (
          <p className="text-xl font-semibold mt-5">
            Đến với Grammar Up, bạn có thể học hỏi và cải thiện ngữ pháp một cách cá nhân hoá với gia sư AI
          </p>
        )}
        
        {!user && <GoogleLoginButton />}

      </div>
      <div className="flex items-center justify-center">
        <img src="../dolphin_hello.png" className="w-170 h-170 object-contain select-none pointer-events-none"></img>
      </div>
    </section>

  );
}
