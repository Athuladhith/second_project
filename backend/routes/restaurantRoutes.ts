import express from 'express'
import restaurantauthenticateJWT from '../middlewares/restaurantAuth'
import { getConversations, getMessages, sendMessage, restaurantlogin,addCategory,getDashboardData,getFilteredOrders,addCuisine ,addFoodItem, getCategories,getCuisine,getFooditem,DeleteFoodItem,Deletecatagory,Deletecuisine, getOrderstorestaurant,makeorderupdate} from '../controller/restaurantController'

const router=express.Router()


router.post('/restaurantlogin',restaurantlogin)
router.post('/addcategory',restaurantauthenticateJWT,addCategory)
router.post('/addcuisine',restaurantauthenticateJWT,addCuisine)
router.post('/addfooditem',restaurantauthenticateJWT,addFoodItem)
router.get('/categories',getCategories)
router.get('/cuisine',restaurantauthenticateJWT,getCuisine)
router.get('/fooditem',restaurantauthenticateJWT,getFooditem)
router.delete('/fooditem/:id',restaurantauthenticateJWT,DeleteFoodItem)
router.delete('/cuisine/:id',restaurantauthenticateJWT,Deletecuisine)
router.delete('/catagory/:id',restaurantauthenticateJWT,Deletecatagory)
router.get('/orders/:id', getOrderstorestaurant);
router.post('/orderupdate/:id',makeorderupdate);
router.get('/dashboard/:restaurantId', getDashboardData);


router.get('/orders/:restaurantId', getFilteredOrders);

router.get('/conversations/:id', getConversations);


router.get('/messages/:conversationId', getMessages);


router.post('/message', sendMessage);

export default router