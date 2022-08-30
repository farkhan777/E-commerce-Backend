const express = require('express')
const Category = require('../models/category')
const router = express.Router()
const Product = require('../models/product')

router.get(`/`, async (req, res) => {
    // You can use black list of item/product by using {}, {}
    // const getAllProduct = await Product.find({}, {
    //     "__v": false
    // })

    // You can use white list of item/product by using select() method
    // const getAllProduct = await Product.find().select('name image -_id')
    // const getAllProduct = await Product.find().select('name image')
    const getAllProduct = await Product.find().populate('category')

    if (!getAllProduct) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllProduct)
})

router.get(`/:id`, async (req, res) => {
    try {
        const getOneProduct = await Product.findById(req.params.id).populate('category')
        
        if(!getOneProduct) {
            return res.status(404).json({message: 'Product not found'})
        }

        res.send(getOneProduct)
    } catch (err) {
        return res.status(500).json({
            message: 'Invalid id product'
        })
    }

})

router.post(`/`, async (req, res) => {
    try {
        const checkExistCategory = await Category.findById(req.body.category)
        if (!checkExistCategory) return res.status(404).json({message: 'Category not found'})
    } catch(err) {
        return res.status(500).json({
            message: 'Invalid id category'
        })
    }
    

    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    })

        // const productExist = await Product.findOne({
        //     name: newProduct.name
        // })
    
        // if (productExist) {
        //     return res.status(409).json({
        //         error: 'Item already exist!'
        //     })
        // }

    try {    
        await newProduct.save()
    
        if (!newProduct) {
            return res.status(500).json({message: 'The product can not be saved'})
        }
    } catch (err) {
        console.log(err)
    }
    
    res.send(newProduct)

    // newItem.save().then((createProduct) => {
    //     res.status(201).json(createProduct)
    // }).catch((err) => {
    //     res.status(500).json({
    //         error: err,
    //         success: false
    //     })
    // })
})

router.put(`/:id`, async (req, res) => {
    try {
        const checkExistCategory = await Category.findById(req.body.category)
        if (!checkExistCategory) return res.status(404).json({message: 'Category not found'})
    } catch(err) {
        return res.status(500).json({
            message: 'Invalid id category'
        })
    }

    const updateProduct = await Product.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured
    }, {
        new: true
    })

    if (!updateProduct) {
        return res.status(500).json({
            message: 'The product can not be createrd'
        })
    }

    res.send(updateProduct)
})

module.exports = router