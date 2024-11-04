import express from 'express'
import restaurantauthenticateJWT from '../middlewares/restaurantAuth'
import { restaurantlogin,addCategory,addCuisine ,addFoodItem, getCategories,getCuisine,getFooditem,DeleteFoodItem,Deletecatagory,Deletecuisine, getOrderstorestaurant,} from '../controller/restaurantController'

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

;

export default router