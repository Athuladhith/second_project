import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer, { Multer, StorageEngine } from 'multer';
import DeliveryPerson from '../models/deliveryModel'; 
import Order from '../models/orderModel'
import {IDeliveryPerson} from '../models/deliveryModel'
import jwt, { SignOptions } from 'jsonwebtoken'

const storage: StorageEngine = multer.memoryStorage();
const upload: Multer = multer({ storage });

export const registerDeliveryPerson = [
    upload.single('avatar'),
    async (req: Request, res: Response): Promise<void> => {
        const { name, email, phoneNumber, address, password,avatar } = req.body;
        

        try {
            
            const deliveryPersonExists = await DeliveryPerson.findOne({ email });
            if (deliveryPersonExists) {
                res.status(400).json({ message: 'Delivery person already exists' });
                return;
            }

            // Create new delivery person entry
            const newDeliveryPerson = new DeliveryPerson({
                name,
                email,
                phoneNumber,
                address,
                password: await bcrypt.hash(password, 10), 
                avatar
            });

           
            await newDeliveryPerson.save();

            res.status(201).json({
                message: 'Delivery person registered successfully.',
            });
        } catch (error) {
            res.status(500).json({ message: 'Registration failed, please try again.' });
        }
    },
];


export const getDeliveryPersons = async (req: Request, res: Response): Promise<void> => {
    try {
        const deliveryPersons = await DeliveryPerson.find({});
        res.json(deliveryPersons);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch delivery persons' });
    }
  };
  export const blockUnblockDeliveryboy = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log(1001)
      const { id } = req.params;
      const { isBlocked } = req.body; 
      console.log(id,"idddddddddd")
      console.log(isBlocked,"isblocked")
      
      const deliveryboy = await DeliveryPerson.findById(id);
  
      if (!deliveryboy) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      
      deliveryboy.isBlocked = isBlocked;
  
      await deliveryboy.save();
  
      res.status(200).json({ message: `User has been ${deliveryboy.isBlocked ? 'blocked' : 'unblocked'}` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while updating the user status' });
    }
  };

  export const deliveryOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params; // Extract id directly
      console.log(id, 'id from the frontend');
  
      const deliveryOrder = await Order.findById(id);
  
      if (!deliveryOrder) {
        res.status(404).json({ message: 'No orders found' });
        return;
      }
  
      res.status(200).json({ message: 'Order fetch success', data: deliveryOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'An error occurred while fetching the order' });
    }
  };


  export const deliveryboylogin = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    
    try {
      // Log the incoming request body
      console.log('Received login request:', { email, password });
  
      // Validate email and password presence
      if (!email || !password) {
        console.log('Email or password missing');
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }
  
      // Log the attempt to find the delivery person
      console.log(`Looking for delivery person with email: ${email}`);
      const deliveryperson: IDeliveryPerson | null = await DeliveryPerson.findOne({ email });
      
      if (!deliveryperson) {
        console.log('Email not registered');
        res.status(400).json({ message: 'Email not registered' });
        return;
      }
  
      // Log the fetched delivery person
      console.log('Found delivery person:', deliveryperson);
  
      // Check password and compare with hashed password
      const passwordMatch = await bcrypt.compare(password, deliveryperson.password || '');
      if (!passwordMatch) {
        console.log('Password does not match');
        res.status(400).json({ message: 'Wrong password' });
        return;
      }
  
      // Log successful password match
      console.log('Password matched successfully');
  
      // Generate JWT token
      const token = jwt.sign(
        {
          deliveryboyid: deliveryperson._id, // Corrected the key name to 'deliveryboyid'
          email: deliveryperson.email,
        },
        'your_jwt_secret_key_here',
        { expiresIn: '2h' } as SignOptions
      );
  
      // Log the generated token
      console.log('Generated JWT token:', token);
  
      // Send response back without sensitive data
      res.status(200).json({
        message: 'Login successful',
        deliveryboyid: deliveryperson._id,
        deliveryperson: {
          id: deliveryperson._id,
          name: deliveryperson.name,
          email: deliveryperson.email,
          phoneNumber: deliveryperson.phoneNumber,
          address: deliveryperson.address,
          avatar: deliveryperson.avatar,
          isBlocked: deliveryperson.isBlocked,
          isVerified: deliveryperson.isVerified,
        },
        token,
      });
  
      // Log successful login response
      console.log('Login response sent successfully');
      
    } catch (error) {
      // Log the error
      console.error('Error during delivery boy login:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  

