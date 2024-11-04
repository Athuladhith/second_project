import express from 'express'
import{deliveryboylogin,deliveryOrders}from'../controller/deliveryController'
const router=express.Router()



router.post('/deliveryboylogin',deliveryboylogin)
router.get('/deliveryorder/:id',deliveryOrders)



export default router