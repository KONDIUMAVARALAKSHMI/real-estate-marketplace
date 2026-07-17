import mongoose from 'mongoose';
import dns from 'dns';

// The local DNS resolver on this machine refuses querySrv requests (ECONNREFUSED).
// Google's public DNS (8.8.8.8) correctly resolves mongodb+srv:// SRV records.
// This is set once at module load, before mongoose.connect() is called.
dns.setServers(['8.8.8.8', '8.8.4.4']);

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  if (!mongoURI) {
    console.error('❌ MONGO_URI is not defined in the environment variables.');
    process.exit(1);
  }

  // Validate the connection string is well-formed before attempting to connect
  try {
    new URL(mongoURI);
  } catch (err) {
    console.error('❌ Could not parse MONGO_URI:', err.message);
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected successfully.');
  } catch (error) {
    console.error('❌ MongoDB connection failed.');
    console.error(`   Error : ${error.message}`);
    process.exit(1);
  }
};
