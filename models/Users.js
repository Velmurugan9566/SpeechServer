const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
  proname: String,
  quantity: Number,
  category: String,
  description: String,
  image: String,
  price: Number,
  image:String
})

const ProductModel = mongoose.model("product",ProductSchema)
module.exports = ProductModel