export type message = {
    role: 'user' | 'assistant'
    chatId: string
    content: string
}