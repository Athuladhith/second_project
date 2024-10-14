import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes' 
import restaurantRoutes from './routes/restaurantRoutes'
import connectDB from './config/db';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB().then(() => {
  // Middleware
  app.use(cors());
  app.use(express.json());
  
  
  // Use the user routes
  app.use('/api/users', userRoutes);
  app.use('/api/admin', adminRoutes)
  app.use('/api/restaurant', restaurantRoutes)

  app.get('/', (req, res) => {
    res.send('API is running...');
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MongoDB:', error);
  process.exit(1);
});