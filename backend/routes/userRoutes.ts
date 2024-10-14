import express from 'express';
import authenticateJWT from '../middlewares/Authmiddleware'
import { registerUser,verifyOtp,googleregister,login,getFoodItemsByCategory,getRestaurantById,getFoodItemsByRestaurant,
    updateProfile,addToCart,getCartItemsByUserId,getFoodItemById,clearCart,removeCartItem,updateCartItem,getAddresses, addAddress,
    createOrder,getOrderDetails,saveOrder,getFoodItemByIddd,getOrdersByUserId} from '../controller/userController';
    // import { authMiddleware } from '../middlewares/Authmiddleware';
const router = express.Router();

router.post('/signup', registerUser);
router.post('/verify-otp',verifyOtp)
router.post('/googlesignup',googleregister)
router.post('/login',login)
router.get('/fooditem',authenticateJWT, getFoodItemsByCategory)
router.get('/restaurant/:id',authenticateJWT, getRestaurantById);

// Define route to get food items by restaurant ID
router.get('/fooditems',authenticateJWT, getFoodItemsByRestaurant);
router.post('/update-profile',authenticateJWT, updateProfile);

router.post ('/addtocart',authenticateJWT,addToCart)
router.get('/usercart',authenticateJWT, getCartItemsByUserId)
router.get('/fooditemid',authenticateJWT, getFoodItemById)


router.delete('/clearCart',authenticateJWT, clearCart);
router.delete('/removeItem',authenticateJWT, removeCartItem)


router.post('/updatecartitem',authenticateJWT, updateCartItem);

router.get('/addresses/:id',authenticateJWT, getAddresses);

// Route to add a new address
router.post('/address',authenticateJWT,  addAddress);


router.post('/createOrder',authenticateJWT, createOrder)

router.get('/orders/:paymentId',authenticateJWT, getOrderDetails);

router.post('/saveOrder',authenticateJWT,saveOrder)

router.get('/:id',authenticateJWT, getFoodItemByIddd)

router.get('/orderss/:userId',authenticateJWT, getOrdersByUserId);





export default router;