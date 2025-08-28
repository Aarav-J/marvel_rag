'use client'
import React, { useEffect, useState } from 'react'
import useStore from '@/store/useStore'
import { deleteDocument, getDocument, listChats, updateChatName } from '@/utils'
import { chat } from '@/types'
import ChatContextMenu from './ChatContextMenu'

const History = () => {
  const userId = useStore((state) => state.userId)
  const [showMenu, setShowMenu] = useState(false)
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const chats = useStore((state) => state.chats)
  const setChats = useStore((state) => state.setChats)
  const setMessages = useStore((state) => state.setMessages)
  const selectedChatId = useStore((state) => state.selectedChatId)
  const setNewModalOpen = useStore((state) => state.setNewModalOpen)
  const setSelectedChatId = useStore((state) => state.setSelectedChatId)
  const [deleteDocumentId, setDeleteDocumentId] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const handleDelete = async () => { 
    deleteDocument(deleteDocumentId).then(() => { 
      setChats(chats.filter(chat => chat.id !== deleteDocumentId))
      setMessages([])
      // Clear selectedChatId if we're deleting the currently selected chat
      if (selectedChatId === deleteDocumentId) {
        setSelectedChatId(null)
      }
      setDeleteDocumentId('')
    })
  }

  const handleEditStart = () => {
    const chatToEdit = chats.find(chat => chat.id === deleteDocumentId)
    if (chatToEdit) {
      setEditingChatId(deleteDocumentId)
      setEditingValue(chatToEdit.name)
      setShowMenu(false)
    }
  }

  const handleEditSave = async () => {
    if (editingChatId && editingValue.trim()) {
      try {
        await updateChatName(editingChatId, editingValue.trim())
        // Update local state
        setChats(chats.map(chat => 
          chat.id === editingChatId 
            ? { ...chat, name: editingValue.trim() }
            : chat
        ))
        setEditingChatId(null)
        setEditingValue('')
      } catch (error) {
        console.error('Failed to update chat name:', error)
        // Optionally show error message to user
      }
    }
  }

  const handleEditCancel = () => {
    setEditingChatId(null)
    setEditingValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditSave()
    } else if (e.key === 'Escape') {
      handleEditCancel()
    }
  }
  useEffect(() => { 
    if (userId) {
      console.log("Fetching chats for userId:", userId);
      listChats(userId).then((chats) => {
        console.log("Retrieved chats:", chats);
        const newChats = chats.map((chat) => { 
          return {id: chat.$id, name: chat.chatId}
        })
        setChats(newChats); // This was missing!
      }).catch((error) => {
        console.error("Error fetching chats:", error);
      });
    }
  }, [userId, setChats])
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);
  const onClick = async (chatId: string, chatName: string) => { 
    console.log(chatName)
    setSelectedChatId(chatId)
    const document = await getDocument(chatId) as chat; 
    const messages = document['messages'] || []
    console.log("Messages:", messages)
    setMessages(messages.map(message => JSON.parse(message as unknown as string)))
    console.log(messages.map(message => JSON.parse(message as unknown as string)))
  }
  return (
    <>
    {showMenu && <ChatContextMenu x={x} y={y} onClose={() => setShowMenu(false)} onDelete={handleDelete} onEditName={handleEditStart}/>}
    <div 
    className='border border-gray-600 bg-gray-800 text-white shadow-md rounded-lg p-4 w-full h-full overflow-y-scroll custom-scrollbar overflow-x-hidden'>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Timelines</h3>
        <button className="bg-red-600 text-white text-xs px-2 py-1 rounded cursor-pointer" onClick={() => {setNewModalOpen(true)}}>New</button>
      </div>
      <div className="space-y-2">

        {chats.map((chat) => ( 
            <div 
              onContextMenu={(e) => {
                e.preventDefault()
                setX(e.pageX)
                setY(e.pageY)
                setShowMenu(true)
                setDeleteDocumentId(chat.id)
              }} 
              className={`text-white p-3 rounded ${selectedChatId === chat.id ? 'bg-red-600' : 'bg-gray-700'} overflow-x-clip`} 
              key={chat.id} 
            >
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={editingValue}
                  onChange={(e) => setEditingValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleEditSave}
                  className="w-full bg-transparent border-none outline-none text-white"
                  autoFocus
                />
              ) : (
                <div 
                  className="cursor-pointer"
                  onClick={() => onClick(chat.id, chat.name)}
                >
                  {chat.name || 'Untitled Chat'}
                </div>
              )}
            </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default History