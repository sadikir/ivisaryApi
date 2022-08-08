const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


router.use((req, res, next) => {
  const allowedOrigins = ['https://ivisary.sadikirungo.repl.co', 'https://ivisary.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
       res.setHeader('Access-Control-Allow-Origin', origin);
  }
  //res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:8020');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  return next();
});
router.post("/payment_session", async (req, res)=>{
  const userId=req.body.registeredUser
  
  const origin = req.get('origin')
  console.log(origin)
 
  let url="";
  if(origin==="https://ivisary.com"){
    url = "https://ivisary.com"
  }else if(origin === "https://ivisary.sadikirungo.repl.co"){
    url = "https://ivisary.sadikirungo.repl.co"
  }
  console.log(url)
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
      success_url: `${url}/registeruser/${userId}`,
      cancel_url: `${url}/about/#pricing`,
    })
    
    res.json({url:session.url, sessionId:session.id})
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
  
})
module.exports = router;