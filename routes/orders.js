const express = require('express')
const router = express.Router()
const Order = require('../models/order')
const OrderItem = require('../models/orderItem')

router.get(`/`, async (req, res) => {
    const getAllOrder = await Order.find().sort({dateOrdered: -1}).populate('user', "name")

    if (!getAllOrder) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllOrder)
})

router.get(`/:id`, async (req, res) => {
    const getOneOrder = await Order.findById(req.params.id)
    .populate('user', "name")
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    })

    if (!getOneOrder) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getOneOrder)
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

    const totalPrices = await Promise.all(orderItemsIdsResolved.map( async (orderItemId) => {
        console.log(orderItemId)
        const getOrderPrice = await OrderItem.findById(orderItemId).populate('product', 'price')
        const totalPrice = getOrderPrice.product.price * getOrderPrice.quantity
        return totalPrice
    }))

    console.log(totalPrices)

    function getSum(a, b) {
        return a + b
    }

    const totalOrderPrice = totalPrices.reduce(getSum, 0)
    // const totalOrderPrice = totalPrices.reduce((a, b) => a+b, 0)

    const newOrder = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalOrderPrice,
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

router.put(`/:id`, async (req, res) => {
    try {
        const orderItemsIds = Promise.all(req.body.orderItems.map( async (orderitem) => {
            const newOrderItem = new OrderItem({
                quantity: orderitem.quantity,
                product: orderitem.product
            })
    
            await newOrderItem.save()
    
            return newOrderItem.id
        }))
    
        const orderItemsIdsResolved = await orderItemsIds

        const updateOrder = await Order.findByIdAndUpdate(req.params.id,{
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
        }, {
            new: true
        })
    
        if (!updateOrder) {
            return res.status(500).json({
                message: 'Category not found'
            })
        }
    
        res.send(updateOrder)

    } catch(err) {
        return res.status(500).json({
            message: 'Invalid id category'
        })
    }
})

router.delete(`/:id`, (req, res) => {
    // Both findByIdAndRemove & findByIdAndDelete of them are almost similar except findOneAndRemove uses findAndModify with remove flag and time complexity will be a bit higher compare to findOneAndDelete because you are doing an update. Delete are always faster.
    Order.findByIdAndDelete(req.params.id).then( async (order) => {
        if(order) {
            // Delete from other table (orderItems that has relation with Order)
            await order.orderItems.map(async (orderitem) => {
                await OrderItem.findByIdAndDelete(orderitem)
            })
            return res.status(200).json({
                success:  true,
                message: 'The order is deleted'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'Order not found'
            })
        }
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

router.get('/get/totalsales', async (req, res) => {
    const getTotalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: {$sum: '$totalPrice'}} }
    ])

    if (!getTotalSales) {
        return res.status(400).json({message: 'Can not get the total sales'})
    }

    const poTotalSales = {totalsales: getTotalSales.pop().totalSales}

    res.send(poTotalSales)
})

router.get('/get/count', async (req, res) => {
    const getOrder = await Order.countDocuments()

    if (!getOrder) {
        return res.status(400).json({message: 'Can not get count'})
    }

    res.send({totalOrder: getOrder})
})

router.get(`/get/userorders/:userid`, async (req, res) => {
    const getUserOrderHistory= await Order.find({user: req.params.userid})
    .populate('user', "name")
    .populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({dateOrdered: -1})

    if (!getUserOrderHistory) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getUserOrderHistory)
})

module.exports = router