import express from 'express'
import{deliveryboylogin,deliveryOrders,makeorderupdates,makeorderupdatess}from'../controller/deliveryController'
const router=express.Router()



router.post('/deliveryboylogin',deliveryboylogin)
router.get('/deliveryorder/:id',deliveryOrders)
router.post('/orderupdates/:id',makeorderupdates)
router.post('/orderupdatess/:id',makeorderupdatess)



export default router