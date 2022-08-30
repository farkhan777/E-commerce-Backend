const express = require('express')
const router = express.Router()
const { User } = require('../models/user')

router.get(`/`, async (req, res) => {
    const getAllItems = await User.find()

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

module.exports = router