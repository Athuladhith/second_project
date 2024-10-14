import express from 'express';
import authenticateJWT from '../middlewares/Authmiddleware'
import {adminlogin,getUsers,blockUnblockUser} from '../controller/adminController'
import {blockUnblockRestaurant, getRestaurants, registerRestaurant,getRestaurantById,updateRestaurant,updateFoodItem,getFoodItemById} from '../controller/restaurantController'
import {registerDeliveryPerson,getDeliveryPersons,blockUnblockDeliveryboy} from '../controller/deliveryController'
const router = express.Router();

router.post('/adminlogin',adminlogin)
router.get('/users',authenticateJWT,getUsers)
router.put('/users/:id/block',authenticateJWT,blockUnblockUser)
router.post('/restaurantsignup',authenticateJWT,registerRestaurant)
router.post('/deliverypersonsignup',authenticateJWT,registerDeliveryPerson)
router.get('/restaurants',authenticateJWT,getRestaurants)
router.put('/restaurant/:id/block',authenticateJWT,blockUnblockRestaurant)
router.get('/delivery-persons',authenticateJWT,getDeliveryPersons)
router.put('/delivery-persons/:id/block',authenticateJWT,blockUnblockDeliveryboy)
router.put('/updaterestaurant/:id',authenticateJWT,updateRestaurant)
router.get('/restaurant/:id',authenticateJWT, getRestaurantById);
router.put('/updatefooditem/:id',updateFoodItem);
router.get('/fooditem/:id',authenticateJWT, getFoodItemById);


export default router;