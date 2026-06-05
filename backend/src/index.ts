import dotenv from "dotenv";
import { createApp } from "./app";

dotenv.config();

const port = Number(process.env.PORT ?? 5000);
const app = createApp();

app.listen(port, () => {
  console.log(`PhishGuard API running on http://localhost:${port}`);
});
