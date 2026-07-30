import dotenv from "dotenv";
import connectDB from "../config/db.js";
import Problem from "../models/Problem.js";
import { problems } from "./problemBank.js";

dotenv.config();

await connectDB();
await Problem.deleteMany({});
await Problem.insertMany(problems);
console.log(`Seeded ${problems.length} CodeArena problems`);
process.exit(0);
