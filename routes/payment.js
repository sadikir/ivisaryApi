const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
router.post("/payment_session", async (req, res)=>{
  const userId=req.body.registeredUser
  
  try {
//     const createCustomer = await stripe.customers.create({
//       email: req.body.userEmail,
//       payment_method: 'pm_card_visa',
//       invoice_settings: {default_payment_method: 'pm_card_visa'},
// });
    const session = await stripe.checkout.sessions.create({
      // customer:createCustomer,
      payment_method_types: ["card"],
      mode: "subscription",
      // subscription_data:{
      //    metadata:{
      //     "order_id":userId
      //   }
      // },
      line_items:[{
        "quantity": req.body.units,
        //the fast sponsorship
        price:req.body.productId==="prod_M5xfYmoZeiVTIE"?req.body.priceId
          //Basic sponsorship
             :req.body.productId==="prod_M5xdf3OGHRLnAe"?req.body.priceId
             :null,
      },
     ],
      success_url: `https://ivisary.sadikirungo.repl.co/registeruser/${userId}`,
      cancel_url: `https://ivisary.sadikirungo.repl.co/about/#pricing`,
    })
    
    res.json({url:session.url, sessionId:session.id})
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
  
})
module.exports = router;