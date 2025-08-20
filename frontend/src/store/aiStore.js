import { create } from "zustand";
import { axiosInstance } from "../axios/axiosInstance";

export const useAiStore = create((set) => ({
    assistantResponse: null,
    contextLoadByWebsite: null,
    contextLoaderByFile: null,
    contextLoaderByText: null,

    setContextLoadByWebsite: async (url) => {
        const response = await axiosInstance.post("/ai/contextLoaderByWebsite", {url:url});
        console.log(response)
        set({ contextLoadByWebsite: response.data });
    },
    setContextLoaderByFile: async (file) => {
        const response = await axiosInstance.post("/ai/contextLoaderByFile", {file:file}, {
          headers: {
            "Content-Type": "multipart/form-data", 
          },
        });
        set({ contextLoaderByFile: response.data });
    },
    setContextLoaderByText: async (text) => {
        console.log(text)
        const response = await axiosInstance.post("/ai/contextLoaderByText", {text:text});
        set({ contextLoaderByText: response.data });
    },

    setAiResponse: async (query , collectionName , messages) => {
        console.log(query)

        console.log(collectionName)

        console.log(messages)
        const response = await axiosInstance.post("/ai/chat", {query , collectionName , messages});
        console.log(response)
        set({ assistantResponse: response.data.aiAns });
        
    },

}));