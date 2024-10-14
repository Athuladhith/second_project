import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import multer, { Multer, StorageEngine } from 'multer';
import Restaurant from '../models/restaurantModel'
import jwt, { SignOptions } from 'jsonwebtoken'
import { IRestaurant } from '../models/restaurantModel';
import Category from '../models/categoryModel';
import Cuisine from '../models/cuisineModel'
import FoodItem from '../models/fooditemModel';
import mongoose from 'mongoose';
import Order from '../models/orderModel';
import path from 'path';
import fs from 'fs'

// const storage: StorageEngine = multer.memoryStorage();
// const upload: Multer = multer({ storage });

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
    console.log(id,"idddddddddd")
    console.log(isBlocked,"isblocked")
    
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


    if (restaurant.password && (await bcrypt.compare(password, restaurant.password))) {
      const token = jwt.sign(
        { userId: restaurant._id.toHexString(), email: restaurant.email },
        'your_jwt_secret_key_here', 
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
      // console.log(categories, 'Categories fetched successfully');
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch categories' });
  }
};
export const getCuisine = async (req: Request, res: Response): Promise<void> => {
  try {
      const cuisines = await Cuisine.find({});
      res.json(cuisines);
      // console.log(cuisines, 'Categories fetched successfully');
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch cusine' });
  }
};

// export const getFooditem = async (req: Request, res: Response): Promise<void> => {
//   try {
//       const fooditem = await FoodItem.find({});
//       res.json(fooditem);
//       console.log(fooditem, 'Categories fetched successfully');
//   } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch categories' });
//   }
// };
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
  upload.single('avatar'), // Multer middleware to handle single file upload
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { restaurantName, address, phoneNumber,avatar } = req.body;
    // const avatar = req.file; // Multer adds the file to `req.file`

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

      // Prepare update data
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
  const { id } = req.params; // Extract food item ID from the request parameters
  try {
    // Find the food item by its ID
    const foodItem = await FoodItem.findById(id).exec();

    // If the food item is not found, return a 404 error
    if (!foodItem) {
      return res.status(404).json({ message: 'Food item not found' });
    }

    // Return the found food item as a JSON response
    res.json(foodItem);
  } catch (error) {
    // Return a 500 status with a server error message if something goes wrong
    res.status(500).json({ message: 'Server error', error });
  }
};
// export const updateFoodItem = [
//   upload.single('image'),
//   async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { foodName, price, quantity, category, cuisine, image } = req.body;

//     console.log('Request Params:', req.params);
//     console.log('Request Body:', req.body);

//     try {
//       if (!id) {
//         console.log('No Food Item ID provided.');
//         res.status(400).json({ message: 'Food Item ID is required' });
//         return;
//       }

//       console.log('Food Item ID:', id);

//       // Find the food item by ID
//       const foodItem = await FoodItem.findById(id);
//       if (!foodItem) {
//         console.log('Food item not found for ID:', id);
//         res.status(404).json({ message: 'Food item not found' });
//         return;
//       }

//       // Update fields
//       foodItem.name = foodName || foodItem.name;
//       foodItem.price = price || foodItem.price;
//       foodItem.quantity = quantity || foodItem.quantity;
//       foodItem.category = category || foodItem.category;
//       foodItem.cuisine = cuisine || foodItem.cuisine;

//       // Handle image if provided
//       if (image) {
//         foodItem.image = image;
//       }

//       // Save the updated document
//       await foodItem.save();
//       console.log('Updated Food Item:', foodItem);

//       res.status(200).json(foodItem);
//     } catch (error) {
//       console.error('Error updating food item:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   },
// ];



export const updateFoodItem = [
  upload.single('image'), 
  async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const { name, price, quantity, category, cuisine, image } = req.body;

    console.log('Request Params:', req.params);
    console.log('Request Body:', req.body);  // Ensure the body is being received correctly

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

      // Prepare update data
      const updateData: any = { 
        name, 
        price, 
        quantity, 
        category, 
        cuisine, 
        image: processedImage 
      };

      // // Prepare update data
      // const updateData: any = { name, price, quantity, category, cuisine, image };
      // console.log('Initial Update Data:', updateData);

      // Update the food item in the database
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


// export const updateFoodItem = [
 
//   upload.single('image'), // Multer middleware to handle single file upload
//   async (req: Request, res: Response): Promise<void> => {
//     const { id } = req.params;
//     const { foodName, price, quantity, category, cuisine,image } = req.body;
//      // Multer adds the file to `req.file`

//     console.log('Request Params:', req.params);
//     console.log('Request Body:', req.body);
//     console.log('Uploaded File:', image);

//     try {
//       if (!id) {
//         console.log('No Food Item ID provided.');
//         res.status(400).json({ message: 'Food Item ID is required' });
//         return;
//       }

//       console.log('Food Item ID:', id);

//       // Prepare update data
//       const updateData: any = { foodName, price, quantity, category, cuisine, image };
//       console.log('Initial Update Data:', updateData);

     

//       console.log('Updating food item in database...');
//       const updatedFoodItem = await FoodItem.findByIdAndUpdate(
//         id,
//         updateData,
//         { new: true, runValidators: true }
//       );

//       if (!updatedFoodItem) {
//         console.log('Food item not found for ID:', id);
//         res.status(404).json({ message: 'Food item not found' });
//         return;
//       }

//       console.log('Updated Food Item:', updatedFoodItem);
//       res.status(200).json(updatedFoodItem);
//     } catch (error) {
//       console.error('Error updating food item:', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   }
// ];

// export const updateFoodItem = async (req: Request, res: Response): Promise<void> => {
//   console.log('update the food item')
//   upload.single('image')
//   const { id } = req.params;
//   const { foodName, price, quantity, category, cuisine } = req.body;
//   const image = req.file;

//   console.log('Request Params:', req.params);
//   console.log('Request Body:', req.body);
//   console.log('Uploaded File:', image);

//   try {
//     if (!id) {
//       console.log('No Food Item ID provided.');
//       res.status(400).json({ message: 'Food Item ID is required' });
//       return;
//     }

//     console.log('Food Item ID:', id);

//     // Prepare update data
//     const updateData: any = { foodName, price, quantity, category, cuisine };

//     if (image) {
//       console.log('Handling uploaded image...');
//       updateData.image = image.path; // Save the file path to the database
//       console.log('Updated Update Data with File:', updateData);
//     }

//     console.log('Updating food item in database...');
//     const updatedFoodItem = await FoodItem.findByIdAndUpdate(
//       id,
//       updateData,
//       { new: true, runValidators: true }
//     );

//     if (!updatedFoodItem) {
//       console.log('Food item not found for ID:', id);
//       res.status(404).json({ message: 'Food item not found' });
//       return;
//     }

//     console.log('Updated Food Item:', updatedFoodItem);
//     res.status(200).json(updatedFoodItem);
//   } catch (error) {
//     console.error('Error updating food item:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

export const getOrderstorestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // restaurant id from frontend
    console.log(id, 'restaurant id from frontend');

    // Find all orders that contain food items associated with this restaurant
    const orders = await Order.find({ "foodItems.restaurant": id }) // Filter by restaurant ID in foodItems
      .populate('user', 'name email') // Populate user data
      .populate('foodItems.foodItem', 'name category cuisine price'); // Populate food item data

    console.log(orders, 'orders from backend');

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

