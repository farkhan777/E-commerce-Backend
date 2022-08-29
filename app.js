const express = require('express')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
require('dotenv/config')

const app = express()
const api = process.env.API_URL

app.use(cors())
app.options('*', cors())

//Middleware
app.use(express.json())
app.use(morgan('combined'))

const categoriesRoutes = require('./routes/category')
const ordersRoutes = require('./routes/order')
const productsRoutes = require('./routes/products')
const usersRoutes = require('./routes/user')

//Router
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)


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