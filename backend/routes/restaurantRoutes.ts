import express from 'express'
import authenticateJWT from '../middlewares/Authmiddleware'
import { restaurantlogin,addCategory,addCuisine ,addFoodItem, getCategories,getCuisine,getFooditem,DeleteFoodItem,Deletecatagory,Deletecuisine, getOrderstorestaurant,} from '../controller/restaurantController'

const router=express.Router()


router.post('/restaurantlogin',authenticateJWT,restaurantlogin)
router.post('/addcategory',authenticateJWT,addCategory)
router.post('/addcuisine',authenticateJWT,addCuisine)
router.post('/addfooditem',authenticateJWT,addFoodItem)
router.get('/categories',authenticateJWT,getCategories)
router.get('/cuisine',authenticateJWT,getCuisine)
router.get('/fooditem',authenticateJWT,getFooditem)
router.delete('/fooditem/:id',authenticateJWT,DeleteFoodItem)
router.delete('/cuisine/:id',authenticateJWT,Deletecuisine)
router.delete('/catagory/:id',authenticateJWT,Deletecatagory)
router.get('/orders/:id', getOrderstorestaurant);

;

export default router