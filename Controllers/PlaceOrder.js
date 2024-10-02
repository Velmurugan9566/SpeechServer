
const OrderModel = require('../models/Order');  // Your Order schema
const OrderItemModel = require('../models/OrderItem');  // Your OrderItem schema
const CartModel = require('../models/Cart');
const ProductModel = require('../models/Users');
const SendMailQuantity = require('../Controllers/SendMailQuantity');
const PlaceOrder= async (req, res) => {
  const { user, cart, paymentMethod, orderMethod, grandTotal } = req.body;
  //console.log(user,cart,paymentMethod,orderMethod,grandTotal)
  try {
    // 1. Create a new order
    const newOrder = new OrderModel({
      userId:user,
      paymentMode:paymentMethod,
      paymentStatus: 'Completed',  // Default status could be pending initially
      totalAmount: grandTotal,
      orderMode:orderMethod
    });

    // Save the order to get the order ID
    const savedOrder = await newOrder.save();

    // 2. Insert each cart item into the OrderItem collection
    const orderItemsPromises = cart.map(item => {
      const orderItem = new OrderItemModel({
        orderId: savedOrder._id,
        proname: item.proname,
        price: item.price,
        quantity: item.quantity,
        total: item.totalPrice
      });
      return orderItem.save();  // Save each order item
    });

    // Wait for all order items to be inserted
    await Promise.all(orderItemsPromises);
  
    // 3. Send success response
    console.log("inserted..")
    SendMailQuantity.sendLowQuantityEmail()
    // CartModel.deleteMany({email:user})
    // .then(res)
    // .catch(err=> console.log("error deletecart",err))
    // cart.map(item=>{
    //   ProductModel.updateOne({proname:item.proname},{$inc:{quantity:-item.quantity}})
    //   .then(res)
    //   .catch(err=>console.log("subtract product",err))
    // })
    
    res.status(200).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Error placing order', error);
    res.status(500).json({ message: 'Error placing order' });
  }
};

module.exports ={
    PlaceOrder,
};
