const User = require("../models/Profile.js")
const Token = require("../models/VerificationToken.js")
const bcrypt=require("bcrypt");
const router = require('express').Router();
const email = require("../email.js")


router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


router.post("/register", async(req, res)=>{
  try{
    //Create a hashed password from the requrest
    const salt1 = await bcrypt.genSalt(10);
    const hashedPass= await bcrypt.hash(req.body.passWord, salt1);

    //Create a new User.
    const NewUser = new User({
      accountType:req.body.accountType,
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
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
     let OTP ="";
    const generateToken=()=>{
     
      for(let i=0;i<=3; i++){
        const randVal= Math.round(Math.random() * 9);
        OTP=OTP+randVal
      }
      return OTP;
    }
    //hash the new genrated token
    const salt2 = await bcrypt.genSalt(10);
    const genToken=generateToken();
    const hashedToken= await bcrypt.hash(genToken, salt2);
    
    //create and save a new token
    const newToken = new Token({
      owner:NewUser,
      tokenCode:hashedToken
    })
    //send the token to the user
    email.sendEmail(genToken, NewUser.email)
    
    //save both the user and the token
    const saveToken = await newToken.save();
    const user = await NewUser.save()
    // const {passWord, fontID, backID, sefliePhoto, incomeDoc, ...others} = user._doc
     res.status(200).json("user created and token saved");

    
    //sending token email.
    
  }catch(err){
    
    res.status(500).json(err)
  }
})
router.post("/login", async (req, res)=>{
  try{
    const user = await User.findOne({email:req.body.email})
    !user && res.status(400).json("Wrong credential");
    const validated = bcrypt.compare(user.email, req.body.email);
    !validated && res.status(400).json("Wrong credential");
    const { passWord, employer, frontID, backID, selfiePhoto, incomeDoc, income, ...others} = user._doc
    res.status(200).json(others)
  }catch(err){
    res.status(500).json(err)
    console.log(err)
  }
})
module.exports= router;