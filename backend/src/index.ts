import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);
const app = createApp();

app.listen(port, () => {
  const location = process.env.NODE_ENV === "production" ? `port ${port}` : `http://localhost:${port}`;
  console.log(`PhishGuard API listening on ${location}`);
});
