import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../../.env");
// console.log("🧾 Cargando archivo .env desde:", envPath);
dotenv.config({ path: envPath });
// console.log("🔍 TMDB_API_KEY:", process.env.TMDB_API_KEY);
// console.log("🔍 TMDB_BEARER_TOKEN:", process.env.TMDB_BEARER_TOKEN);