'use client'
import React from 'react'
import useStore from '@/store/useStore'

const History = () => {
  const chats = useStore((state) => state.chats)
  const selectedChatId = useStore((state) => state.selectedChatId)
  const setNewModalOpen = useStore((state) => state.setNewModalOpen)
  const setSelectedChatId = useStore((state) => state.setSelectedChatId)
  return (
    <div className='border border-gray-600 bg-gray-800 text-white shadow-md rounded-lg p-4 w-full h-full'>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Timelines</h3>
        <button className="bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => {setNewModalOpen(true)}}>New</button>
      </div>
      <div className="space-y-2">

        {chats.map((chat) => ( 
            <div className={`text-white p-3 rounded cursor-pointer ${selectedChatId === chat ? 'bg-red-600' : 'bg-gray-700'}`} key={chat} onClick={() => setSelectedChatId(chat)}>
              {chat || 'Untitled Chat'}
            </div>
        ))}
      </div>
    </div>
  )
}

export default History