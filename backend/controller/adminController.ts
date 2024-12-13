import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv'
import Category from '../models/categoryModel';
import Restaurant from '../models/restaurantModel'
import Order from '../models/orderModel';

dotenv.config()
export const adminlogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    console.log('Admin login attempt with email:', email);
    
   
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      console.log('Admin login failed: Email not registered');
      res.status(400).json({ message: 'Email not registered' });
      return;
    }

 
    if (user.password && (await bcrypt.compare(password, user.password))) {
      console.log('Password matched for user:', user.email);
      //hrkki

    
      if (user.isAdmin === true) {
        console.log('User is admin:', user.email);
  
      
        const token = jwt.sign(
          { userId: user._id.toHexString(), email: user.email },
          process.env.JWT_SECRET as string,
          { expiresIn: '1h' } as SignOptions
        );

        console.log('Admin login successful. Generating token.');

        
        res.status(200).json({
          message: 'Admin login successful',
          admin: {
            id: user._id.toHexString(),
            email: user.email,
            name: user.name,
            phoneNumber: user.phoneNumber,
            avatar: user.avatar,
            isAdmin: user.isAdmin,
          },
          token,
        });
      } else {
        console.log('Login failed: User is not an admin');
        res.status(403).json({ message: 'User is not an admin' });
      }
    } else {
      console.log('Login failed: Wrong password for user:', email);
      res.status(400).json({ message: 'Wrong password' });
    }
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

  export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};
export const blockUnblockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(1001)
    const { id } = req.params;
    const { isBlocked } = req.body; 
    console.log(id,"idddddddddd")
    console.log(isBlocked,"isblocked")
 
    const user = await User.findById(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    
    user.isBlocked = isBlocked;

    await user.save();

    res.status(200).json({ message: `User has been ${user.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the user status' });
  }
};

export const addCategory = [
 
  async (req: Request, res: Response): Promise<void> => {
    const { name,description } = req.body;
    const avatar = req.file;
    try {
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res.status(400).json({ message: 'Restaurant already exists' });
        return;
      }
      const newCategory = new Category({
        name,
        description, 
        avatar: avatar ? avatar.buffer.toString('base64') : 'No avatar provided',
      });
      await newCategory.save();

      res.status(201).json({
        message: 'Restaurant registered successfully.',
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed, please try again.' });
    }
  },
];

////////////////////////////////////////////////////////////

export const getTotalUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await User.countDocuments();
    res.status(200).json({ totalUsers });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch total users', 
      error: error.message 
    });
  }
};



export const getTotalRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalRestaurants = await Restaurant.countDocuments();
    res.status(200).json({ totalRestaurants });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch total restaurants', 
      error: error.message 
    });
  }
};


export const getTotalOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalOrders = await Order.countDocuments();
    res.status(200).json({ totalOrders });
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Failed to fetch total orders', 
      error: error.message 
    });
  }
};

export const getTotalRevenue = async (req:Request, res:Response):Promise<void> => {
  try {
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    res.status(200).json({ totalRevenue: totalRevenue[0]?.totalRevenue || 0 });
  } catch (error:any) {
    res.status(500).json({ message: 'Failed to fetch total revenue', error: error.message });
  }
};




export const getTopRestaurants = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('entered to the top restaurant')
    const topRestaurants = await Order.aggregate([
      { $unwind: '$foodItems' },
      {
        $group: {
          _id: '$foodItems.restaurant', 
          totalOrders: { $sum: 1 }, 
        },
      },
      { $sort: { totalOrders: -1 } },
      { $limit: 10 }, 
      {
        $lookup: {
          from: 'restaurants', 
          localField: '_id', 
          foreignField: '_id', 
          as: 'restaurantDetails',
        },
      },
      { $unwind: '$restaurantDetails' }, 
      {
        $project: {
          _id: 0, 
          restaurantId: '$_id',
          restaurantName: '$restaurantDetails.restaurantName',
          ownerName: '$restaurantDetails.ownerName',
          email: '$restaurantDetails.email',
          phoneNumber: '$restaurantDetails.phoneNumber',
          address: '$restaurantDetails.address',
          avatar: '$restaurantDetails.avatar',
          totalOrders: 1, 
        },
      },
    ]);
    console.log(topRestaurants,'top restaurant from backkkkkkkk')

    res.status(200).json({ restaurants: topRestaurants });
  } catch (error: any) {
    res.status(500).json({
      message: 'Failed to fetch top restaurants',
      error: error.message,
    });
  }
};
