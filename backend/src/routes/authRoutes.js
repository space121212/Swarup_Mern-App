const express=require('express');
const validate = require('../middleware/validate');
const authenticate=require('../middleware/isAuth.js')
const { registerSchema,loginSchema } = require('../validators/zod');
const { registerController,refreshController,loginController,logoutController } = require('../controller/authController');


const router=express.Router();


router.post('/register',validate(registerSchema),registerController)
router.post('/login',validate(loginSchema),loginController)
router.post('/refresh',refreshController)

router.post('/logout',logoutController)

router.get('/me',authenticate,(req,res)=>{
    res.status(200).json({
        message:"Done",
        user:req.user
    })
})


module.exports=router