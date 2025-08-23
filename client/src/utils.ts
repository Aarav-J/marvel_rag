import axios from "axios";
import { database } from "./appwrite";
import { ID } from "appwrite";
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