export type message = {
    role: 'user' | 'assistant'
    chatId: string
    content: string
}

export type queryResponse = { 
    response: string
    query: string
}