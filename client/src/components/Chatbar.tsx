'use client'
import React from 'react'
import useStore from '@/store/useStore';
import { useState } from 'react';
import {query} from '@/utils';
import { queryResponse } from '@/types';
import { addMessageToChat } from '@/utils';
const Chatbar = () => {
  const selectedChatId = useStore((state) => state.selectedChatId)
  const chats = useStore((state) => state.chats)
  const [message, setMessage] = useState('')
  const addMessage = useStore((state) => state.addMessage)
  const setLoading = useStore((state) => state.setLoading)
  const setLoadingChatId = useStore((state) => state.setLoadingChatId)

  
  const onClick = () => { 
    if (selectedChatId && message.trim()) {
      // Find the chat name from the selectedChatId
      const selectedChat = chats.find(chat => chat.id === selectedChatId);
      const chatName = selectedChat?.name || selectedChatId;
      
      addMessage( {'role': 'user', 'content': message} )
      addMessageToChat( selectedChatId, {role: 'user', content: message, })
      setLoading(true)
      setLoadingChatId(selectedChatId);
      query(message, selectedChatId).then((response: queryResponse) => {
        addMessage( {'role': 'assistant', 'content': response['response']} )
        addMessageToChat( selectedChatId, {role: 'assistant', content: response['response'], })
      }).finally(() => {
        setLoading(false)
        setLoadingChatId(null);
      })
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