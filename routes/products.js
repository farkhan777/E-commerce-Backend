const express = require('express')
const Category = require('../models/category')
const router = express.Router()
const Product = require('../models/product')
const fs = require('fs')
const  multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

// image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadError = new Error('Invalid image type')

        if (isValid) {
            uploadError = null
        }
        cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extention = FILE_TYPE_MAP[file.mimetype]
        // const fileName = file.originalname.replace(' ', '-')
        const fileName = file.originalname.split(' ').join('-')
        cb(null, `${fileName}-${Date.now()}.${extention}`)
    }
})
const uploadOptions = multer({ storage: storage })

router.get(`/`, async (req, res) => {

    // Paginate
    const DEFAULT_PAGE_NUMBER = 1
    const DEFAULT_PAGE_LIMIT = 0

    const page = Math.abs(req.query.page) || DEFAULT_PAGE_NUMBER
    const limit = Math.abs(req.query.limit) || DEFAULT_PAGE_LIMIT
    const skip = (page - 1) * limit

    let filter = {}

    if (req.query.categories) {
        filter = {category: req.query.categories.split(',')};
    }

    // You can use black list of item/product by using {}, {}
    // const getAllProduct = await Product.find({}, {
    //     "__v": false
    // })

    // You can use white list of item/product by using select() method
    // const getAllProduct = await Product.find().select('name image -_id')
    // const getAllProduct = await Product.find().select('name image')
    const getAllProduct = await Product.find(filter, {
        "__v": false
    })
    .sort({ dateCreated: 1 })
    .skip(skip)
    .limit(limit)
    .populate('category')

    if (!getAllProduct) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllProduct)
})

router.get(`/:id`, async (req, res) => {
    try {
        const getOneProduct = await Product.findById(req.params.id, {"__v": false}).populate('category')
        
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

router.post(`/`, uploadOptions.single('image') , async (req, res) => {
    try {
        const checkExistCategory = await Category.findById(req.body.category)
        if (!checkExistCategory) return res.status(404).json({message: 'Category not found'})
    } catch(err) {
        return res.status(500).json({
            message: 'Invalid id category'
        })
    }

    const checkIfTheIsFile = req.file
    if (!checkIfTheIsFile) {
        return res.status(404).json({message: 'Image does not exist'})
    }

    // image upload
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    

    const newProduct = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`, // "http://localhost:5000/public/uploads/image-12345"
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
        await newProduct.save('')
    
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

router.put(`/:id`, uploadOptions.single('image'), async (req, res) => {
    try {
        const checkExistCategory = await Category.findById(req.body.category)
        if (!checkExistCategory) return res.status(404).json({message: 'Category not found'})

        const checkExistProduck = await Product.findById(req.params.id)
        if(!checkExistProduck) return res.status(400).json({message: 'Invalid product'})

        let imagepath

        if (req.file) {
            const filePath = './public/uploads'
            const splittedFile = checkExistProduck.image.split('/')
            // console.log(`${filePath}/${splittedFile[splittedFile.length - 1]}`)
            fs.unlink(`${filePath}/${splittedFile[splittedFile.length - 1]}`, function(err) {
                if(err && err.code == 'ENOENT') {
                    // file doens't exist
                    console.info("File doesn't exist, won't remove it.");
                } else if (err) {
                    // other errors, e.g. maybe we don't have enough permission
                    console.error("Error occurred while trying to remove file");
                } else {
                    console.info(`removed`);
                }
            })
            const fileName = req.file.filename
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
            imagepath = `${basePath}${fileName}`
        } else {
            imagepath = checkExistProduck.image
        }

        const updateProduct = await Product.findByIdAndUpdate(req.params.id,{
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagepath,
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
            message: err
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

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count: 0
    const featuredProduct = await Product.find({isFeatured: true}, {"__v": false}).sort({ dateCreated: 1 }).limit(Math.abs(count))

    if(!featuredProduct) {
        return res.status(500).json({message: 'Can not count product'})
    }

    res.send(featuredProduct)
})

module.exports = router