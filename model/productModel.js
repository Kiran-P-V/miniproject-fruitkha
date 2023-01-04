const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  product: {
    type: String,
    trim: true,
    required: true
  },
  productprize: {
    type: Number,
    trim: true,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    trim: true
  },  
  category: {
    type: String,
    required: true
  },
  image: {
    type: Array
  },
  descreption:{
    type:String
  },
  bestseller: {
    type:Number,
    default: 0
  }
})

module.exports = mongoose.model('Product', productSchema)
