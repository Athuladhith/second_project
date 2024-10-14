import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer, { Multer, StorageEngine } from 'multer';
import DeliveryPerson from '../models/deliveryModel'; 

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