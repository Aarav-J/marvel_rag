# Marvel RAG - Vercel Deployment Guide

This project contains a Next.js frontend and FastAPI backend deployed to Vercel.

## Project Structure

```
marvel/
├── client/          # Next.js frontend
├── server/          # FastAPI backend
├── vercel.json      # Vercel configuration
├── requirements.txt # Python dependencies
└── package.json     # Main project config
```

## Environment Variables

Set these in your Vercel dashboard:

### Backend (FastAPI)
- `OPENAI_API_KEY` - Your OpenAI API key
- `PINECONE_API_KEY` - Your Pinecone API key

### Frontend (Next.js)
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite endpoint URL
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Appwrite project ID
- `NEXT_PUBLIC_APPWRITE_DATABASE` - Appwrite database ID
- `NEXT_PUBLIC_APPWRITE_CHAT_COLLECTION` - Appwrite collection ID
- `NEXT_PUBLIC_API_URL` - Your Vercel app API URL (e.g., https://your-app.vercel.app/api)

## Deployment

### Option 1: Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option 2: Git + Vercel Dashboard
1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variables
4. Deploy

## API Endpoints

- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/query/`

## Local Development

```bash
# Install client dependencies
npm run install:client

# Run client (frontend)
npm run dev:client

# Run server (backend) - in separate terminal
npm run dev:server
```
