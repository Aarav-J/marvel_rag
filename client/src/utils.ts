import axios from "axios";
import { database } from "./appwrite";
import { ID, Query} from "appwrite";
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


export const createChat = (chatId: string) => { 
    console.log("Creating chat with ID:", chatId);
    console.log("Using Database ID:", process.env.NEXT_PUBLIC_APPWRITE_DATABASE);
    console.log("Using Collection ID:", process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION);
    const promise =  database.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        ID.unique(), 
        { 
            'chatId': chatId,
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


export const listChats = () => { 
    return database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE || "",
        process.env.NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION || "", 
        [Query.orderAsc('$createdAt')]
    ).then(function(response) { 
        console.log("List Chats Response:", response);
        return response.documents
    }, 
    function(error) { 
        console.log(error);
        return [];
    })
}