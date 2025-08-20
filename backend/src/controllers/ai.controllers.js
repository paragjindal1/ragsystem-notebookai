import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { Document } from "@langchain/core/documents";
import OpenAI from "openai";
// import "@mendable/firecrawl-js";
import {
  CharacterTextSplitter,
  RecursiveCharacterTextSplitter,
} from "@langchain/textsplitters";
// import { FireCrawlLoader } from "@langchain/community/document_loaders/web/firecrawl";

// import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

import { RecursiveUrlLoader } from "@langchain/community/document_loaders/web/recursive_url";
import { compile } from "html-to-text";

export const contextLoaderByText = async (req, res) => {
  const { text } = req.body;

  const document = [
    new Document({
      pageContent: text,
      metadata: { source: "user-input" },
    }),
  ];

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 50,
  });

  const docs = await textSplitter.splitDocuments(document);
  


  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  const collectionName = `${Date.now()} text`;

  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName,
  });

  res.status(200).json({
    message: "text uploaded successfully",
    collectionName: collectionName,

  });


};

export const contextLoaderByFile = async (req, res) => {
  const file = req.file;

  

  

  const loader = new PDFLoader(
    new Blob([req.file.buffer], { type: "application/pdf" }),
    { splitPages: true }
  ); 

  const docs = await loader.load();

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });
  const collectionName = `$${file.originalname}`;
  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName,
  });

 



  

  res.status(200).json({ message: "File uploaded successfully",collectionName });
};

export const contextLoaderByWebsite = async (req, res) => {

    const{url}= req.body;

    

    // const loader = new FireCrawlLoader({
    //   url: url,  
    //   mode: "scrape", 
      
    // });
    // const loader = new CheerioWebBaseLoader(
    //   url,
    // );

    const compiledConvert = compile({ wordwrap: 130 }); // returns (text: string) => string;

    const loader = new RecursiveUrlLoader(url, {
      extractor: compiledConvert,
      maxDepth: 1,
    });



    

    const documents = await loader.load();

    const textSplitter = new CharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 0,
    });
    const docs = await textSplitter.splitDocuments(documents);


    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-large",
    });

    const collectionName = `${Date.now()} text`;

    

    const vectorStore = await QdrantVectorStore.fromDocuments(
      docs,
      embeddings,
      {
        url: process.env.QDRANT_URL,
        apiKey: process.env.QDRANT_API_KEY,
        collectionName,
      }
    );

  

    res.status(200).json({ message: "website uploaded successfully",collectionName });
};

export const chat = async (req, res) => {

  const { query , collectionName , messages} = req.body;

  const embeddings = new OpenAIEmbeddings({
    model: "text-embedding-3-large",
  });

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings,{
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
    collectionName: `${collectionName}`,
  });

  const relatedChunks = await vectorStore.similaritySearch(query, 3);

  const client = new OpenAI({});

  const message = [
    {
      role: "system",
      content: ` You are an AI assistant who helps resolving user query based on the
      context available to you
      Only ans based on the available context from file only.
  
      Context:
      ${JSON.stringify(relatedChunks)}`,
    },
    ...messages
  ];

  
  
  const response = await client.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: message
    
  });

  res.status(200).json({
    aiAns: response.choices[0].message.content
  });

};

export const deleteContext = async (req, res) => {

};
