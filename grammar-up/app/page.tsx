import Image from "next/image";
import { Card } from "@/components/ui/card"


export default function Home() {
  return (
    <section className="min-h-dvh w-full flex flex-col lg:flex-row px-8 lg:px-20">
      <div className=" flex flex-col pt-60 ">
        <h1 className="text-7xl pt-10 font-bold text-dolphin">Grammar Up</h1>
        <p className="text-xl font-semibold mt-5">Đến với Grammar Up, bạn có thể học hỏi và cải thiện ngữ pháp một cách cá nhân hoá với gia sư AI</p>
        <button className="mt-5 px-4 py-4 w-fit text-xl bg-dolphin text-white rounded-xl hover:bg-teal-400 hover:shadow-2xl transition-all duration-400 ease-in-out">
          BẮT ĐẦU NGAY
        </button>
        {/* <div className="flex flex-row pt-5 gap-4">
          <Card className="p-2 w-fit " >
            <p className="text-md font-semibold text-teal-700 my-1">Học Ngữ Pháp</p>
          </Card>
          <Card className="p-2 w-fit">
            <p className="text-md font-semibold text-teal-700 my-1">Hỏi Gia Sư</p>
          </Card>
          <Card className="p-2 w-fit">
            <p className="text-md font-semibold text-teal-700 my-1">Luyện tập</p>
          </Card>
        </div> */}

      </div>
      <div className="flex items-center justify-center">
        <img src="../dolphin_hello.png" className="w-170 h-170 object-contain select-none pointer-events-none"></img>
      </div>
    </section>

  );
}
