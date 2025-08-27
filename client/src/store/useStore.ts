import {create} from 'zustand'; 
import {message} from '../types';
type Chat = { 
    id: string, 
    name: string, 
}
interface StoreState { 
    chats: Chat[]; 
    messages: message[];
    setChats: (chats: Chat[]) => void;
    selectedChatId: string | null;
    setSelectedChatId: (chatId: string | null) => void;
    addChat: (chatId: Chat) => void; 
    addMessage: (message: message) => void; 
    setMessages: (messages: message[]) => void;
    setLoadingChatId: (chatId: string | null) => void;
    loadingChatId: string | null;
    newModalOpen: boolean;
    setNewModalOpen: (isOpen: boolean) => void;
    loading: boolean; 
    setLoading: (loading: boolean) => void;
    userId: string
    setUserId: (userId: string) => void;
    userName: string; 
    setUserName: (userName: string) => void;
}

const useStore = create<StoreState>((set) => ({
    userId: '', 
    setUserId: (userId: string) => set({ userId: userId }),
    userName: '', 
    setUserName: (userName: string) => set({ userName: userName }),
    chats: [],
    selectedChatId: null,
    messages: [],
    loadingChatId: null,
    setLoadingChatId: (chatId: string | null) => set({ loadingChatId: chatId }),
    setMessages: (messages: message[]) => set({ messages: messages }),
    newModalOpen: false, 
    setChats: (chats: Chat[]) => set({ chats: chats }),
    setNewModalOpen: (isOpen: boolean) => set({ newModalOpen: isOpen }),
    setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
    addChat: (chat: Chat) => set((state) => ({ chats: [...state.chats, chat] })),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    loading: false, 
    setLoading: (loading: boolean) => set({ loading: loading }),
}));

export default useStore;