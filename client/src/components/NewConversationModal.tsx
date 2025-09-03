'use client'
import useStore from '@/store/useStore'
import { createChat } from '@/utils'
import React, { useState } from 'react'

const NewConversationModal = () => {
  const setSelectedChatId = useStore((state) => state.setSelectedChatId)
  const addChat = useStore((state) => state.addChat)
  const setMessages = useStore((state) => state.setMessages)
  const newModalOpen = useStore((state) => state.newModalOpen)
  const setNewModalOpen = useStore((state) => state.setNewModalOpen)
  const [chatTitle, setChatTitle] = useState('')
  const userId = useStore((state) => state.userId);

  const handleAddChat = async () => { 
    try {
      const docId: string = await createChat(chatTitle, userId);
      addChat({id: docId, name: chatTitle});
      setSelectedChatId(docId); // Use document ID instead of chat title
      setChatTitle('');
      setMessages([]);
      setNewModalOpen(false);
    } catch (error) {
      console.error("Failed to create chat:", error);
    }
  }
  return (
    <>
      {newModalOpen && (
        <div className='w-screen h-screen flex flex-col items-center justify-center fixed bg-black/[var(--bg-opacity)] [--bg-opacity:50%] top-0 left-0 z-50 p-4'>
          <div className='w-full sm:w-3/4 md:w-1/2 lg:w-2/5 bg-[#0A0A0A] rounded p-3 sm:p-6 shadow-lg border border-gray-700'>
          <div className='flex items-center justify-between mb-3 sm:mb-4'>
              <h2 className="text-base sm:text-lg font-semibold">New Conversation</h2>
              <button 
                onClick={() => setNewModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm sm:text-base"
              >
                Close
              </button>
            </div>
            <input 
              type="text" 
              placeholder="Enter chat title" 
              value={chatTitle} 
              onChange={(e) => setChatTitle(e.target.value)} 
              className="border border-gray-600 bg-gray-800 text-white rounded-lg p-2 mb-4 w-full text-sm sm:text-base" 
            />
            <button 
              onClick={() => {
                if (chatTitle) {
                  handleAddChat()
                }
              }} 
              className="bg-red-600 text-white rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base"
            >
              Create
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default NewConversationModal