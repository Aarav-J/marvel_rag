import Image from "next/image";
import Chatbot from "@/components/Chatbot";
import Chatbar from "@/components/Chatbar";
import History from "@/components/History";
export default function Home() {
  return (
    <div className="font-sans flex flex-col items-center justify-start h-screen gap-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-row items-center justify-center p-4">
          <div className="px-6 py-2 bg-marvel-red flex justify-center items-center rounded-sm shadow-md mr-4">
            <span className="text-2xl font-bold tracking-widest text-white">MARVEL</span>
          </div>
          <span className="text-2xl font-normal text-marvel-red">Oracle</span>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="flex flex-row w-3/5 h-3/5 gap-6 items-center justify-center">
        {/* History Section - Left Side (30% width) */}
        <div className="w-2/5 h-4/5 flex items-center justify-center">
          <div className="border border-gray-300 shadow-md rounded-lg p-6 w-full h-full">
            History
          </div>
        </div>
        
        {/* Chat Section - Right Side (70% width) */}
        <div className="w-3/5 h-full flex flex-col gap-4">
          {/* Chatbot takes most of the right side height */}
          <div className="flex-1">
            <div className="border border-gray-300 shadow-md rounded-lg p-6 w-full h-full">
              {/* Chatbot content */}
            </div>
          </div>
          
          {/* Chatbar at the bottom */}
          <div className="h-16">
            <div className="border border-gray-300 shadow-md rounded-lg p-4 w-full h-full flex flex-row gap-2 items-center">
              <input 
                type="text" 
                placeholder="Ask away..." 
                className="flex-1 rounded-lg h-10 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-marvel-red" 
              />
              <button className='bg-marvel-red text-white flex items-center justify-center rounded-lg px-4 py-2 h-10'>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
