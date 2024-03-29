const User = require("../models/Profile.js")
const PaidUser = require("../models/PaidUser.js")
const Token = require("../models/VerificationToken.js")
const bcrypt=require("bcrypt");
const router = require('express').Router();
const email = require("../email.js")
const axios = require ("axios")
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

//Initial userdata storing
router.post("/register", async(req, res)=>{
  //Check if user exists first
  const userExists= await PaidUser.findOne({email:req.body.email})
  if(userExists){
    res.status(500).json("user already exists")
  }else{
    try{
    //Create a hashed password from the requrest
    const salt = await bcrypt.genSalt(10);
    const hashedPass= await bcrypt.hash(req.body.passWord, salt);

    //Create a new User.
    const NewUser = new User({
      accountType:req.body.accountType,
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      tempEmail:req.body.email,
      address:req.body.address,
      passWord:hashedPass,
      phone:req.body.phone,
      income:req.body.income,
      employer:req.body.employer,
      frontID:req.body.frontIdDocument,
      backID:req.body.backIdDocument,
      selfiePhoto:req.body.selfieDocument,
      incomeDoc:req.body.incomeDocument,
      relatives:req.body.relatives
    });
    //Generate a verification token and save it.
     const user = await NewUser.save()
     res.status(200).json({userId:user._id, email:req.body.email});

    
  }catch(err){
    res.send({code:500,message:err})
  }
  }
  
})

//final user storing
router.post("/paid", async(req, res)=>{
  try{
    const checkTempUser = await User.exists({_id:req.body.userId});
    if(!checkTempUser){
    res.send({user:"User doesn't exist"})
  }else{
       const tempUser=await User.findById(req.body.userId)
       const permUser= await PaidUser.exists({tempOwner:tempUser._id})
    if(!permUser){
          //get the customer id
          const session = await stripe.checkout.sessions.retrieve(req.body.sessionId)
      
          const permanentUser= new PaidUser({
          tempOwner:tempUser._id,
          stripeCustomerId:session.customer,
          accountType:tempUser.accountType,
          firstName:tempUser.firstName,
          lastName:tempUser.lastName,
          email:tempUser.tempEmail,
          address:tempUser.address,
          passWord:tempUser.passWord,
          phone:tempUser.phone,
          income:tempUser.income,
          employer:tempUser.employer,
          frontID:tempUser.frontID,
          backID:tempUser.backID,
          selfiePhoto:tempUser.selfiePhoto,
          incomeDoc:tempUser.incomeDoc,
          relatives:tempUser.relatives
        });
        const saveNewUser= await permanentUser.save()
      //get the invoice to retrieve subscription
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: saveNewUser.stripeCustomerId,
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
      const {passWord,stripeCustomerId, frontID, backID, selfiePhoto, incomeDoc, ...others} = saveNewUser._doc  
        const data = {...others,nextBill}
        
        res.status(200).json(data)
        email.sendEmail(saveNewUser.email)
        await tempUser.delete()

      
    }else{
      res.send({user:"user exists"})
    }
  }
   
  
  }catch(err){
    console.log(err)
    res.status(500).json(err)
  }

  
})
router.post("/login", async (req, res)=>{
  try{
    const user = await PaidUser.findOne({email:req.body.email})
    if(!user){
      res.status(400).json("Wrong email or password");
      throw new Error("wrong email")
    } 
    const validated = await bcrypt.compare( req.body.passWord, user.passWord);
    console.log(validated)
    
    if(!validated){
      res.status(400).json("Wrong email or password");
      throw new Error("wrong Password")
    } 
    
     const invoice = await stripe.invoices.retrieveUpcoming({
          customer: user.stripeCustomerId,
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
      
      console.log(nextBill)
//       
      const {passWord, stripeCustomerId, frontID, backID, selfiePhoto, incomeDoc, ...others} = user._doc  
        const data = {...others,nextBill}
        res.status(200).json(data)
  }catch(err){
    console.log(err)
  }
})
router.put("/verify/:id", async (req,res)=>{
console.log("hit")
  try{
  const checkToken = await Token.exists({_id:req.body.tokenId})
  const checkUser = await PaidUser.exists({_id:req.body.userId})
   
  if(checkToken){
    const getToken = await Token.findOne({_id:req.body.tokenId})
    const tokenUserId=getToken.owner.toString()
    console.log(tokenUserId)
    if(tokenUserId===req.body.userId){
      console.log("token and user match")
      const updateUser = await PaidUser.findByIdAndUpdate(req.params.id,{
          $set:{isVerified:true}
        },{new:true})
      //get the invoice to retrieve subscription
        const invoice = await stripe.invoices.retrieveUpcoming({
          customer: updateUser.stripeCustomerId,
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
      const {passWord,stripeCustomerId, frontID, backID, selfiePhoto, incomeDoc, ...others} = updateUser._doc  
        const data = {...others,nextBill}
        
        res.status(200).json(data)

            //request to delete the token
        await axios.delete(`https://api.sadikirungo.repl.co/api/auth/token/${getToken.id}`,{
          
        });
      
    }else{
      res.status(500).json("Token and user don't match")
      console.log("token and user don't match")
    }
  }else{
    res.status(500).json("Token doesn't exist or expired")
    console.log("token expired")
  }
  }catch(err){
    console.log(err)
  }
    
    
    
      
  //     if(getToken._id===req.body.tokenId){
  //       console.log("user and token match")
  //       const user = await PaidUser.findOne({_id:req.body.userId})
  //       if(user.isVerified){
  //         const updateUser = await PaidUser.findByIdAndUpdate(req.params.id,{
  //         $set:{isVerified:true}
  //       },{new:true})
  //       }else{
  //         const updateUser = await PaidUser.findByIdAndUpdate(req.params.id,{
  //         $set:{isVerified:false}
  //       },{new:true})
  //       }
        
  //       //getToken.delete()
  //       const {passWord, frontID, backID, selfiePhoto, incomeDoc, ...others} = updateUser._doc  
  //       console.log(updateUser)
  //       res.status(200).json(others)
        
  
        
  //     }else{
  //       res.status(400).json("Token and user don't match")
  //     }
  //   }else{
  //     res.status(400).json("User not found. Create account")
  //   }
  // }else{
  //   res.status(400).json("Token not found or expired.")
  // }
  // }catch(err){
  //   console.log(err)
  // }
  
})
router.delete("/token/:id", async (req,res)=>{
  await Token.findByIdAndDelete(req.params.id);
})
router.post("/verifyemail", async (req,res)=>{
  email.sendEmail(req.body.email)
})
module.exports= router;