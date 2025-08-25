import { Models } from "appwrite"

export type message = {
    role: 'user' | 'assistant'
    chatId: string
    content: string
}

export type queryResponse = { 
    response: string
    query: string
}

export interface chat extends Models.Document { 
    chatId: string
    messages: message[]
}