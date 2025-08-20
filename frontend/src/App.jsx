import React, { useState, useEffect } from "react";
import { Upload, Globe, MessageSquare, Send, FileText, X } from "lucide-react";
import { useAiStore } from "./store/aiStore";

const App = () => {
  const {
    assistantResponse,
    contextLoadByWebsite,
    contextLoaderByFile,
    contextLoaderByText,
    setAiResponse,
    setContextLoadByWebsite,
    setContextLoaderByFile,
    setContextLoaderByText,
  } = useAiStore();

  const [inputMode, setInputMode] = useState(null);
  const [messageList, setMessageList] = useState([]);
  const [contextData, setContextData] = useState(null);
  const [isContextSet, setIsContextSet] = useState(false);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const handleModeSelect = (mode) => {
    setInputMode(mode);
    setTextInput("");
    setWebsiteUrl("");
    setSelectedFile(null);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Fixed useEffect to properly handle context loading
  useEffect(() => {
    let contextResult = null;

    // Check which context type was loaded and set the appropriate data
    if (contextLoadByWebsite && Object.keys(contextLoadByWebsite).length > 0) {
      contextResult = contextLoadByWebsite;
      setInputMode("website"); // Ensure input mode is set correctly
    } else if (
      contextLoaderByFile &&
      Object.keys(contextLoaderByFile).length > 0
    ) {
      contextResult = contextLoaderByFile;
      setInputMode("file");
    } else if (
      contextLoaderByText &&
      Object.keys(contextLoaderByText).length > 0
    ) {
      contextResult = contextLoaderByText;
      setInputMode("text");
    }

    if (contextResult) {
      console.log("Context loaded:", contextResult);
      setContextData(contextResult);
      setIsContextSet(true);
      setMessages([
        {
          id: 1,
          type: "system",
          content: `Context loaded successfully! You can now ask questions about the content.`,
        },
      ]);
    }
  }, [contextLoadByWebsite, contextLoaderByFile, contextLoaderByText]);

  const handleContextSubmit = async () => {
    setIsLoading(true);

    try {
      let result = null;

      if (inputMode === "text" && textInput.trim()) {
        result = await setContextLoaderByText(textInput);
      } else if (inputMode === "file" && selectedFile) {
        result = await setContextLoaderByFile(selectedFile);
      } else if (inputMode === "website" && websiteUrl.trim()) {
        result = await setContextLoadByWebsite(websiteUrl);
      }

      // The context will be set via useEffect when the store updates
      console.log("Context submission result:", result);
    } catch (error) {
      console.error("Error processing context:", error);
      // Show error message to user
      setMessages([
        {
          id: Date.now(),
          type: "system",
          content: "Error loading context. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!currentMessage.trim() || isLoading || !contextData) return;

    const userMessage = {
      id: Date.now(),
      type: "user",
      content: currentMessage,
    };

    // Add user message to UI immediately
    setMessages((prev) => [...prev, userMessage]);

    // Create new message list for AI context
    const newMessageList = [
      ...messageList,
      {
        role: "user",
        content: currentMessage,
      },
    ];

    const messageToSend = currentMessage;
    setCurrentMessage("");
    setIsLoading(true);

    try {
      console.log("Sending message with context:", {
        message: messageToSend,
        contextData: contextData,
        messageHistory: newMessageList,
      });

      // Determine which collection name to use based on current context
      let collectionName = "default";
      if (inputMode === "text" && contextLoaderByText?.collectionName) {
        collectionName = contextLoaderByText.collectionName;
      } else if (inputMode === "file" && contextLoaderByFile?.collectionName) {
        collectionName = contextLoaderByFile.collectionName;
      } else if (
        inputMode === "website" &&
        contextLoadByWebsite?.collectionName
      ) {
        collectionName = contextLoadByWebsite.collectionName;
      }

      // Call AI response function and wait for completion
      await setAiResponse(messageToSend, collectionName, newMessageList);

      console.log("AI Response call completed");

      // Wait a bit for store to update, then get the latest response
      setTimeout(() => {
        const currentResponse = useAiStore.getState().assistantResponse;
        console.log("Current assistant response from store:", currentResponse);

        if (currentResponse) {
          // Add AI message to UI
          const aiMessage = {
            id: Date.now() + Math.random(),
            type: "ai",
            content: currentResponse,
          };

          setMessages((prev) => [...prev, aiMessage]);

          // Update message list for future context
          setMessageList([
            ...newMessageList,
            {
              role: "assistant",
              content: currentResponse,
            },
          ]);
        } else {
          // Fallback if no response
          const errorMessage = {
            id: Date.now() + 1,
            type: "ai",
            content: "No response received from AI. Please try again.",
          };
          setMessages((prev) => [...prev, errorMessage]);
        }

        setIsLoading(false);
      }, 1000); // Give store time to update
    } catch (error) {
      console.error("Error getting AI response:", error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        type: "ai",
        content: "Sorry, I encountered an error. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  // Alternative approach: Listen for assistantResponse changes
  useEffect(() => {
    // Only trigger if we have a response and are not currently in the middle of submission
    if (assistantResponse && assistantResponse.trim() && !isLoading) {
      console.log("Assistant response updated:", assistantResponse);

      // Check if this response is already in messages to avoid duplicates
      const hasResponse = messages.some(
        (msg) => msg.type === "ai" && msg.content === assistantResponse
      );

      if (!hasResponse) {
        const aiMessage = {
          id: Date.now() + Math.random(),
          type: "ai",
          content: assistantResponse,
        };

        setMessages((prev) => [...prev, aiMessage]);

        // Also update message list if needed
        const lastUserMessage = messageList[messageList.length - 1];
        if (lastUserMessage?.role === "user") {
          setMessageList((prev) => [
            ...prev,
            {
              role: "assistant",
              content: assistantResponse,
            },
          ]);
        }
      }
    }
  }, [assistantResponse]);

  const resetSystem = () => {
    setInputMode(null);
    setContextData(null);
    setIsContextSet(false);
    setMessages([]);
    setCurrentMessage("");
    setTextInput("");
    setWebsiteUrl("");
    setSelectedFile(null);
    setMessageList([]);
  };

  // Improved context preview function
  const getContextPreview = () => {
    if (!contextData) return "No context loaded";

    // Handle different context data structures
    if (typeof contextData === "string") {
      return (
        contextData.substring(0, 200) + (contextData.length > 200 ? "..." : "")
      );
    }

    if (contextData.content) {
      return (
        contextData.content.substring(0, 200) +
        (contextData.content.length > 200 ? "..." : "")
      );
    }

    if (contextData.collectionName) {
      return `Collection: ${contextData.collectionName}`;
    }

    return JSON.stringify(contextData).substring(0, 200) + "...";
  };

  // Get context type display name
  const getContextType = () => {
    if (inputMode === "text") return "Text Input";
    if (inputMode === "file") return "File Upload";
    if (inputMode === "website") return "Website Scraping";
    return "Unknown";
  };

  if (isContextSet) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">RAG Chat System</h1>
            <button
              onClick={resetSystem}
              className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X size={16} />
              New Context
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <FileText size={16} className="text-blue-400" />
              <span className="text-sm text-gray-300">
                Current Context ({getContextType()}):
              </span>
            </div>
            <p className="text-sm text-gray-100">{getContextPreview()}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 flex flex-col">
              <div className="p-4 border-b border-gray-700">
                <h2 className="text-lg font-semibold">Chat with AI</h2>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.type === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === "user"
                          ? "bg-blue-600 text-white"
                          : message.type === "system"
                          ? "bg-green-600 text-white text-center w-full max-w-full"
                          : "bg-gray-700 text-gray-100"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-700 text-gray-100 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-700">
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Ask something about the context..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    disabled={isLoading}
                  />
                  <button
                    type="submit"
                    disabled={
                      isLoading || !currentMessage.trim() || !contextData
                    }
                    className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  >
                    <Send size={20} />
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
              <h3 className="text-lg font-semibold mb-4">Context Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-400">Input Mode:</span>
                  <p className="text-white">{getContextType()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Status:</span>
                  <p className="text-green-400">✓ Context Loaded</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Messages:</span>
                  <p className="text-white">{messageList.length} exchanges</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">
                    Content Preview:
                  </span>
                  <p className="text-gray-300 text-sm bg-gray-700 p-2 rounded mt-1 max-h-32 overflow-y-auto">
                    {getContextPreview()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">RAG System</h1>
          <p className="text-gray-400">Upload context and chat with AI</p>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8">
          {!inputMode ? (
            <div>
              <h2 className="text-xl font-semibold mb-6 text-center">
                Choose Input Method
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleModeSelect("text")}
                  className="flex flex-col items-center p-6 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all"
                >
                  <MessageSquare size={48} className="text-blue-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Text Input</h3>
                  <p className="text-gray-400 text-sm text-center">
                    Enter text directly
                  </p>
                </button>

                <button
                  onClick={() => handleModeSelect("file")}
                  className="flex flex-col items-center p-6 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all"
                >
                  <Upload size={48} className="text-green-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">File Upload</h3>
                  <p className="text-gray-400 text-sm text-center">
                    Upload document
                  </p>
                </button>

                <button
                  onClick={() => handleModeSelect("website")}
                  className="flex flex-col items-center p-6 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 hover:border-blue-500 transition-all"
                >
                  <Globe size={48} className="text-purple-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Website URL</h3>
                  <p className="text-gray-400 text-sm text-center">
                    Scrape website content
                  </p>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {inputMode === "text" && "Enter Text Context"}
                  {inputMode === "file" && "Upload File"}
                  {inputMode === "website" && "Enter Website URL"}
                </h2>
                <button
                  onClick={() => setInputMode(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {inputMode === "text" && (
                <div className="space-y-4">
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Enter your text context here..."
                    className="w-full h-64 bg-gray-700 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 resize-none"
                  />
                  <button
                    onClick={handleContextSubmit}
                    disabled={!textInput.trim() || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Context...
                      </>
                    ) : (
                      "Submit Context"
                    )}
                  </button>
                </div>
              )}

              {inputMode === "file" && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                      accept=".txt,.pdf,.doc,.docx,.md"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload size={48} className="text-gray-400 mb-4" />
                      <p className="text-gray-300 mb-2">Click to upload file</p>
                      <p className="text-gray-500 text-sm">
                        Support:PDF only
                      </p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-blue-400" />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            {selectedFile.name}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedFile(null)}
                          className="text-gray-400 hover:text-white"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContextSubmit}
                    disabled={!selectedFile || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing File...
                      </>
                    ) : (
                      "Process File"
                    )}
                  </button>
                </div>
              )}

              {inputMode === "website" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Website URL</label>
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {websiteUrl && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Globe size={20} className="text-purple-400" />
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Website Preview
                          </p>
                          <p className="text-gray-400 text-sm truncate">
                            {websiteUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContextSubmit}
                    disabled={!websiteUrl.trim() || isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Scraping Website...
                      </>
                    ) : (
                      "Scrape Website"
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
