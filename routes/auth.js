const User = require("../models/Profile.js")
const PaidUser = require("../models/PaidUser.js")
const Token = require("../models/VerificationToken.js")
const bcrypt=require("bcrypt");
const router = require('express').Router();
const email = require("../email.js")
const axios = require ("axios")
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY)

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
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
     res.status(200).json(user._id);

    
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

           const invoice = await stripe.invoices.search({
              query: `metadata[\"order_id\"]:\"${req.body.userId}\"`,
             
         });
          console.log(invoice)
          const permanentUser= new PaidUser({
          tempOwner:tempUser._id,
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
      const {passWord, frontID, backID, selfiePhoto, incomeDoc, ...others} = saveNewUser._doc  
        res.status(200).json(others)
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
    !user && res.status(400).json("Wrong credential");
    const validated = bcrypt.compare(user.passWord, req.body.passWord);
    !validated && res.status(400).json("Wrong credential");
    const { passWord, employer, frontID, backID, selfiePhoto, incomeDoc, income, ...others} = user._doc
    res.status(200).json(others)
  }catch(err){
    res.status(500).json(err)
    console.log(err)
  }
})
router.put("/verify/:id", async (req,res)=>{

  const checkToken = await Token.exists({_id:req.body.tokenId})
  const checkUser = await PaidUser.exists({_id:req.body.userId})
  if(checkToken){
    
    
    if(checkUser){
      const getToken = await Token.findOne({owner:req.body.userId});
      if(getToken.id===req.body.tokenId){
        console.log("user and token match")
        const updateUser = await PaidUser.findByIdAndUpdate(req.params.id,{
          $set:{isVerified:true}
        },{new:true})
        //getToken.delete()
        const {passWord, frontID, backID, selfiePhoto, incomeDoc, ...others} = updateUser._doc  
        console.log(updateUser)
        res.status(200).json(others)
        //request to delete the token
        await axios.delete(`https://api.sadikirungo.repl.co/api/auth/token/${getToken.id}`,{
          owner:req.body.userId
        });
        
      }else{
        res.status(400).json("Token and user don't match")
      }
    }else{
      res.status(400).json("User not found. Create account")
    }
  }else{
    res.status(400).json("Token not found or expired.")
  }
  
})
router.delete("/token/:id", async (req,res)=>{
  await Token.findByIdAndDelete(req.params.id);
})
router.post("/verifyemail", async (req,res)=>{
  email.sendEmail(req.body.email)
})
module.exports= router;