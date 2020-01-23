const express = require('express');
const router=express.Router();
const auth=require('../middleware/Auth');
const User=require('../models/User');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('config');
const { check, validationResult } = require('express-validator');


router.get('/', auth, async(req, res)=>{
    try{
        const user=await User.findById(req.user.id).select('-password');
        res.json(user);
    }catch(err){
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});



router.post(
    '/',
    [
      check('email', 'no valid email').isEmail(),
      check('password', 'Min 6 char req').exists()
    ],
    async (req, res) => {
      const errors=validationResult(req);
      if(!errors.isEmpty()){
          return res.status(400).json({errors: errors.array()});
      }
      const{name,email,password}=req.body;
  
      try{
          let user=await User.findOne({email});
          if (!user){
              return res.status(400).json({errors: [{msg:'Invalid Credentials'}]});
          }
          

          const isMatch = await bcrypt.compare(password, user.password)

          if(!isMatch){
            return res.status(400).json({errors: [{msg:'Invalid Credentials'}]}); 
          }

          const payload={
            user: {
              id: user.id
            }
          };
  
          jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: 360000},
            (err, token) => {
              if (err)
              console.error(err.message);
              res.json({token});
            }
          );
  
      }
      catch(err){
          console.error(err.message);
          res.status(500).send('server error');
      }
    }
  );

module.exports=router;