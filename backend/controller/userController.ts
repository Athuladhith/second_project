import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer, { Multer, StorageEngine } from 'multer';
import User, { IUser } from '../models/userModel';
import jwt, { SignOptions } from 'jsonwebtoken';
import { sendEmail } from '../services/emailServices'; 
import FoodItem from '../models/fooditemModel';
import Restaurant from '../models/restaurantModel';
import Category from '../models/categoryModel';
import Cart from '../models/cartModel'
import Address from '../models/addressModel';
import Order from '../models/orderModel';
import { ICart } from '../models/cartModel';
import Message, { IMessage } from '../models/messageModel'
import Conversation, { IConversation } from '../models/conversationModel';
import mongoose from 'mongoose';
import Razorpay from 'razorpay';



const storage = multer.memoryStorage();
const upload = multer({ storage });


const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); 
};

let registrationData: any;
let storedOtp: string | undefined;

export const registerUser = [
  upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, phoneNumber,avatar } = req.body;

  

    try {
      console.log('1')
      const userExists: IUser | null = await User.findOne({ email });
      console.log('2')
      if (userExists) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }
      console.log('3')
      
      registrationData = {
        name,
        email,
        phoneNumber,
        password,
        avatar,
      };

      
      const otp = generateOTP();
      storedOtp = otp;
      await sendEmail(
        email,
        'Your OTP for Registration',
       ` Your OTP for registration is ${otp}. It will expire in 10 minutes.`
      );

      res.status(201).json({
        message: 'User registered. Please verify your OTP sent to your email.',
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data' });
    }
  },
];

export const googleregister = [
  upload.single('avatar'),
  async (req: Request, res: Response): Promise<void> => {
    const { name, email } = req.body;

    try {
      const userExists: IUser | null = await User.findOne({ email });
      if (userExists) {
        res.status(200).json({
          message: 'Login successful',
          userId: userExists._id.toHexString(),
        });
      } else {
        res.status(400).json({ message: 'Email not registered' });
      }
    } catch (error) {
      res.status(400).json({ message: 'Invalid user data' });
    }
  },
];


export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user: IUser | null = await User.findOne({ email });
    
    if (!user) {
     res.status(400).json({ message: 'Email not registered' });
     return 
    }

    if (user.isBlocked) {
       res.status(403).json({ message: 'User is blocked' });
       return
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
       res.status(400).json({ message: 'Incorrect password' });
       return
    }

  
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, isAdmin: user.isAdmin },
      process.env.JWT_SECRET as string,
      { expiresIn: '2h' }
    );

 
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
      },
      token,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: 'Server error' });
    return
  }
};


export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  const {  receivedOtp} = req.body;
  console.log(receivedOtp,"recived otp")
console.log(storedOtp,"stord otp")

  try {
    if (receivedOtp === storedOtp) {
      const hashedPassword = await bcrypt.hash(registrationData.password, 10);

      const user: IUser = await User.create({
        ...registrationData,
        password: hashedPassword,
        isAdmin: false,
        isBlocked: false,
        isVerified: true,
      });

      res.status(201).json({
        message: 'User registered successfully',
        userId: user._id.toHexString(),
      });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
export const getFoodItemsByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
      const { category } = req.query;
      console.log(category,'category') 

      if (!category) {
          res.status(400).json({ message: 'Category ID is required' });
          return;
      }

      const foodItem = await FoodItem.find({ category }); 
console.log(foodItem,'fooditem')
      res.status(200).json(foodItem); 
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch food items' });
  }
};

