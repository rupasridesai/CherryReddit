import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cherryreddit';
    const conn = await mongoose.connect(uri);
    console.log(`[mongo] connected -> ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[mongo] connection error:', err.message);
    process.exit(1);
  }
};
