const express = require('express')
const router = express.Router()
const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    const getAllItems = await User.find().select("-passwordHash -__v")

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.get(`/:id`, async (req, res) => {
    const getAllItems = await User.findById(req.params.id).select("-passwordHash -__v")

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

router.post(`/`, async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcryptjs.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })

    try {
        await newUser.save()
    
        if (!newUser) {
            return res.status(500).json({message: 'The user can not be saved'})
        }
    } catch (err) {
        console.log(err)
    }
    
    res.send(newUser)
})

router.post(`/register`, async (req, res) => {
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcryptjs.hashSync(req.body.passwordHash, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country
    })

    try {
        await newUser.save()
    
        if (!newUser) {
            return res.status(500).json({message: 'The user can not be saved'})
        }
    } catch (err) {
        console.log(err)
    }
    
    res.send(newUser)
})

router.post(`/login`, async (req, res) => {
    const user = await User.findOne({email: req.body.email})
    const secret = process.env.SECRET

    if (!user) {
        return res.status(400).json({message: 'User not found'})
    }

    if (user.email && bcryptjs.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            {
                expiresIn: '1d'
            }
        )
        res.status(200).json({user: user.email, token: token})
    } else {
        res.status(400).json({message: 'Wrong password'})
    }
})

router.delete(`/:id`, (req, res) => {
    // Both findByIdAndRemove & findByIdAndDelete of them are almost similar except findOneAndRemove uses findAndModify with remove flag and time complexity will be a bit higher compare to findOneAndDelete because you are doing an update. Delete are always faster.
    User.findByIdAndDelete(req.params.id).then((user) => {
        if(user) {
            return res.status(200).json({
                success:  true,
                message: 'The user is deleted'
            })
        } else {
            return res.status(400).json({
                success: false,
                message: 'User not found'
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
    const countUser = await User.countDocuments()

    if(!countUser) {
        return res.status(500).json({message: 'Can not count product'})
    }

    res.send({
        totalUser: countUser
    })
})

module.exports = router