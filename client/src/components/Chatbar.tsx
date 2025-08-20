'use client'
import React from 'react'
import useStore from '@/store/useStore';
import { useState } from 'react';
const Chatbar = () => {
  const selectedChatId = useStore((state) => state.selectedChatId)
  const [message, setMessage] = useState('')
  const addMessage = useStore((state) => state.addMessage)
  const onClick = () => { 
    if (selectedChatId && message.trim()) {
      addMessage({ chatId: selectedChatId, content: message, role: 'user' })
      addMessage({ chatId: selectedChatId, content: message, role: 'assistant' })
      setMessage('')

    }
  }
  return (
   <div className="border border-gray-600 bg-gray-800 shadow-md rounded-lg p-4 w-full flex flex-row gap-3 items-center">
        <input 
          type="text" 
          disabled={selectedChatId === null}
          value={message}
          onChange={(e) => setMessage(e.target.value)} 
          onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
          placeholder="Ask a Marvel question..." 
          className="flex-1 rounded-lg h-12 px-4 bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent" 
        />
        <button onClick={onClick} className='bg-red-600 text-white flex items-center justify-center rounded-lg px-6 py-3 h-12 hover:bg-red-700 transition-colors'>
          Send
        </button>
    </div>
  )
}

export default Chatbar