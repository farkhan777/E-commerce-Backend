const express = require('express')
const router = express.Router()
const { Category } = require("../models/category")

router.get(`/`, async (req, res) => {
    const getAllItems = await Category.find()

    if (!getAllItems) {
        res.status(500).json({
            success: false
        })
    }

    res.send(getAllItems)
})

module.exports = router