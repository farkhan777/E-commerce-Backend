const express = require('express')
const router = express.Router()
const Order = require('../models/order')

router.get(`/`, async (req, res) => {
    const getAllItems = await Order.find()

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

module.exports = router