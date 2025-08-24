# RAG System - Notebook AI

A powerful Retrieval-Augmented Generation (RAG) system that allows users to upload context from various sources and chat with an AI assistant that provides answers based on the uploaded content.

## 🚀 Features

- **Multiple Input Sources**: Upload context from text, PDF files, or website URLs
- **Intelligent Chat Interface**: Ask questions about your uploaded content and get AI-powered responses
- **Vector Database Integration**: Uses Qdrant for efficient document storage and retrieval
- **Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **Real-time Processing**: Instant context loading and chat responses
- **Context Management**: View and manage your uploaded content

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **LangChain** for AI/ML operations
- **OpenAI** for embeddings and chat completions
- **Qdrant** vector database
- **PDF parsing** with pdf-parse
- **Web scraping** with RecursiveUrlLoader
- **Multer** for file uploads

### Frontend
- **React 19** with Vite
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Axios** for API communication
- **Lucide React** for icons

## 📋 Prerequisites

Before running this project, make sure you have:

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key
- Qdrant cloud instance or local setup

## 🔧 Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Configuration
QDRANT_URL=your_qdrant_url_here
QDRANT_API_KEY=your_qdrant_api_key_here

# Server Configuration
PORT=3000
```

Create a `.env` file in the frontend directory:

```env
VITE_BACKEND_URL=http://localhost:3000
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ragsystem-notebookai
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

The backend server will start on `http://localhost:3000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on `http://localhost:5173`

## 📖 Usage

### 1. Choose Input Method

The application offers three ways to upload context:

- **Text Input**: Directly enter text content
- **File Upload**: Upload PDF documents
- **Website URL**: Scrape content from web pages

### 2. Upload Context

1. Select your preferred input method
2. Enter your content (text, upload file, or provide URL)
3. Click "Submit" to process and load the context
4. Wait for the system to process and vectorize your content

### 3. Chat with AI

1. Once context is loaded, you'll see the chat interface
2. Ask questions about your uploaded content
3. The AI will provide answers based on the context you provided
4. View conversation history and context details in the sidebar

## 🔌 API Endpoints

### Context Loading

#### POST `/ai/contextLoaderByText`
Load context from text input.

**Request Body:**
```json
{
  "text": "Your text content here"
}
```

**Response:**
```json
{
  "message": "text uploaded successfully",
  "collectionName": "timestamp text"
}
```

#### POST `/ai/contextLoaderByFile`
Load context from uploaded file.

**Request:** Multipart form data with file

**Response:**
```json
{
  "message": "File uploaded successfully",
  "collectionName": "filename"
}
```

#### POST `/ai/contextLoaderByWebsite`
Load context from website URL.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "message": "website uploaded successfully",
  "collectionName": "timestamp text"
}
```

### Chat

#### POST `/ai/chat`
Send a message to the AI assistant.

**Request Body:**
```json
{
  "query": "Your question here",
  "collectionName": "collection_name",
  "messages": [
    {
      "role": "user",
      "content": "Previous message"
    }
  ]
}
```

**Response:**
```json
{
  "aiAns": "AI response based on context"
}
```

## 🏗️ Project Structure

```
ragsystem-notebookai/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── ai.controllers.js    # API logic
│   │   └── routes/
│   │       └── ai.routes.js         # API routes
│   ├── index.js                     # Server entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── store/
│   │   │   └── aiStore.js           # State management
│   │   ├── axios/
│   │   │   └── axiosInstance.js     # API client
│   │   ├── App.jsx                  # Main application
│   │   └── main.jsx                 # Entry point
│   └── package.json
└── README.md
```

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev  # Start development server with nodemon
```

### Frontend Development

```bash
cd frontend
npm run dev  # Start Vite development server
npm run build  # Build for production
npm run preview  # Preview production build
```

## 🚀 Deployment

### Backend Deployment

1. Set up your production environment variables
2. Build and deploy to your preferred hosting service (Heroku, Vercel, etc.)
3. Ensure your Qdrant instance is accessible from your deployment

### Frontend Deployment

1. Update the `VITE_BACKEND_URL` in your production environment
2. Build the project: `npm run build`
3. Deploy the `dist` folder to your hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure your OpenAI and Qdrant credentials are valid
4. Check that both backend and frontend servers are running

## 🔮 Future Enhancements

- [ ] Support for more file formats (DOCX, TXT, etc.)
- [ ] User authentication and context sharing
- [ ] Advanced search and filtering
- [ ] Export chat conversations
- [ ] Multiple context management
- [ ] Real-time collaboration features
