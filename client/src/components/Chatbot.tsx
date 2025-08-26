'use client'
import React, { useEffect } from 'react';
import useStore from '@/store/useStore';
import { message } from '@/types';
import { getUser } from '@/utils';
import { logoutUser } from '@/utils';
import { useRouter } from 'next/navigation';
const Chatbot = () => {
    
    const selectedChatId = useStore((state) => state.selectedChatId);
    const messages = useStore((state) => state.messages);
    const loading = useStore((state) => state.loading);
    const router = useRouter(); 
    
    return ( 
        <div className="border border-gray-600 bg-gray-800 shadow-md rounded-lg w-full h-full flex flex-col">

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                {
                    !selectedChatId ? ( 
                        <span className="text-gray-500">Select a timeline to start chatting!</span>
                    ) : (
                    <div className="space-y-4">


                        {
                        messages.map((message, index) => (
                            <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                                {message.role === 'user' ? (
                                    <>
                                        <div className="bg-red-600 text-white p-3 rounded-lg max-w-md">
                                            {message.content}
                                        </div>
                                        <div className="bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                    You
                                        </div>
                                    </>) : 
                                    ( 
                                        <>
                                            <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                                M
                                            </div>
                                            <div className="bg-gray-700 text-white p-3 rounded-lg max-w-md">
                                                {message.content}
                                            </div>
                                        </>
                                    )
                                }
                                
                            </div>
                        ))
                        
                    }
                    
                    {
                        loading && (
                            <div className="flex items-start gap-3">
                                <div className="bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                    M
                                </div>
                                <div className="bg-gray-700 text-white p-3 rounded-lg max-w-md flex items-center gap-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
                                    </div>
                                    <span className="text-sm">Thinking...</span>
                                </div>
                            </div>
                        )
                    }
                    
                </div>
                )
            }
            </div>
        </div>
    )
}

export default Chatbot;