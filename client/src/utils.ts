import axios from "axios";
import client, { database } from "./appwrite";
import { ID, Query, Account} from "appwrite";
import { chat } from "./types";

// API Base URL - use environment variable for production
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'https://marvel-rag.vercel.app/api')
  : 'http://localhost:8000';

export const query = (query: string, id: string) => { 
    return axios.get(`${API_BASE_URL}/query/`, {
        headers: {
            'Query': query,
            'Session-Id': id
        }
    })
    .then(response => {
        return response.data;
    })
    .catch(error => {
        console.error('Error:', error.response?.data || error);
        throw error;
    });
}


export const createChat = async (chatId: string, userId: string) => { 
    console.log("Creating chat with ID:", chatId);
    console.log("Using Database ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE);
    console.log("Using Collection ID:", process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION);
    
    try {
        const response = await database.createDocument(
            process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
            process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
            ID.unique(), 
            { 
                'chatId': chatId,
                'userId': userId,
                'messages': []
            }
        );
        console.log("Chat created:", response);
        return response.$id;
    } catch (error) {
        console.error("Error creating chat:", error);
        throw error;
    }
}

export const getDocument = (chatId: string) => { 
    return database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        [
            Query.equal('$id', chatId)
        ]
    ).then(function(response) { 
        console.log("Get Messages Response:", response);
        if (response.documents.length > 0) {
            return response.documents[0]
        } else {
            return [];
        }
    }, 
    function(error) { 
        console.log(error);
        return [];
    })
}
export const addMessageToChat = async (chatId: string, message: {role: string, content: string}) => { 
    const document = await getDocument(chatId) as chat;
    const newMessages = document['messages']

    return database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        document.$id,
        {
            'messages': [...newMessages, JSON.stringify(message)]
        }
    ).then(function(response) { 
        console.log(response)
        return response
    }, 
    function(error) { 
        console.log(error);
        return error
    })
}


export const listChats = (userId: string) => { 
    console.log("Listing chats for userId:", userId);
    return database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        [Query.equal('userId', userId)]
    ).then(function(response) { 
        console.log("List Chats Response:", response);
        return response.documents
    }, 
    function(error) { 
        console.log(error);
        return [];
    })
}

export const createUser = async (email: string, password: string, firstName: string, lastName: string) => {
    const account = new Account(client);
    const result = await account.create(
        ID.unique(),
        email,
        password,
        firstName + " " + lastName
    );
    console.log(result)
}


export const loginUser = async (email: string, password: string) => {
    const account = new Account(client);
    try {
        const response = await account.createEmailPasswordSession(email, password);
        console.log("Login successful:", response);
        
        // Get user data to include in cookie setting
        const user = await account.get();
        
        // Set cookies via secure API route
        const cookieResponse = await fetch('/apif/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                sessionId: response.$id,
                userId: user.$id,
            }),
        });
        
        if (!cookieResponse.ok) {
            console.error('Failed to set authentication cookies');
        }
        
        return response;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}
   

export const getUser = async () => {
    const account = new Account(client);
    try {
        const user = await account.get();
        return user;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}
export const logoutUser = async () => {
    const account = new Account(client);
    try {
        await account.deleteSession('current');
        console.log("Logout successful");
        
        // Clear cookies via secure API route
        const cookieResponse = await fetch('/apif/auth/logout', {
            method: 'POST',
        });
        
        if (!cookieResponse.ok) {
            console.error('Failed to clear authentication cookies');
        }
        
    } catch (error) {
        console.error("Logout failed:", error);
    }
}

export const cookieClick = async () => { 
    // Client-side cookie access
    console.log("Document cookies:", document.cookie);
    
    // Parse cookies into an object for easier reading
    const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {} as Record<string, string>);
    
    console.log("Parsed cookies:", cookies);
}

export const updateChatName = async (chatId: string, newName: string) => {
    return database.updateDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        chatId,
        {
            'chatId': newName
        }
    ).then(function(response) { 
        console.log("Chat name updated successfully:", response)
        return response
    }, 
    function(error) { 
        console.log("Error updating chat name:", error);
        throw error
    })
}

export const deleteDocument = async (documentId: string) => { 
    console.log(documentId)
    const promise = database.deleteDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || '', 
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || '', 
        documentId     
        )
    promise.then(function() { 
        console.log("sucesss")
    }, function() { 
        console.log("error")
    })
    
}

export const passwordReset = async (email: string) => {
    const account = new Account(client);
    try {
        const resetUrl = process.env.NODE_ENV === 'production' 
            ? 'https://marvel-rag.vercel.app/reset-password'  // Replace with your actual domain
            : 'http://localhost:3000/reset-password';
        await account.createRecovery(email, resetUrl);
        console.log("Password recovery email sent");
    } catch (error) {
        console.error("Error sending password recovery email:", error);
        throw error;
    }
}

export const updatePassword = async (userId: string, secret: string, newPassword: string) => {
    const account = new Account(client);
    try {
        await account.updateRecovery(userId, secret, newPassword);
        console.log("Password updated successfully");
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
}