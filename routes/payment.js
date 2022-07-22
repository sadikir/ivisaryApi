const router = require("express").Router();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
router.post("/payment_session", async (req, res)=>{
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      metadata:{
          "order_id": req.body.registeredUser
        },
      line_items:[{
        "quantity": req.body.units,
        //the fast sponsorship
        price:req.body.productId==="prod_M5xfYmoZeiVTIE"?req.body.priceId
          //Basic sponsorship
             :req.body.productId==="prod_M5xdf3OGHRLnAe"?req.body.priceId
             :null,
      },
     ],
      success_url: `https://ivisary.sadikirungo.repl.co/login`,
      cancel_url: `https://ivisary.sadikirungo.repl.co/about/#pricing`,
    })
    // const invoice = await stripe.invoices.search({
    //   query: `metadata[\"order_id\"]:\"+${req.body.registeredUser}\"`,
    // });
    
    res.json({url:session.url})
  } catch (err) {
    res.status(500).json(err)
  }
  
})
module.exports = router;