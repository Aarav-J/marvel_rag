import Image from "next/image";
import Chatbot from "@/components/Chatbot";
import Chatbar from "@/components/Chatbar";
import History from "@/components/History";
export default function Home() {
  return (
    <div className="font-sans items-center flex flex-col justify-items-center h-screen gap-16 ">
      <div className="flex flex-col items-center justify-center mb-8 w-9/10 gap-10 h-9/10 ">
        <div className="flex flex-col justify-center">
          <div className="flex flex-row items-center justify-center p-4">
            <div className="px-6 py-2 bg-marvel-red flex justify-center items-center rounded-sm shadow-md mr-4">
              <span className="text-2xl font-bold tracking-widest text-white">MARVEL</span>
            </div>
            <span className="text-2xl font-normal text-marvel-red">Oracle</span>
          </div>
        </div>
        <div>
          <div className="flex flex-row items-center justify-between w-full h-full">
            <History/>
            <div className="w flex flex-col items-center justify-center">
              <Chatbot />
              <Chatbar />
            </div>
            
            
            </div>
        </div>
      </div>
    </div>

  );
}
