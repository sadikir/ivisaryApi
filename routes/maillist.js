const router = require("express").Router();
const Maillist = require("../models/mailList.js")



router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "https://ivisary.sadikirungo.repl.co"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
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