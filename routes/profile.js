const router = require("express").Router();
const PaidUser = require("../models/PaidUser.js")
const bcrypt=require("bcrypt");
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

router.put("/:id", async (req, res)=>{
  let verify=""
  if(req.params.id===req.body.userId){
    try{
      const user =await PaidUser.findById(req.params.id);

      if(!user){
        res.status(400).json("Wrong id!");
        throw new Error("Wrong user Id")
      }
      
      const validPass= await bcrypt.compare(req.body.oldPass,user.passWord)
        
      
      if(!validPass){
        res.status(400).json("Wrong password!");
        throw new Error("wrong password")
      }
      if(user.email===req.body.email && user.isVerified===true){
        verify=true;
        
      }else{
        verify=false
        
      }
      console.log(verify)
      const salt = await bcrypt.genSalt(10);
      req.body.newPass = await bcrypt.hash(req.body.newPass, salt)
      const updatedUser = await PaidUser.findByIdAndUpdate(req.params.id,{
          $set: {firstName:req.body.firstName,
                 lastName:req.body.lastName,
                 phone:req.body.phone,
                 address:req.body.address,
                 isVerified:verify,
                 email:req.body.email,
                 passWord:req.body.newPass}
    },{new:true})
            //get the invoice to retrieve subscription
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: updatedUser.stripeCustomerId,
        });
      //get subscription data
        const subscription = await stripe.subscriptions.retrieve(
  invoice.subscription
);    
      //convert the subscription into readable date
        let datetime = subscription.current_period_end *1000; 
        let date = new Date(datetime);
        let options = {
           year: 'numeric', month: 'numeric', day: 'numeric',
        };
        let nextBill = date.toLocaleDateString('en', options);
      
      
//       
      const {passWord,stripeCustomerId, frontID, backID, selfiePhoto, incomeDoc, ...others} = updatedUser._doc  
        const data = {...others,nextBill}
        
        res.status(200).json(data)
      
    }catch(err){
      console.log(err)
    }
  }else{
    res.status(401).json("You can only update your account")
    console.log("invalid id")
  }
})
module.exports = router;