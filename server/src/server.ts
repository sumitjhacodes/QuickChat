import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import app from "./app.js";
import { attachSocketServer } from "./socket/socketServer.js";

const server = createServer(app);
attachSocketServer(server);

const port = Number(process.env.PORT ?? 8000);

server.listen(port, () => {
  console.log(`Server is running successfully at port ${port}`);
});
