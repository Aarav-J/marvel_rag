import {create} from 'zustand'; 
import {message} from '../types';
interface StoreState { 
    chats: string[]; 
    messages: message[];
    setChats: (chats: string[]) => void;
    selectedChatId: string | null;
    setSelectedChatId: (chatId: string | null) => void;
    addChat: (chatId: string) => void; 
    addMessage: (message: message) => void; 
    setMessages: (messages: message[]) => void;
    newModalOpen: boolean;
    setNewModalOpen: (isOpen: boolean) => void;
    loading: boolean; 
    setLoading: (loading: boolean) => void;
    userId: string
    setUserId: (userId: string) => void;
}

const useStore = create<StoreState>((set) => ({
    userId: '', 
    setUserId: (userId: string) => set({ userId: userId }),
    chats: [],
    selectedChatId: null,
    messages: [],
    setMessages: (messages: message[]) => set({ messages: messages }),
    newModalOpen: false, 
    setChats: (chats: string[]) => set({ chats: chats }),
    setNewModalOpen: (isOpen: boolean) => set({ newModalOpen: isOpen }),
    setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
    addChat: (chatId) => set((state) => ({ chats: [...state.chats, chatId] })),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    loading: false, 
    setLoading: (loading: boolean) => set({ loading: loading }),
}));

export default useStore;