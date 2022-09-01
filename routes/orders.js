const express = require('express')
const order = require('../models/order')
const router = express.Router()
const Order = require('../models/order')
const OrderItem = require('../models/orderItem')

router.get(`/`, async (req, res) => {
    const getAllItems = await Order.find().sort({dateOrdered: -1}).populate('user', "name")

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.get(`/:id`, async (req, res) => {
    const getAllItems = await Order.findById(req.params.id)
    .populate('user', "name")
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    })

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.post(`/`, async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map( async (orderitem) => {
        const newOrderItem = new OrderItem({
            quantity: orderitem.quantity,
            product: orderitem.product
        })

        await newOrderItem.save()

        return newOrderItem.id
    }))

    const orderItemsIdsResolved = await orderItemsIds

    console.log(orderItemsIdsResolved)

    const newOrder = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: req.body.totalPrice,
        user: req.body.user,
    })

    try {    
        await newOrder.save()
    
        if (!newOrder) {
            return res.status(500).json({message: 'The order can not be saved'})
        }
    } catch (err) {
        console.log(err)
    }
    
    res.send(newOrder)
})

module.exports = router