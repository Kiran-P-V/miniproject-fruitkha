const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 1
  }
})

module.exports = mongoose.model('Category', CategorySchema)
