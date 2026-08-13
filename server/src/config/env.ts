import dotenv from "dotenv";
import path from "path";

// Load .env from server root or parent project root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  cognodb: {
    uri: process.env.COGNODB_URI || "bolt://localhost:7687",
    username: process.env.COGNODB_USERNAME || "cognodb",
    password: process.env.COGNODB_PASSWORD || "",
  },
  isProduction: process.env.NODE_ENV === "production",
  isMock:
    process.env.IS_MOCK === "true" ||
    process.env.USE_MOCK === "true" ||
    process.env.VITE_USE_MOCK === "true",
};
