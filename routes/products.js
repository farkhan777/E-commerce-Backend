const express = require('express')
const router = express.Router()
const {Product} = require('../models/product')

router.get(`/`, async (req, res) => {
    const getAllItems = await Product.find()

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.post(`/`, async (req, res) => {
    const newItem = await new Product({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.countInStock
    })

    const productExist = await Product.findOne({
        name: newItem.name
    })

    if (productExist) {
        return res.status(409).json({
            error: 'Item already exist!'
        })
    }

    newItem.save().then((createProduct) => {
        res.status(201).json(createProduct)
    }).catch((err) => {
        res.status(500).json({
            error: err,
            success: false
        })
    })
})

module.exports = router