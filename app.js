const express = require('express')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
require('dotenv/config')

const app = express()
const api = process.env.API_URL

const productRouter = require('./routes/products')

//Middleware
app.use(express.json())
app.use(morgan('combined'))

//Router
app.use(`${api}/products`, productRouter)


mongoose.connect(process.env.MONGO_DB_URL)
.then(() => {
    console.log('MongoDB connection ready!')
})
.catch((err) => {
    console.log(err)
})


app.listen(5000, () => {
    console.log(`Server is running on port 5000`)
})