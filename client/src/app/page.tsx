'use client';
import React, { useEffect } from "react";
import Image from "next/image";
import Chatbot from "@/components/Chatbot";
import Chatbar from "@/components/Chatbar";
import History from "@/components/History";
import NewConversationModal from "@/components/NewConversationModal";
import { logoutUser, getUser} from '@/utils';
import { useRouter } from "next/navigation";
import useStore from "@/store/useStore";

import CookieButton from "@/components/button";

export default function Home() {
 const router = useRouter();  
 const userId = useStore((state) => state.userId);
 const setUserId = useStore((state) => state.setUserId);
 const setMessages = useStore((state) => state.setMessages);
 useEffect(() => {
   const initializeUser = async () => {
     try {
       const user = await getUser();
       if (user) {
         setUserId(user.$id);
       }
     } catch (error) {
       console.error('Failed to get user:', error);
     }
   };
   
   initializeUser();
 }, [setUserId]);

 const handleLogout = async () => {
        await logoutUser();
        setUserId('');
        setMessages([]); 
        router.push('/login');
    }
    const handleGetUser = async () => {
        
        console.log("fetching user...");
        const user = await getUser();
        console.log(user);
        if (user) {
          setUserId(user.$id);
        }
    } 
  return (
    <div className="font-sans flex flex-col items-center justify-start h-screen gap-8 p-8">
      {/* Header Section */}
      <div className="flex flex-col items-center justify-center w-full">
        <div className="flex flex-row items-center justify-between p-4 w-full">
          <div className="flex-1"></div>
          <div className="flex items-center justify-center">
            <div className="px-6 py-2 bg-marvel-red flex justify-center items-center rounded-sm shadow-md mr-4">
              <span className="text-2xl font-bold tracking-widest text-white">MARVEL</span>
            </div>
            <span className="text-2xl font-normal text-marvel-red">Oracle</span>
          </div>
          <div className="flex-1 flex justify-end items-center gap-2">
            {userId !== '' ? (
              <button onClick={handleLogout}>Logout</button>
            ) : (
              <button onClick={() => router.push('/login')}>Login</button>
            )}
            <button onClick={handleGetUser}>Get user</button>
            <CookieButton />
          </div>
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
