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

  



const app = express();
const PORT = 5000;


const server = http.createServer(app);


const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", 
        methods: ["GET", "POST"]
    }
});


connectDB()
  .then(() => {
  
    app.use(cors());
    app.use(express.json());


    app.use('/api/users', userRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/restaurant', restaurantRoutes);
    app.use('/api/deliveryperson',deliveryboyRoute)

    app.get('/', (req, res) => {
      res.send('API is running...');
    });

 
interface MessageData {
    roomId: string;
    message: string;
}


io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('joinRoom', ({ roomId }) => {
      console.log(roomId,'roomiddddd')
      socket.join(roomId);
      
      console.log(`User joined room: ${roomId}`);
    });
    
    socket.on('userStatusUpdate', ({ userId, isActive }) => {
      console.log(userId, 'userrriddddd in message');
      console.log(isActive, 'isactiveeeeinnnnnnnserverr');
      
      io.emit('userStatusUpdate', { userId, isActive });
    });

    socket.on('sendMessage', (data) => {
      const { conversationId, message } = data;
      console.log(data,'serverrdataaa')
      io.emit('receiveMessage', data);
    });

   

    socket.on('orderReadyForDelivery',(restaurant)=>{
      console.log(restaurant,'hellooo')
      io.emit('orderReadyForDelivery',restaurant)
    })

socket.on('acceptOrder', (data) => {
  console.log(data,'data from delivery boy')
  const update={id:data,orderStatus:'OUT FOR DELIVERY'}
  io.emit('acceptOrder',  update );
});

    socket.on('completeOrder', (data) => {
      console.log(data,'data from delivery boy')
      const update={id:data,orderStatus:'DELIVERY COMPLETED'}
      io.emit('completeOrder',  update );
    });


    socket.on('ordertouser', (data) => {
      console.log(data,'data from restaurant food ready')
      const update={id:data,orderStatus:'FOOD READY'}
      io.emit('ordertouser',  update );
    });


    socket.on('foodpreparing', (data) => {
      console.log(data,'data from restaurant food pre')
      const update={id:data,orderStatus:'FOOD PREPARING'}
      io.emit('foodpreparing',  update );
    });


    socket.on('send', (message) => {
      console.log('Received message on server from restaurant:', message); 
      io.emit('receive', message);
    });


    socket.on('joinRoom', (restaurantId) => {
        socket.join(restaurantId);
        console.log(`Restaurant ${restaurantId} joined room: ${restaurantId}`);
      });

      socket.on('orderNotification', ({ restaurantId, orderDetails }) => {

        io.to(restaurantId).emit('orderNotification', orderDetails);
      });

    socket.on('delivery',(orderdetails)=>{
      console.log(orderdetails,"att ser ve dev")
      io.emit('delivery',orderdetails)
    })

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
})