import {create} from 'zustand'; 
import {message} from '../types';
interface StoreState { 
    chats: string[]; 
    messages: message[];
    selectedChatId: string | null;
    setSelectedChatId: (chatId: string | null) => void;
    addChat: (chatId: string) => void; 
    addMessage: (message: message) => void; 
    newModalOpen: boolean;
    setNewModalOpen: (isOpen: boolean) => void;
    loading: boolean; 
    setLoading: (loading: boolean) => void;
}

const useStore = create<StoreState>((set) => ({
    chats: [],
    selectedChatId: null,
    messages: [],
    newModalOpen: false, 
    setNewModalOpen: (isOpen: boolean) => set({ newModalOpen: isOpen }),
    setSelectedChatId: (chatId) => set({ selectedChatId: chatId }),
    addChat: (chatId) => set((state) => ({ chats: [...state.chats, chatId] })),
    addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
    loading: false, 
    setLoading: (loading: boolean) => set({ loading: loading }),
}));

export default useStore;