const express = require('express')
const { isValidObjectId, default: mongoose } = require('mongoose')
const router = express.Router()
const Category = require("../models/category")

router.get(`/`, async (req, res) => {
    const getAllItems = await Category.find({}, {"__v": false})

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.get(`/:id`, async (req, res) => {
    const getCategoryById = await Category.findById(req.params.id, {"__v": false})

    if (!getCategoryById) {
        return res.status(404).json({
            message: 'The category with the given number was not found'
        })
    }

    res.status(200).send(getCategoryById)
})

router.post(`/`, async (req, res) => {
    const addCategory = Category({
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon
    })

    await addCategory.save()
    // console.log(addCategory.id)
    // try {
    //     await Category.findOneAndUpdate({
    //         name: addCategory.name
    //     }, addCategory, {
    //         upsert: true
    //     })
    // } catch(err) {
    //     console.log(err)
    // }

    if(!addCategory) {
        return res.status(400).send('The category can not be created!')
    }

    res.send(addCategory)
})

router.put(`/:id`, async (req, res) => {
    const updateCategory = await Category.findByIdAndUpdate(req.params.id,{
        name: req.body.name,
        color: req.body.color,
        icon: req.body.icon
    }, {
        new: true
    })

    if (!updateCategory) {
        return res.status(500).json({
            message: 'The category can not be createrd'
        })
    }

    res.send(updateCategory)
})

// My version using async await
// router.delete(`/:id`, async (req, res) => {

//     try{
//         // const isFalidId = mongoose.isValidObjectId(req.params.id)
//         const isFalidId = isValidObjectId(req.params.id)

//         if (!isFalidId) {
//             return res.status(500).json({
//                 error: 'Invalid Id'
//             })
//         }

//         const checkExistId = await Category.findById(req.params.id)

//         if(!checkExistId) {
//             return res.status(404).json({
//                 error: 'Category not found'
//             })
//         }

//         const deleteCategory = await Category.findByIdAndDelete(req.params.id)

//         if (!deleteCategory) {
//             return res.status(400).json({
//                 error: 'Failed delete Category'
//             })
//         }
//     } catch(err) {
//         console.log(err)
//     }

//     res.status(200).json({
//         success: 'Successfully deleted Category!'
//     })
// })

// Someone version using promise
router.delete(`/:id`, (req, res) => {
    // Both findByIdAndRemove & findByIdAndDelete of them are almost similar except findOneAndRemove uses findAndModify with remove flag and time complexity will be a bit higher compare to findOneAndDelete because you are doing an update. Delete are always faster.
    Category.findByIdAndDelete(req.params.id).then((category) => {
        if(category) {
            return res.status(200).json({
                success:  true,
                message: 'The category is deleted'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'Category not found'
            })
        }
    }).catch((err) => {
        return res.status(400).json({
            success: false,
            error: err
        })
    })
})

module.exports = router