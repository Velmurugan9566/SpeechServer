const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const Product = require('./models/Users');
const Adminlog= require('./models/Admin');
const Catelist = require('./models/Category');
const Supplier = require('./models/Supplier')
const { updateProductById } = require('./Controllers/ProductUpdate');
const { renameCategory } = require('./Controllers/CategoryUpdate');
const {BulkInsert} = require('./Controllers/BulkInsert')
app.use(cors());
app.use(express.json());
mongoose.connect("mongodb://localhost:27017/grocery",{  
//mongoose.connect('mongodb+srv://velmca24:vel9566@cluster0.i4qp0rb.mongodb.net/grocery?retryWrites=true&w=majority&appName=Cluster0', {
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Error connecting to MongoDB', err);
});


app.get('/categories', async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.get('/subcategories/:category', async (req, res) => {
  try {
    const category = req.params.category;
    // Fetch distinct subcategories for the given category
    const subcategories = await Product.distinct('Subcategory', { category: category });
    if (subcategories.length === 0) {
      return res.status(404).json({});
    }
    res.status(200).json(subcategories);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server error while fetching subcategories.' });
  }
});
app.post('/Addcate',(req, res) => {
  const {cate,id} =req.body;
  console.log(cate);
  Catelist.findOne({catename:cate})
  .then(re =>{
      if (re){
          res.json({status:2})
      }
      else{
          Catelist.create({catename:cate,cateid:id})
          .then(user => res.json({status:1}))
          .catch(err => res.json(err))
      }
  })
  .catch(err => res.json(err))
      
});
app.post('/Addsupp',(req, res) => {
  const {suppname,suppid} =req.body;
  console.log(suppname);
  Supplier.findOne({suppid:suppid})
  .then(re =>{
      if (re){
          res.json({status:2})
      }
      else{
          Supplier.create(req.body)
          .then(user => res.json({status:1}))
          .catch(err => res.json(err))
      }
  })
  .catch(err => res.json(err))
      
});

app.get('/getProduct/:id',(req, res) => {
    const { id } = req.params;
    console.log(id)
    Product.findById(id)
    .then(re=>res.json(re))
    .catch(err=>res.json(err))
});

app.get('/getCate',(req,res)=>{
   Catelist.find()
   .then(re=>res.json(re))
   .catch(er=>res.json(er))
  
})
app.get('/getSupp',(req,res)=>{
   Supplier.find()
   .then(re=>res.json(re))
   .catch(er=>res.json(er))
})
app.get('/getSubcategories',(req, res) => {

    Product.distinct('Subcategory')
    .then(re=>res.json(re))
    .catch(err=>res.json(err))
});
app.get('/categorieswithcount', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: '$category', 
          productCount: { $sum: 1 }, // Count the number of products in each category
        }
      },
      {
        $project: {
          category: '$_id',
          productCount: 1,
          _id: 0 // Exclude the _id field from the output
        }
      }
    ]);
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/updateProduct/:id', updateProductById); //update product
app.put('/renamecategory', renameCategory);   //Update category name...

app.delete('/deleteProducts', (req, res) => {
  const { ids } = req.body; 
  Product.deleteMany({ _id: { $in: ids } })
    .then(() => res.json({ message: 'Products deleted successfully' }))
    .catch(err => res.status(500).json({ error: 'Error deleting products' }));
});
app.delete('/deleteCategory', (req, res) => {
  const { category } = req.body;
  //console.log(req.body);
  Catelist.deleteOne(req.body) // Corrected to deleteOne
  .then(() => {
    // Then, delete all products with the same category name in the Product model
    return Product.deleteMany(req.body);
  })
    .then(() => res.json({ msg: "Category and Associated  Products Deleted Successfully.." }))
    .catch(err => res.status(500).json(err)); // Added proper error handling
});

app.get('/products/:Subcategory', async (req, res) => {
    const { Subcategory } = req.params;
    try {
        const products = await Product.find({ Subcategory });
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get("/products", async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/product/:name", async (req, res) => {
    try {
      
      const product = await Product.findOne({ _id: req.params.name });
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app.get("/Alogin", (req, res) => {
    const { u, pass } = req.query;
    Adminlog.findOne({Aid: u })
      .then(admin => {
        if (admin) {
          if (admin.Apass !== pass) {
            res.json({ status: 3 });
          } else {
            res.json({ status: 1 });
          }
        } else {
          res.json({ status: 2 });
        }
      })
      .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
      });
  });
  app.post("/AddPro",(req,res)=>{
    //console.log(req.body.formData);
      const v=req.body.formData;
      Product.findOne({proname:v.productName})
      .then((data)=>{
        if(data){
            res.json({status:2})
        }else{
          Product.create({proname:v.productName,quantity:Number(v.productQuantity),price:Number(v.productPrice),category:v.category,Subcategory:v.Subcategory,discount:v.discount,Supp_id:v.supp_id})
          .then(msg => res.json({status:1}))
          .catch(err => res.json({status:3,msg:err}))
        }
      })
      .catch(err => res.json({status:3,msg:err}))
  })
  app.post("/AddBulkPro",BulkInsert)
app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
