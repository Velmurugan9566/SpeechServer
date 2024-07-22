const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const app = express()
const Product = require('./models/Users')
app.use(cors(
    // {
    //     orgin:[''],
    //     method:['POST','GET'],
    //     credentials:true
    // }
))
app.use(express.json())
mongoose.connect('mongodb://127.0.0.1:27017/grocery');

app.get('/categories',(req,res)=>{
    Product.find({category:1})
.then(result => {
    console.log(result)
    res.json(result)})
.catch(err=>{
    console.log(err)
    res.json(err)})
})

app.get('/products/:category',(req,res)=>{
    const {category} = req.params;
    Product.find({},{category:category})
    .then(result =>res.json(result))
    .catch(err => res.json(err))

})


app.listen(3001, () =>
{
    console.log('server is running...')
})