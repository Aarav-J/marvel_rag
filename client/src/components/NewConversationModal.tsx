'use client'
import useStore from '@/store/useStore'
import { createChat } from '@/utils'
import React, { useState } from 'react'

const NewConversationModal = () => {
  const setSelectedChatId = useStore((state) => state.setSelectedChatId)
  const addChat = useStore((state) => state.addChat)
  const newModalOpen = useStore((state) => state.newModalOpen)
  const setNewModalOpen = useStore((state) => state.setNewModalOpen)
  const [chatTitle, setChatTitle] = useState('')
  return (
    <>
      {newModalOpen && (
        <div className='w-screen h-screen flex flex-col items-center justify-center fixed bg-black/[var(--bg-opacity)] [--bg-opacity:50%]  top-0 left-0'>
          <div className='w-1/2 bg-[#0A0A0A] rounded p-6 shadow-lg border border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className="text-lg font-semibold">New Conversation</h2>
              <button onClick={() => setNewModalOpen(false)}>Close</button>
            </div>
            <input type="text" placeholder="Enter chat title" value={chatTitle} onChange={(e) => setChatTitle(e.target.value)} className="border border-gray-600 bg-gray-800 text-white rounded-lg p-2 mb-4 w-full" />
            <button onClick={() => {
              if (chatTitle) {
                addChat(chatTitle)
                setSelectedChatId(chatTitle)
                setChatTitle('')
                createChat(chatTitle)
                setNewModalOpen(false)
              }
            }} className="bg-blue-600 text-white rounded-lg px-4 py-2">Create</button>
          </div>
        </div>
      )}
    </>
  )
}

export default NewConversationModal