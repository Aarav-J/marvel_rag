'use client'
import React, { useEffect, useRef } from 'react';
import useStore from '@/store/useStore';



const Chatbot = () => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const selectedChatId = useStore((state) => state.selectedChatId);
    const messages = useStore((state) => state.messages);
    const loading = useStore((state) => state.loading);
    const loadingChatId = useStore((state) => state.loadingChatId);

    
    // Auto-scroll to bottom when messages change or loading starts/stops
    useEffect(() => {
        const scrollToBottom = () => {
            messagesEndRef.current?.scrollIntoView({ 
                behavior: 'smooth',
                block: 'end'
            });
        };
        
        // Small delay to ensure DOM is updated
        const timeoutId = setTimeout(scrollToBottom, 100);
        
        return () => clearTimeout(timeoutId);
    }, [messages, loading]); // Trigger when messages or loading state changes 
    
    return ( 
        <div className="border border-gray-600 bg-gray-800 shadow-md rounded-lg w-full h-full flex flex-col">
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar p-6">
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
                        loading && loadingChatId === selectedChatId && (
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
                    
                    {/* Invisible element to scroll to */}
                    <div ref={messagesEndRef} />
                    
                </div>
                )
            }
            </div>
        </div>
    )
}

export default Chatbot;