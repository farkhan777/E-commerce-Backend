const { default: mongoose } = require("mongoose");

const orderSchema = mongoose.Schema({

})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderSchema.set('toJSON', {
    virtuals: true
})

module.exports = mongoose.model('Order', orderSchema)