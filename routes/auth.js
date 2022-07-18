const User = require("../models/Profile.js")

const bcrypt=require("bcrypt");
const router = require('express').Router();

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


router.post("/register", async(req, res)=>{
  try{
    const salt = await bcrypt.genSalt(10);
    const hashedPass= await bcrypt.hash(req.body.passWord, salt);
    const NewUser = new User({
      accountType:req.body.accountType,
      firstName:req.body.firstName,
      lastName:req.body.lastName,
      email:req.body.email,
      passWord:hashedPass,
      phone:req.body.phone,
      income:req.body.income,
      employer:req.body.employer,
      
      relatives:req.body.relatives
      
    });
    const user = await NewUser.save()
    const {passWord, fontID, backID, sefliePhoto, incomeDoc, ...others} = user._doc
    res.status(200).json(others);
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