# 🕷️ Marvel Oracle - RAG-Powered Marvel Universe Chat

A full-stack RAG (Retrieval-Augmented Generation) application that lets you chat with the Marvel Universe using AI. Ask questions about Marvel characters, storylines, and lore with context-aware responses powered by vector search and GPT-4.

![Marvel Oracle Demo](https://img.shields.io/badge/Status-Live-green?style=for-the-badge)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://marveloracle.vercel.app)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Backend-Python-blue?style=for-the-badge&logo=python)](https://python.org/)

## 🚀 Live Demo

🌐 **[Try Marvel Oracle](https://marveloracle.aaravj.xyz)**

## ✨ Features

### 🧠 **Intelligent RAG System**
- **Context-Aware Conversations**: Remembers chat history for follow-up questions
- **Query Rewriting**: Automatically enhances ambiguous questions using conversation context
- **Vector Search**: Uses Pinecone for semantic similarity search across Marvel content
- **GPT-4 Integration**: Powered by OpenAI's most advanced language model

### 💬 **Chat Experience**
- **Multiple Timelines**: Create and manage separate conversation threads
- **Real-time Responses**: Streaming responses with loading indicators
- **Chat History**: Persistent conversation storage with Appwrite
- **Context Menu**: Edit chat names, delete conversations
- **Auto-scroll**: Automatically scrolls to latest messages

### 🔐 **Authentication & Security**
- **Secure Login/Signup**: Email-password authentication via Appwrite
- **Password Reset**: Email-based password recovery system
- **HTTP-only Cookies**: Secure session management
- **Route Protection**: Middleware-based authentication guards

### 🎨 **Modern UI/UX**
- **Dark Theme**: Marvel-inspired red and gray color scheme
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Smooth Animations**: Polished loading states and transitions
- **Intuitive Navigation**: Clean sidebar with chat history

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js       │    │   Vercel         │    │   External      │
│   Frontend      │◄──►│   Serverless     │◄──►│   Services      │
│                 │    │   Functions      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
│                      │                      │
│ • React Components   │ • Python API        │ • Appwrite DB
│ • Zustand Store      │ • LangChain RAG      │ • Pinecone Vector
│ • TailwindCSS        │ • Query Processing   │ • OpenAI GPT-4
│ • TypeScript         │ • Chat History       │ • Email Service
```

## 🛠️ Tech Stack

### **Frontend**
- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management

### **Backend**
- **[Python](https://python.org/)** - Server-side logic
- **[LangChain](https://langchain.com/)** - RAG pipeline and AI orchestration
- **[Vercel Serverless](https://vercel.com/)** - Serverless function deployment

### **AI & Data**
- **[OpenAI GPT-4](https://openai.com/)** - Large language model
- **[Pinecone](https://pinecone.io/)** - Vector database for embeddings
- **[OpenAI Embeddings](https://openai.com/)** - Text-to-vector conversion

### **Database & Auth**
- **[Appwrite](https://appwrite.io/)** - Backend-as-a-Service for auth and data
- **[Appwrite Database](https://appwrite.io/)** - Document database for chats

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ 
- **Python** 3.9+
- **npm** or **yarn**

### Environment Variables

Create these environment variable files:

#### **Client (`.env.local`)**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

#### **Server Environment Variables**
```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/marvel-oracle.git
cd marvel-oracle
```

2. **Install dependencies**
```bash
# Install client dependencies
cd client
npm install

# Install server dependencies (for local development)
cd ../server
pip install -r requirements.txt
```

3. **Set up external services**

   **Appwrite Setup:**
   - Create account at [Appwrite Cloud](https://cloud.appwrite.io/)
   - Create new project
   - Set up database and collection for chat storage
   - Configure authentication settings

   **Pinecone Setup:**
   - Create account at [Pinecone](https://pinecone.io/)
   - Create index named `marvel-embeddings`
   - Upload your Marvel content embeddings

   **OpenAI Setup:**
   - Get API key from [OpenAI Platform](https://platform.openai.com/)

4. **Run development servers**

```bash
# Start Next.js frontend (from project root)
npm run dev:client

# Start Python backend (from project root) 
npm run dev:server
```

5. **Open the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

## 🚀 Deployment

The application is configured for one-click deployment to Vercel:

### **Deploy to Vercel**

1. **Using Vercel CLI**
```bash
npm install -g vercel
vercel --prod
```

2. **Using GitHub Integration**
   - Push code to GitHub
   - Import repository in Vercel dashboard
   - Configure environment variables
   - Deploy automatically

### **Environment Variables in Production**

Set these in your Vercel dashboard:

```env
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your_database_id
NEXT_PUBLIC_APPWRITE_COLLECTION_ID=your_collection_id
```

## 📁 Project Structure

```
marvel-oracle/
├── client/                  # Next.js frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── login/      # Authentication pages
│   │   │   ├── signup/
│   │   │   └── reset-password/
│   │   ├── components/     # React components
│   │   │   ├── Chatbot.tsx # Main chat interface
│   │   │   ├── Chatbar.tsx # Message input
│   │   │   ├── History.tsx # Chat sidebar
│   │   │   └── ...
│   │   ├── store/          # Zustand state management
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils.ts        # API utilities
│   ├── middleware.ts       # Route protection
│   └── package.json
├── api/                    # Vercel serverless functions
│   ├── index.py           # Health check endpoint
│   └── query.py           # RAG query processing
├── server/                 # Local development server
│   └── server.py          # FastAPI development server
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel configuration
└── README.md
```

## 🎯 Key Features Explained

### **RAG Pipeline**
The core RAG (Retrieval-Augmented Generation) system works as follows:

1. **Query Processing**: User questions are analyzed for context dependency
2. **Query Rewriting**: Ambiguous questions are rewritten using chat history
3. **Vector Search**: Enhanced queries retrieve relevant Marvel content from Pinecone
4. **Response Generation**: GPT-4 generates responses using retrieved context and chat history

### **Context-Aware Conversations**
```
User: "Who is the boss of Peter Parker's newspaper?"
AI: "J. Jonah Jameson is the editor-in-chief of the Daily Bugle..."

User: "Who is that?" ← Ambiguous question
AI: ✅ Understands "that" refers to J. Jonah Jameson from context
```

### **Chat Management**
- **Multiple Timelines**: Each chat maintains separate conversation history
- **Persistent Storage**: All conversations saved to Appwrite database
- **Real-time Updates**: UI updates immediately with new messages
- **Context Isolation**: Each chat has its own context window

## 🔧 API Documentation

### **Query Endpoint**
```http
GET /api/query
Headers:
  Query: "Who is Spider-Man?"
  Session-Id: "unique_chat_id"

Response:
{
  "query": "Who is Spider-Man?",
  "response": "Spider-Man is Peter Parker, a young man who gained spider-like abilities...",
  "session_id": "unique_chat_id"
}
```

### **Health Check**
```http
GET /api/
Response:
{
  "message": "Marvel RAG API is running!",
  "status": "healthy",
  "env_check": {
    "openai_key_set": true,
    "pinecone_key_set": true
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Marvel Comics** - For the incredible universe and characters
- **OpenAI** - For GPT-4 and embedding models
- **LangChain** - For RAG framework and tools
- **Vercel** - For seamless deployment platform
- **Appwrite** - For authentication and database services

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/marvel-oracle/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/marvel-oracle/discussions)
- **Email**: your.email@example.com

---

<div align="center">

**🕷️ Built with ❤️ for Marvel fans by Marvel fans 🕷️**
[Live Demo](https://marveloracle.aaravj.xyz) 

</div>