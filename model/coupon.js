const mongoose = require('mongoose')
const CouponSchema = mongoose.Schema({
  code: {
    type: String,
    trim: true,
    required: true
  },
  value: {
    type: Number,
    trim: true
  },
  minbill: {
    type: Number, 
    trim: true
  } ,
  status: {
    type: String,
    default: 1
  },
  name: {
    type: String,

    trim: true

  },
  coustomer: {
    type: Array,
  }
})

module.exports = mongoose.model('coupons', CouponSchema)
