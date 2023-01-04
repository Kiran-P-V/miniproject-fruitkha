const mongoose = require('mongoose')

const BannerSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  image: {
    type: Array
  },
  active:{
    type: Number,
    default:0
  }
})

module.exports = mongoose.model('Banner', BannerSchema)
