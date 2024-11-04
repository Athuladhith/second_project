import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes' 
import deliveryboyRoute from './routes/deliveryboyRoutes'
import restaurantRoutes from './routes/restaurantRoutes'
import connectDB from './config/db';

dotenv.config();

// const app = express();

// // Connect to MongoDB
// connectDB().then(() => {
//   // Middleware
//   app.use(cors());
//   app.use(express.json());
  
  
//   // Use the user routes
//   app.use('/api/users', userRoutes);
//   app.use('/api/admin', adminRoutes)
//   app.use('/api/restaurant', restaurantRoutes)
//   app.use('/api/deliveryboy',deliveryboyRoute)

//   app.get('/', (req, res) => {
//     res.send('API is running...');
//   });

//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }).catch((error) => {
//   console.error('Failed to connect to MongoDB:', error);
//   process.exit(1);
// });   




//Create an instance of the express app
const app = express();
const PORT = 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize the Socket.IO server with CORS options
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Adjust according to your client URL
        methods: ["GET", "POST"]
    }
});

// Connect to MongoDB
connectDB()
  .then(() => {
    // Middleware
    app.use(cors());
    app.use(express.json());

    // Use the user routes
    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/restaurant', restaurantRoutes);
    app.use('/api/deliveryperson',deliveryboyRoute)

    app.get('/', (req, res) => {
      res.send('API is running...');
    });

  
// Define the structure of a message
interface MessageData {
    roomId: string;
    message: string;
}

// Handle socket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a specific chat room based on user data
    socket.on('joinRoom', ({ roomId }: { roomId: string }) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    // Broadcast message to a specific room with an object format
    socket.on('sendMessage', ({ roomId, message }: MessageData) => {
        const messageObject = { message };
        io.to(roomId).emit('receiveMessage', messageObject);
    });

    // socket.on('orderNotification', (orderDetails) => {
    //   console.log("noteeeeee")
    //   // Emit to all connected clients (or to a specific room if needed)
    //   io.emit('orderNotification', orderDetails);
    // });

    socket.on('joinRoom', (restaurantId) => {
        socket.join(restaurantId);
        console.log(`Restaurant ${restaurantId} joined room: ${restaurantId}`);
      });
    
      // Handle order notification
      socket.on('orderNotification', ({ restaurantId, orderDetails }) => {
        // Emit notification to the specific restaurant room
        io.to(restaurantId).emit('orderNotification', orderDetails);
      });

    socket.on('delivery',(orderdetails)=>{
      console.log(orderdetails,"att ser ve dev")
      io.emit('delivery',orderdetails)
    })
  

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
})