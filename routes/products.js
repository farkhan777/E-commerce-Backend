const express = require('express')
const { count } = require('../models/category')
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
                message: 'Category not found'
            })
        }
    
        res.send(updateProduct)
    } catch(err) {
        return res.status(500).json({
            message: 'Invalid id category'
        })
    }
})

router.delete(`/:id`, (req, res) => {
    // Both findByIdAndRemove & findByIdAndDelete of them are almost similar except findOneAndRemove uses findAndModify with remove flag and time complexity will be a bit higher compare to findOneAndDelete because you are doing an update. Delete are always faster.
    Product.findByIdAndDelete(req.params.id).then((product) => {
        if(product) {
            return res.status(200).json({
                success:  true,
                message: 'The product is deleted'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'Product not found'
            })
        }
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

router.get('/get/count', async (req, res) => {
    const countProduct = await Product.countDocuments()

    if(!countProduct) {
        return res.status(500).json({message: 'Can not count product'})
    }

    res.send({
        totalProduct: countProduct
    })
})

module.exports = router