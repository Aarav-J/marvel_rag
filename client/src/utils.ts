import axios from "axios";
import client, { database } from "./appwrite";
import { ID, Query, Account} from "appwrite";
import { chat, message } from "./types";
export const query = (query: string, id: string) => { 
    return axios.get('http://localhost:8000/query/', {
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


export const createChat = (chatId: string, userId: string) => { 
    console.log("Creating chat with ID:", chatId);
    console.log("Using Database ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE);
    console.log("Using Collection ID:", process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION);
    const promise =  database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        ID.unique(), 
        { 
            'chatId': chatId,
            'userId': userId,
            'messages': []
        }
    );

    promise.then(function(response) { 
        console.log(response)
        return response
    }, 
    function(error) { 
        console.log(error);
        return error
    })
    
}

export const getDocument = (chatId: string) => { 
    return database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        [
            Query.equal('chatId', chatId)
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
    } catch (error) {
        console.error("Logout failed:", error);
    }
}