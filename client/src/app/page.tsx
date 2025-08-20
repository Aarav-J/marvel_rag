import Image from "next/image";
import Chatbot from "@/components/Chatbot";
import Chatbar from "@/components/Chatbar";
import History from "@/components/History";
import NewConversationModal from "@/components/NewConversationModal";
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
      <div className="flex flex-row w-full h-4/5 gap-6">
        {/* History Section - Left Side */}
        <div className="w-1/4">
          <History />
        </div>
        
        {/* Chat Section - Right Side */}
        <div className="flex-1 flex flex-col gap-4 h-full">
          {/* Chatbot takes most of the space */}
          <div className="flex-1 min-h-0">
            <Chatbot />
          </div>
          
          {/* Chatbar at the bottom */}
          <div className="flex-shrink-0">
            <Chatbar />
          </div>
        </div>
      </div>
      <NewConversationModal />
    </div>
  );
}
