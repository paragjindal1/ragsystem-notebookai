import express from 'express';
import "dotenv/config";
import cors from "cors"

import  aiRouter from "./src/routes/ai.routes.js";


const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
    credentials: true,

}))

app.use(express.json({ limit: "50mb" }));

const port = process.env.PORT || 3000;


app.use("/ai", aiRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

