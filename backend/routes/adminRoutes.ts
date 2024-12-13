import express from 'express';
import authenticateJWT from '../middlewares/Authmiddleware'
import {adminlogin,getUsers,blockUnblockUser,getTotalRevenue,getTotalOrders,getTotalRestaurants,getTotalUsers, getTopRestaurants} from '../controller/adminController'
import {blockUnblockRestaurant, getRestaurants, registerRestaurant,getRestaurantById,updateRestaurant,updateFoodItem,getFoodItemById} from '../controller/restaurantController'
import {registerDeliveryPerson,getDeliveryPersons,blockUnblockDeliveryboy} from '../controller/deliveryController'
const router = express.Router();

router.post('/adminlogin',adminlogin)
router.get('/users',authenticateJWT,getUsers)
router.put('/users/:id/block',authenticateJWT,blockUnblockUser)
router.post('/restaurantsignup',authenticateJWT,registerRestaurant)
router.post('/deliverypersonsignup',authenticateJWT,registerDeliveryPerson)
router.get('/restaurants',getRestaurants)
router.put('/restaurant/:id/block',authenticateJWT,blockUnblockRestaurant)
router.get('/delivery-persons',getDeliveryPersons)
router.put('/delivery-persons/:id/block',authenticateJWT,blockUnblockDeliveryboy)
router.put('/updaterestaurant/:id',authenticateJWT,updateRestaurant)
router.get('/restaurant/:id',authenticateJWT, getRestaurantById);
router.put('/updatefooditem/:id',updateFoodItem);
router.get('/fooditem/:id',authenticateJWT, getFoodItemById);

router.get('/total-users', getTotalUsers);
router.get('/total-restaurants', getTotalRestaurants);
router.get('/total-orders', getTotalOrders);
router.get('/total-revenue', getTotalRevenue);
router.get('/top-restaurants', getTopRestaurants);



export default router;