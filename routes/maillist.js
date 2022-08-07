const router = require("express").Router();
const Maillist = require("../models/mailList.js")



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

router.post("/subscribe", async (req, res)=>{
  try{
    const emailExist= await Maillist.exists({email:req.body.email})
    console.log(emailExist)
    if(emailExist){
      res.send({status:500, message:"email exists"})
      throw new Error("email exists")
    }else{
      const subscribe= await new Maillist({
        email:req.body.email
      })
      await subscribe.save()
      res.status(200).json("subscribed")
    }
  }catch(e){
    console.log(e)
  }
})
module.exports = router;