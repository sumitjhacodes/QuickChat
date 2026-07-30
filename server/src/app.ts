import express, {type Express, type Request, type Response} from "express"
import cors from "cors";
import { connectDB } from "./config/db.js";

import dotenv from "dotenv";
dotenv.config();

const app:Express = express();

app.use(express.json());
app.use(cors({origin:'*'}));

//MongoDB Connection
connectDB();

app.get('/', (req:Request, res:Response) => {
    res.send("Welcome to Chat Backend Server");
});

export default app;