export const getRestaurantById = async (req: Request, res: Response) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(restaurant);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
export const getFoodItemsByRestaurant = async (req: Request, res: Response) => {
  try {
    const { restaurant } = req.query;
    
    
    const page = parseInt(req.query.page as string) || 1; 
    const limit = parseInt(req.query.limit as string) || 10;

    const skip = (page - 1) * limit; 


    const foodItems = await FoodItem.find({ restaurant })
      .skip(skip)
      .limit(limit);


    const totalItems = await FoodItem.countDocuments({ restaurant });

    res.json({
      foodItems,
      pagination: {
        totalItems,
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit),
        limit,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  const { id, name, email, phoneNumber, avatar } = req.body;

  console.log(req.body,'boooddddyyyyyy')

  try {

    if (!id) {
      res.status(400).json({ message: 'User ID is required' });
      return;
    }


    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phoneNumber, avatar },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const addToCart = async (req: Request, res: Response): Promise<void> => {
  console.log('helloo')
  try {
    const { foodItemId, userId, quantity } = req.body;
    console.log(foodItemId,userId, quantity,'bbbbbbbbbbbbboooooooooooth')




    const foodItem = await FoodItem.findById(foodItemId);
    console.log('fooodddd')
    if (!foodItem) {
      res.status(404).json({ message: 'Food item not found' });
      return;
    }

 
    let cart = await Cart.findOne({ user: userId});
    console.log('carrtttt')
    if (!cart) {
      cart = new Cart({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }
    

    const itemIndex = cart.items.findIndex(item => item.foodItem.toString() === foodItemId._id.toString());

    if (itemIndex > -1) {
  
      cart.items[itemIndex].quantity += quantity;
      cart.items[itemIndex].price = foodItem.price; 
    } else {
      
      const newItem = {
        foodItem: foodItem,
        quantity,
        price: foodItem.price,
      };

      cart.items.push(newItem as any);
    }

   
    cart.totalPrice = cart.items.reduce((total, item) => total + item.price * item.quantity, 0);

   
    await cart.save();

    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while adding the item to the cart' });
  }
};


export const getCartItemsByUserId = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const userId = req.query.userId as string; 

  try {
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const cart = await Cart.findOne({user: userId })

    
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    return res.json({ items: cart.items });
  } catch (error) {
    console.error('Error fetching cart items:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFoodItemById = async (req: Request, res: Response): Promise<Response<any, Record<string, any>>> => {
  const fooditemId = req.query.foodItemId as string; 
  const restaurantId=req.query.restaurant as string;
  const { id } = req.params; 
  console.log(fooditemId,'fooooditemidddd');
  console.log(restaurantId,'restaurant id');
  

  try {
   
    if (!fooditemId) {
      return res.status(400).json({ message: 'Food item ID is required' });
    }

    
    const foodItem = await FoodItem.findById(fooditemId);
    console.log(foodItem,'foooooooooooggggggggggggggg')

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    return res.json(foodItem);
  } catch (error) {
    console.error('Error fetching food item:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};


export const removeCartItem = async (req: Request, res: Response): Promise<Response> => {
  const userId  =  req.query.userId as string;
  const itemId=req.query.itemId as string;
console.log('entered')
console.log(userId,'userid')
  try {
  
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

 
    cart.items = cart.items.filter((item) => item.foodItem.toString() !== itemId);


    await cart.save();

    return res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};


export const clearCart = async (req: Request, res: Response): Promise<Response> => {
  const  userId  = req.query.userId as string;

  try {
  
    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }


    cart.items = [];


    await cart.save();

    return res.status(200).json({ message: 'Cart cleared', cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const updateCartItem = async (req: Request, res: Response) => {
  const { userId, foodItemId, newQuantity } = req.body;

  if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(foodItemId)) {
    return res.status(400).json({ message: 'Invalid user or food item ID' });
  }

  try {
    
    const foodItem = await FoodItem.findById(foodItemId);

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }


    if (newQuantity > foodItem.quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }


    const cart = await Cart.findOne({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cart.items.find(item => item.foodItem.toString() === foodItemId);

    if (!cartItem) {
      return res.status(404).json({ message: 'Food item not found in cart' });
    }


    const previousQuantity = cartItem.quantity;
    const quantityDifference = newQuantity - previousQuantity;
    cartItem.quantity = newQuantity;
    cartItem.price = foodItem.price * newQuantity;


    cart.totalPrice += foodItem.price * quantityDifference;

    await cart.save();


    foodItem.quantity -= quantityDifference;
    await foodItem.save();

    res.json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    res.status(500).json({ message: 'Error updating cart', error });
  }
};

export const getAddresses = async (req: Request, res: Response) => {
  try {
    const userId = req.params.id;
    console.log(`[INFO] Fetching addresses for userId: ${userId}`);


    if (!userId) {
      console.error('[ERROR] User ID not provided in the request');
      return res.status(400).json({ error: 'User ID is required' });
    }

    const addresses = await Address.find({ user: userId });
    
    if (addresses.length === 0) {
      console.warn(`[WARNING] No addresses found for userId: ${userId}`);
    } else {
      console.log(`[SUCCESS] ${addresses.length} addresses fetched successfully for userId: ${userId}`);
    }


    res.status(200).json(addresses);
  } catch (error) {
    console.error(`[ERROR] Error fetching addresses for userId: ${req.params.id}. Error: {'an error meee occureddd'}`);
    res.status(500).json({ error: 'Error fetching addresses' });
  }
};


export const addAddress = async (req: Request, res: Response) => {
  try {
    
    const { userId, street, city, state, postalCode, country } = req.body;

    console.log('Request body:', req.body);

    if (!userId) {
      console.log('Error: User ID not provided in addAddress');
      return res.status(400).json({ error: 'User ID is required' });
    }

    console.log('Adding new address for userId:', userId);

    const newAddress = new Address({
      user: userId,
      street,
      city,
      state,
      postalCode,
      country,
    });

    await newAddress.save();
    console.log('New address saved successfully:', newAddress);
    
    res.status(201).json(newAddress);
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Error adding address' });
  }
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string, 
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});


interface OrderRequestBody {
  amount: number;
  currency: string;
  orderData: {
    user: string;   
    address: string;
    foodItems: any[]; 
    totalAmount: number;
    paymentMethod: string;
  };
}

export const createOrder = async (req: Request, res: Response) => {
  console.log('Starting createOrder function');

  try {
  
    const isCOD = req.body.paymentMethod === 'COD';
    const { amount, currency, orderData }: OrderRequestBody = isCOD
      ? { amount: req.body.totalAmount * 100, currency: 'INR', orderData: req.body }
      : req.body;

    console.log('Received request body:', req.body);

   
    const { user, address, foodItems, totalAmount, paymentMethod } = orderData;

    console.log('Order data extracted:', {
      user,
      address,
      foodItems,
      totalAmount,
      paymentMethod,
    });

    if (!amount || !currency) {
      console.log('Missing amount or currency:', { amount, currency });
      return res.status(400).json({
        success: false,
        message: 'Amount and currency are required to create an order',
      });
    }

    if (paymentMethod === 'COD') {
      console.log('Processing COD order');
      return res.status(201).json({
        success: true,
        orderId: 'COD-' + new Date().getTime(), 
        amount: totalAmount,
        currency: 'INR',
        user,
        address,
        foodItems,
        totalAmount,
        paymentMethod,
        
      });
    }


    console.log('Creating order with Razorpay API with options:', { amount, currency });
    const order = await razorpay.orders.create({ amount, currency });

    console.log('Order created successfully:', order);

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      user,
      address,
      foodItems,
      totalAmount,
      paymentMethod,
    });

    console.log('Response sent successfully to the client');
  } catch (error) {
    console.error('Error occurred during order creation:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to create the order',
      error: 'An error occurred',
    });

    console.log('Error response sent to the client');
  }
};


export const saveOrder = async (req: Request, res: Response) => {
  console.log('Starting saveOrder function');
  
  const { paymentId, orderId, user, address, foodItems, totalAmount, paymentMethod } = req.body;

  try {

    const newOrder = new Order({
      user,
      address,
      foodItems: foodItems.map((item: any) => ({
        foodItem: item.id,
        quantity: item.quantity,
        restaurant:item.restaurant
      })),
      totalAmount,
      paymentMethod,
      paymentId:  paymentId,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid', 
      orderStatus: 'placed',
    });

    const savedOrder = await newOrder.save();
    console.log('Order saved successfully:', savedOrder);

    res.status(201).json({
      success: true,
      order: savedOrder,
    });
  } catch (error) {
    console.error('Error saving order:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to save the order',
    });
  }
};





export const getOrderDetailss = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  console.log(`Received request to fetch order details for Payment ID: ${paymentId}`);

  try {
 
    console.log('Searching for the order in the database...');

   
    const order = await Order.find({ paymentId }) 
    .populate('user', 'name email phoneNumber') 
    .populate('address') 
    .populate({
      path: 'foodItems.foodItem',
      select: 'name category cuisine price'
    }); 

 
    if (!order) {
      console.log(`Order with Payment ID ${paymentId} not found.`);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log(`Order found: ${JSON.stringify(order)}`);

 
    console.log(`Returning order details for Payment ID: ${paymentId}`);
    return res.status(200).json(order);
  } catch (error) {
  
    console.error(`Error occurred while fetching order details for Payment ID: ${paymentId}`);
    console.error('Error details:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};



export const getFoodItemByIddd = async (req: Request, res: Response) => {
  const { name } = req.params;
  console.log(name,"44444411111")

  try {
   
    const foodItem = await FoodItem.findOne({name:name});
    

    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    res.json(foodItem);
  } catch (error) {
    console.error('Error fetching food item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getOrdersByUserId = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;


    const orders = await Order.find({ user: userId })
      .populate('foodItems.foodItem', 'name')
      .sort({ createdAt: -1 }); 

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: 'No orders found for this user' });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const makeorderupdate = async (req: Request, res: Response) => {
  try {
    console.log("Order ID received:", req.params.id);
    const orderId = req.params.id;
    const { id } = req.params;

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: 'FOOD PREPARING' },
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

export const getOrderdetails=async(req:Request,res:Response)=>{
  try {
    const {orderId}=req.params;
    const order = await Order.findById(orderId).populate('foodItems.foodItem', 'name price') 
    .populate('foodItems.restaurant', 'name')
    .populate('address', 'street city state postalCode country')
    .populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ message: 'Failed to fetch order details' });
  }
}

export const getRestaurantss = async (req: Request, res: Response): Promise<void> => {

  try {

    console.log('hellooo i am innn')
      const restaurants = await Restaurant.find({});
      res.json(restaurants);
     
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch restaurants' });
  }
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const createConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('helloooooooo')
    const { restaurantId, userId } = req.body;
    const existingConversation = await Conversation.findOne({ restaurantId, userId });

    if (existingConversation) {
      res.status(200).json(existingConversation);
      return;
    }

    const conversation: IConversation = new Conversation({ restaurantId, userId });
    const savedConversation = await conversation.save();

    res.status(201).json(savedConversation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating conversation', error });
  }
};

export const getConversationsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const conversations = await Conversation.find({ userId }).populate('restaurantId', 'name');

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error });
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
    console.log(newMessage,'messsageeee')

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (error: any) {
    console.error('Error sending message:', error.message || error);
    res.status(500).json({ message: 'Error sending message', error });
  }
};

export const getMessagesByConversation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
   

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};




export const reportRestaurant = async (req: Request, res: Response) => {
  console.log('enteredd')
  const restaurantId = req.params.id;
  const { userId } = req.body;
  console.log('object')
  console.log(userId,'user id from back')
  console.log(restaurantId,'restaurant from backk')

  try {
    console.log('yes')
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }
    console.log('nooo');


    // Add the report
    restaurant.reports.push({ userId, reportedAt: new Date() });
    await restaurant.save();

    return res.status(200).json({ message: 'Restaurant reported successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to report restaurant', error });
  }
};




export const getMessages = async (req: Request, res: Response) => {
  try {
    const { restaurantId, userId } = req.query;


    if (!restaurantId || !userId) {
      return res.status(400).json({ message: 'Missing restaurantId or userId' });
    }

    const messages = await Message.find({
      conversationId: { $in: [restaurantId, userId] }, 
    }).sort({ timestamp: 1 }); 

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
};

