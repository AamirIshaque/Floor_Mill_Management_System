import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Failed: ${error.message}`);
    console.log(`⚠️ Running without database - some features will not work`);
    console.log(`💡 Please ensure MongoDB is running and accessible`);
    return false;
  }
};

export default connectDB;
