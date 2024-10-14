import { Request, Response } from 'express';
import User, { IUser } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import Category from '../models/categoryModel';
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

    
      if (user.isAdmin === true) {
        console.log('User is admin:', user.email);

      
        const token = jwt.sign(
          { userId: user._id.toHexString(), email: user.email },
          'your_jwt_secret_key_here',
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
    // Find the user by ID
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
  // upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { name,description } = req.body;

    console.log(name,'nnnnnnnaaammmmmmeeee')
    console.log(description,'dddeeesssssssssss')
    const avatar = req.file;

    try {
     
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res.status(400).json({ message: 'Restaurant already exists' });
        return;
      }

      // Create new restaurant entry
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

