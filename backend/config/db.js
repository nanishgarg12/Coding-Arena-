import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/codearena";
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("✅ MongoDB connected to:", uri.replace(/\/\/.*@/, "//***@"));
  } catch (err) {
    console.error("⚠️  MongoDB connection failed:", err.message);
    console.error("   → Set MONGO_URI in backend/.env to a valid MongoDB Atlas connection string.");
    console.error("   → Get a free cluster at: https://cloud.mongodb.com");
    console.error("   → The server will still run but database operations will fail.");
    // Don't crash — let Socket.io still work, demo mode still works on frontend
  }
}
