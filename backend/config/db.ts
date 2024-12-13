import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb+srv://athul:Athul29@test.84dpn.mongodb.net/';
    await mongoose.connect(uri, {});
    console.log('MongoDB Connected');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    process.exit(1);
  }
};

export default connectDB;
