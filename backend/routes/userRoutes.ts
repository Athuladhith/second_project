import express from 'express';
import authenticateJWT from '../middlewares/Authmiddleware'
import { registerUser,verifyOtp,googleregister,login,getFoodItemsByCategory,getRestaurantById,getFoodItemsByRestaurant,
    updateProfile,addToCart,getCartItemsByUserId,getFoodItemById,clearCart,removeCartItem,updateCartItem,getAddresses, addAddress,
    createOrder,getOrderDetailss,saveOrder,getFoodItemByIddd,getOrdersByUserId, getMessages,reportRestaurant,makeorderupdate,getOrderdetails,getRestaurantss,getMessagesByConversation,sendMessage,getConversationsByUser,createConversation,
} from '../controller/userController';
  
const router = express.Router();

router.post('/signup', registerUser);
router.post('/verify-otp',verifyOtp)
router.post('/googlesignup',googleregister)
router.post('/login',login)
router.get('/fooditem',authenticateJWT, getFoodItemsByCategory)
router.get('/restaurant/:id', getRestaurantById);


router.get('/fooditems',authenticateJWT, getFoodItemsByRestaurant);
router.post('/update-profile',authenticateJWT, updateProfile);

router.post ('/addtocart',authenticateJWT,addToCart)
router.get('/usercart',authenticateJWT, getCartItemsByUserId)
router.get('/fooditemid',authenticateJWT, getFoodItemById)


router.delete('/clearCart',authenticateJWT, clearCart);
router.delete('/removeItem',authenticateJWT, removeCartItem)


router.post('/updatecartitem',authenticateJWT, updateCartItem);

router.get('/addresses/:id', getAddresses);


router.post('/address',authenticateJWT,  addAddress);


router.post('/createOrder',authenticateJWT, createOrder)

router.get('/orders/:paymentId',authenticateJWT, getOrderDetailss);

router.post('/saveOrder',authenticateJWT,saveOrder)

router.get('/:name',authenticateJWT, getFoodItemByIddd)

router.get('/orderss/:userId',authenticateJWT, getOrdersByUserId);
router.get('/orderdetails/:orderId',authenticateJWT,getOrderdetails);
router.get('/restaurantss',authenticateJWT,getRestaurantss)

router.post('/conversations', createConversation); 
router.get('/:userId', getConversationsByUser);

router.post('/messages', sendMessage); 
router.get('/messages/:conversationId', getMessagesByConversation);
router.get('/getmessages', getMessages)

router.post('/report/:id',reportRestaurant)





export default router;