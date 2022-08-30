const express = require('express')
const { default: mongoose } = require('mongoose')
const morgan = require('morgan')
const cors = require('cors')
const cluster = require('cluster')
const os = require('os')
require('dotenv/config')

const app = express()
const api = process.env.API_URL

app.use(cors())
app.options('*', cors())

//Middleware
app.use(express.json())
app.use(morgan('combined'))

const categoriesRoutes = require('./routes/categories')
const ordersRoutes = require('./routes/orders')
const productsRoutes = require('./routes/products')
const usersRoutes = require('./routes/users')

//Router
app.use(`${api}/categories`, categoriesRoutes)
app.use(`${api}/orders`, ordersRoutes)
app.use(`${api}/products`, productsRoutes)
app.use(`${api}/users`, usersRoutes)

if(cluster.isMaster) {
    console.log('Master has been started')
    const NUM_WORKERS = os.cpus().length;
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else {
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
}

