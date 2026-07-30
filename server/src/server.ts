import dotenv from "dotenv";
dotenv.config();

import { server } from "./app.js";

const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`Server is running successfully at port ${port}`);
});
