import { Client, Databases, Account} from "appwrite"; 

import { type Models } from "appwrite"

const client: Client = new Client(); 
console.log("Appwrite Endpoint:", process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log("Appwrite Project ID:", process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "") 
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "");

export const account: Account = new Account(client);
export const database: Databases = new Databases(client);

