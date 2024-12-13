import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer, { Multer, StorageEngine } from 'multer';
import Restaurant from '../models/restaurantModel'
import jwt, { SignOptions } from 'jsonwebtoken'
import dotenv from 'dotenv'
import { IRestaurant } from '../models/restaurantModel';
import Category from '../models/categoryModel';
import Cuisine from '../models/cuisineModel'
import FoodItem from '../models/fooditemModel';
import Message, { IMessage } from '../models/messageModel'
import Conversation, { IConversation } from '../models/conversationModel';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import path from 'path';
import fs from 'fs'
dotenv.config()

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const registerRestaurant = [
    upload.single('avatar'),
    async (req: Request, res: Response): Promise<void> => {
      const { restaurantName, ownerName, email, phoneNumber, address, password,avatar } = req.body;
      try {
       
        const restaurantExists = await Restaurant.findOne({ email });
        if (restaurantExists) {
          res.status(400).json({ message: 'Restaurant already exists' });
          return;
        }
  
       
        const newRestaurant = new Restaurant({
          restaurantName,
          ownerName,
          email,
          phoneNumber,
          address,
          password: await bcrypt.hash(password, 10), 
          avatar,
        });
  
        
        await newRestaurant.save();
  
        res.status(201).json({
          message: 'Restaurant registered successfully.',
        });
      } catch (error) {
        res.status(500).json({ message: 'Registration failed, please try again.' });
      }
    },
  ];
  

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurants = await Restaurant.find({});
        res.json(restaurants);
       
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch restaurants' });
    }
};
export const blockUnblockRestaurant = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log(1001)
    const { id } = req.params;
    const { isBlocked } = req.body; 
    
    
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      res.status(404).json({ message: 'Restaurant not found' });
      return;
    }

    
    restaurant.isBlocked = isBlocked;

    await restaurant.save();

    res.status(200).json({ message: `Restaurant has been ${restaurant.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while updating the user status' });
  }
};

export const restaurantlogin = async (req: Request, res: Response): Promise<void> => {
  console.log("r1")
  const { email, password } = req.body;

  try {
    const restaurant: IRestaurant | null = await Restaurant.findOne({ email });
    console.log(restaurant,"restoaurant user")
    if (!restaurant) {
      res.status(400).json({ message: 'Email not registered' });
      return;
    }

  // Ensure JWT_SECRET is defined

    if (restaurant.password && (await bcrypt.compare(password, restaurant.password))) {
      const token = jwt.sign(
        { userId: restaurant._id.toHexString(), email: restaurant.email },
        process.env.JWT_SECRET as string, 
        { expiresIn: '1h' } as SignOptions
      );

      res.status(200).json({
        message: 'Login successful',
        userId: restaurant._id.toHexString(),
        restaurant,
        token,
      });
    } else {
      res.status(400).json({ message: 'Wrong password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





export const addCategory = [
  upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const avatar = req.file;

   

    try {
      
      const categoryExists = await Category.findOne({ name });
      if (categoryExists) {
        res.status(400).json({ message: 'Category already exists' });
        return;
      }

      
      const newCategory = new Category({
        name,
        description,
        avatar: avatar ? avatar.buffer.toString('base64') : 'No avatar provided',
      });

      
      await newCategory.save();

      res.status(201).json({
        message: 'Category registered successfully.',
        category: newCategory,
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed, please try again.' });
    }
  },
];

 




 export const addCuisine = [
  upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, description } = req.body;
    const avatar = req.file;
  

    try {
      
      const cuisineExists = await Cuisine.findOne({ name });
      if (cuisineExists) {
        res.status(400).json({ message: 'Cuisine already exists' });
        return;
      }

      
      const newCuisine = new Cuisine({
        name,
        description,
        avatar: avatar ? avatar.buffer.toString('base64') : 'No avatar provided',
      });

      
      await newCuisine.save();

      res.status(201).json({
        message: 'Cuisine registered successfully.',
        cuisine: newCuisine,
      });
    } catch (error) {
      res.status(500).json({ message: 'Registration failed, please try again.' });
    }
  }
];



export const addFoodItem = [
  upload.single('image'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, price, quantity, category, cuisine, restaurantid ,foodType} = req.body;
    const image = req.file;

    try {
      const foodItemExists = await FoodItem.findOne({ name });
      if (foodItemExists) {
        res.status(400).json({ message: 'Food item with this name already exists' });
        return;
      }
     
      const categoryExists = await Category.findById(category);
      const cuisineExists = await Cuisine.findById(cuisine);
console.log('elloooo')
      if (!categoryExists || !cuisineExists) {
        res.status(400).json({ message: 'Invalid category or cuisine' });
        return;
      }
console.log('yessss')
      if (!mongoose.Types.ObjectId.isValid(restaurantid)) {
        console.log('noooooo')
        res.status(400).json({ message: 'Invalid restaurant ID' });
        return;
      }
      const validFoodTypes = ['Veg', 'Non-Veg'];
      if (!validFoodTypes.includes(foodType)) {
        res.status(400).json({ message: 'Invalid food type. Must be either Veg or Non-Veg' });
        return;
      }
      console.log('down')

      const restaurantId = new mongoose.Types.ObjectId(restaurantid);
      
      const newFoodItem = new FoodItem({
        name,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        category,
        cuisine,
        image: image ? image.buffer.toString('base64') : 'No image provided',
        restaurant: restaurantId, 
        foodType,
      });

      await newFoodItem.save();

      res.status(201).json({
        message: 'Food item added successfully.',
        foodItem: newFoodItem,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to add food item. Please try again.' });
    }
  },
];

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
      const categories = await Category.find({});
      res.json(categories);
     
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
export const getCuisine = async (req: Request, res: Response): Promise<void> => {
  try {
      const cuisines = await Cuisine.find({});
      res.json(cuisines);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cusine' });
  }
};

export const getFooditem = async (req: Request, res: Response): Promise<void> => {
  console.log('helooooo')
  try {
    const { name, category } = req.query; 
    console.log(req.query)
    

    let query = {};
    
   
    if (name) {
      query = { ...query, name: { $regex: name, $options: 'i' } };
     
    }
    if (category) {
      query = { ...query, category };
      
    }

    const fooditem = await FoodItem.find(query).populate('category').sort({createdAt:-1}); 


    res.json(fooditem);
  } catch (error) {
    console.error('Error fetching food items:', error);
    res.status(500).json({ message: 'Failed to fetch food items' });
  }
};


export const DeleteFoodItem = async (req: Request, res: Response): Promise<void> => {
  try {

    console.log('enterrrr')
    const { id } = req.params;
  

    
    const foodItem = await FoodItem.findByIdAndDelete(id);
    console.log('yesssss')

    if (!foodItem) {
      console.log('noooo')
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    res.status(200).json({ message: 'Food item has been deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the food item' });
  }
};

export const Deletecuisine = async (req: Request, res: Response): Promise<void> => {
  try {

    console.log('enterrrr')
    const { id } = req.params;
 

    
    const cuisine = await Cuisine.findByIdAndDelete(id);
    console.log('yesssss')

    if (!cuisine) {
      console.log('noooo')
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    res.status(200).json({ message: 'Food item has been deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the food item' });
  }
};

export const Deletecatagory = async (req: Request, res: Response): Promise<void> => {
  try {

    console.log('enterrrr')
    const { id } = req.params;
    console.log( req.params,'paramssss')

    
    const catagory = await Category.findByIdAndDelete(id);
    console.log('yesssss')

    if (!catagory) {
      console.log('noooo')
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

    res.status(200).json({ message: 'Food item has been deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while deleting the food item' });
  }
};



export const getRestaurantById = async (req: Request, res: Response) => {
  console.log('get enter')
  const { id } = req.params;
  console.log(id,'gotid')
  try {
    console.log('get try')
    const restaurant = await Restaurant.findById(id).exec();
    console.log(restaurant,'restaurantttttttttt')
   
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    console.log('over')
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


export const updateRestaurant = [
  upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { restaurantName, address, phoneNumber,avatar } = req.body;
   

    console.log('Request Params:', req.params);
    console.log('Request Body:', req.body);
    console.log('Uploaded File:', avatar);

    try {
      if (!id) {
        console.log('No Restaurant ID provided.');
        res.status(400).json({ message: 'Restaurant ID is required' });
        return;
      }

      console.log('Restaurant ID:', id);

  
      const updateData: any = { restaurantName, address, phoneNumber,avatar };
      console.log('Initial Update Data:', updateData);

    

      console.log('Updating restaurant in database...');
      const updatedRestaurant = await Restaurant.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedRestaurant) {
        console.log('Restaurant not found for ID:', id);
        res.status(404).json({ message: 'Restaurant not found' });
        return;
      }

      console.log('Updated Restaurant:', updatedRestaurant);
      res.status(200).json(updatedRestaurant);
    } catch (error) {
      console.error('Error updating restaurant:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
];

export const getFoodItemById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {

    const foodItem = await FoodItem.findById(id).exec();


    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }


    res.json(foodItem);
  } catch (error) {

    res.status(500).json({ message: 'Server error', error });
  }
};


export const updateFoodItem = [
  upload.single('image'), 
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, price, quantity, category, cuisine, image } = req.body;

    console.log('Request Params:', req.params);
    console.log('Request Body:', req.body); 

    try {
      if (!id) {
        console.log('No Food Item ID provided.');
        res.status(400).json({ message: 'Food Item ID is required' });
        return;
      }

      console.log('Food Item ID:', id);
         let processedImage = image;
      if (processedImage && processedImage.startsWith('data:image/jpeg;base64,')) {
        processedImage = processedImage.replace(/^data:image\/jpeg;base64,/, '');
      }

    
      const updateData: any = { 
        name, 
        price, 
        quantity, 
        category, 
        cuisine, 
        image: processedImage 
      };

     
      console.log('Updating food item in database...');
      const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      if (!updatedFoodItem) {
        console.log('Food item not found for ID:', id);
        res.status(404).json({ message: 'Food item not found' });
        return;
      }

      console.log('Updated Food Item:', updatedFoodItem);
      res.status(200).json(updatedFoodItem);
    } catch (error) {
      console.error('Error updating food item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
];


export const getOrderstorestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; 
   


    const orders = await Order.find({ "foodItems.restaurant": id }) 
      .populate('user', 'name email')
      .populate('foodItems.foodItem', 'name category cuisine price')
      .populate('address','street city postalCode')

    console.log(orders, 'orders from backend');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};



export const makeorderupdate = async (req: Request, res: Response) => {
  try {
    console.log("Order ID received:", req.params.id);
    const orderId = req.params.id;
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    );

    if (!updatedOrder) {
      console.error("Order not found:", orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order status updated to FOOD PREPARING',
      order: updatedOrder,
     
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};




export const getDashboardData = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  console.log(`Restaurant ID: ${restaurantId}`);

  try {
    
    console.log("Fetching total revenue...");
    const totalRevenueData = await Order.aggregate([
      { $unwind: '$foodItems' }, 
      { $match: { 'foodItems.restaurant': new mongoose.Types.ObjectId(restaurantId) } }, 
      {
        $group: {
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' }, 
        },
      },
    ]);

    console.log('Total Revenue:', totalRevenueData[0]?.totalRevenue || 0);

    const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;
    console.log(`Total Revenue: ${totalRevenue}`);


    console.log("Fetching all orders...");
    const orders = await Order.aggregate([
      { $unwind: '$foodItems' },
      { $match: { 'foodItems.restaurant': new mongoose.Types.ObjectId(restaurantId) } },
      {
        $lookup: {
          from: 'fooditems', 
          localField: 'foodItems.foodItem',
          foreignField: '_id', 
          as: 'foodItemDetails',
        },
      },
      { $unwind: '$foodItemDetails' },
      {
        $group: {
          _id: '$_id', 
          user: { $first: '$user' }, 
          address: { $first: '$address' }, 
          createdAt: { $first: '$createdAt' },
          orderStatus: { $first: '$orderStatus' },
          paymentMethod: { $first: '$paymentMethod' },
          paymentStatus: { $first: '$paymentStatus' },
          totalAmount: { $first: '$totalAmount' },
          foodItems: { $push: { foodItem: '$foodItemDetails.name', quantity: '$foodItems.quantity', price: '$foodItemDetails.price' } }, 
        },
      },
    ]);

    console.log(`Fetched ${orders.length} orders`);


    console.log("Calculating revenue by category...");
    const revenueByCategory = await Order.aggregate([
      { $unwind: '$foodItems' }, 
      { $match: { 'foodItems.restaurant': new mongoose.Types.ObjectId(restaurantId) } },
      {
        $lookup: {
          from: 'fooditems', 
          localField: 'foodItems.foodItem', 
          foreignField: '_id',
          as: 'foodItemDetails',
        },
      },
      { $unwind: '$foodItemDetails' },
      {
        $lookup: {
          from: 'categories', 
          localField: 'foodItemDetails.category', 
          foreignField: '_id',
          as: 'categoryDetails', 
        },
      },
      { $unwind: '$categoryDetails' },
      {
        $group: {
          _id: '$categoryDetails.name',
          revenue: { $sum: '$foodItems.quantity' }, 
        },
      },
      {
        $project: {
          category: '$_id',
          revenue: 1,
          _id: 0,
        },
      },
    ]);

    console.log("Revenue by Category:", revenueByCategory);

    res.status(200).json({
      totalRevenue,
      orders,
      revenueByCategory,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};


export const getFilteredOrders = async (req: Request, res: Response) => {
  const { restaurantId } = req.params;
  const { startDate, endDate } = req.query;
  console.log(`Restaurant ID: ${restaurantId}`);
  console.log(`Start Date: ${startDate}, End Date: ${endDate}`);

  try {
    console.log("Fetching filtered orders...");
    const filteredOrders = await Order.find({
      restaurant: restaurantId,
      createdAt: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string),
      },
    }).sort({ createdAt: -1 });

    console.log(`Fetched ${filteredOrders.length} filtered orders`);
    res.status(200).json({ filteredOrders });
  } catch (error) {
    console.error('Error filtering orders by date:', error);
    res.status(500).json({ message: 'Error filtering orders by date' });
  }
};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
export const getConversations = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.params.id;
    console.log(restaurantId,'restaurantiddd')
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({ message: 'Invalid restaurantId format' });
    }

    const conversations = await Conversation.find({ restaurantId }).populate('userId');
    console.log(conversations,'conversationnn')

    if (!conversations.length) {
      return res.status(404).json({ message: 'No conversations found for this restaurant' });
    }
    res.status(200).json(conversations);
    console.log(conversations, 'Fetched conversations');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;
    const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
   
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

export const sendMessage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId, senderId, message } = req.body;


    const content = message; 
    const validConversationId = new mongoose.Types.ObjectId(conversationId);
    const validSenderId = new mongoose.Types.ObjectId(senderId);


    const newMessage: IMessage = new Message({
      conversationId: validConversationId,
      senderId: validSenderId,
      content,
    });
    console.log(newMessage,'messsageeeerrrrrrrrrrrrrrrrrr')

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error: any) {
    console.error('Error sending message:', error.message || error);
    res.status(500).json({ message: 'Error sending message', error });
  }
};
