'use client';
import React, { useEffect } from "react";

import Chatbot from "@/components/Chatbot";
import Chatbar from "@/components/Chatbar";
import History from "@/components/History";
import NewConversationModal from "@/components/NewConversationModal";
import { logoutUser, getUser} from '@/utils';
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";


export default function Home() {
 const router = useRouter();  
 const userId = useStore((state) => state.userId);
 const setUserId = useStore((state) => state.setUserId);
 const userName = useStore((state) => state.userName);
 const setUserName = useStore((state) => state.setUserName);
 const setMessages = useStore((state) => state.setMessages);
 useEffect(() => {
   const initializeUser = async () => {
     try {
       const user = await getUser();
       if (user) {
         setUserId(user.$id);
         setUserName(user.name);
       }
     } catch (error) {
       console.error('Failed to get user:', error);
     }
   };
   
   initializeUser();
 }, [setUserId, setUserName]);

 const handleLogout = async () => {
        await logoutUser();
        setUserId('');
        setUserName('')
        setMessages([]); 
        router.push('/login');
    }
  
  return (
    <div className="font-sans flex flex-col items-center justify-start h-screen gap-4 sm:gap-6 md:gap-8 p-2 sm:p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-row items-center justify-between p-2 sm:p-4 w-full">
          <div className="hidden sm:block flex-1"></div>
          <div className="flex items-center justify-center">
            <div className="px-2 sm:px-4 md:px-6 py-1 sm:py-2 bg-marvel-red flex justify-center items-center rounded-sm shadow-md mr-2 sm:mr-4">
              <span className="text-lg sm:text-xl md:text-2xl font-bold tracking-widest text-white">MARVEL</span>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-normal text-marvel-red">Oracle</span>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2 sm:gap-4">
            
            {userId !== '' ? (
              <>
                <span className="hidden sm:inline text-sm font-medium text-white">{userName}</span>
                <button 
                  onClick={handleLogout}
                  className="px-2 sm:px-4 py-1 sm:py-2 bg-red-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : (
              <button 
                onClick={() => router.push('/login')}
                className="px-2 sm:px-4 py-1 sm:py-2 bg-marvel-red text-white text-xs sm:text-sm font-medium rounded-md hover:bg-red-700 transition-colors duration-200"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Section - Responsive layout that changes from column to row */}
      <div className="flex flex-col md:flex-row w-full h-[calc(100%-80px)] md:h-4/5 gap-4 md:gap-6">
        {/* History Section - Full width on mobile, side panel on desktop */}
        <div className="md:w-1/4 w-full h-[30vh] md:h-full">
          <History />
        </div>
        
        {/* Chat Section - Right Side on desktop, below on mobile */}
        <div className="flex-1 flex flex-col gap-2 sm:gap-4 h-[calc(70vh-80px)] md:h-full">
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
