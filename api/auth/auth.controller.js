const config = require('../../config/config');
const {User} = require('../../models');
const jwt = require('jsonwebtoken');
const request = require('request');
const createError = require('http-errors');

const authorize = (req,res)=>{
  try{
    const option = {
      uri: "https://testapi.openbanking.or.kr/oauth/2.0/authorize",
      header:'',
      qs:{
        response_type:"code",
        client_id: config.client_id,
        redirect_uri: "http://192.168.43.226:1212/authorize/callback",
        scope: "login inquiry transfer",
        state: "12345678901234567890122345689012"
      }
    };
  
    request.get(option,(err,response,body)=>{
      res.json({url:response.request.url.href});
    });
  }catch(e){
    res.status(400).json(e).end();
  }
}

const authorize_callback = async (req,res)=>{
  try{
    const option = {
      uri: "https://testapi.openbanking.or.kr/oauth/2.0/token",
      header:'',
      form:{
        code:req.query.code,
        client_id: config.client_id,
        client_secret:config.client_secret,
        redirect_uri: "http://192.168.43.226:1212/authorize/callback",
        grant_type: 'authorization_code'  
      }
    };
  
    request.post(option,async (err,response,body)=>{
      const accessTokenRequestResult = JSON.parse(body);
      console.log(body);
      console.log(accessTokenRequestResult);
      const user = User.findOne({where:{user_seq_no:accessTokenRequestResult.user_seq_no}});
      if(!user.dataValues){
        User.create({
          user_seq_no:accessTokenRequestResult.user_seq_no,
          access_token:accessTokenRequestResult.access_token,
          refresh_token:accessTokenRequestResult.refresh_token
        }).catch(e=>{
          throw new Error(e.message);
        })
      }else{
        User.update({
          access_token:accessTokenRequestResult.access_token,
          refresh_token:accessTokenRequestResult.refresh_token
        },{
          where:{user_seq_no:accessTokenRequestResult.user_seq_no}
        });
      }
      const secret = req.app.get('jwt-secret');
      const token = await jwt.sign({user_seq_no:accessTokenRequestResult.user_seq_no}, secret, {
        expiresIn: '100h',
        issuer: 'gkrud',
        subject: 'user_info'
      });
  
      res.json({
        access_token:token,
        refresh_token:accessTokenRequestResult.refresh_token
      });
    });
  }catch(e){
    res.status(400).json(e.message).end();
  }
}

const logout = async (req,res)=>{
  try{
    const user_seq_no = req.decoded.user_seq_no;
    const user = await User.findOne({
      where:{user_seq_no:user_seq_no}
    });
  
    const option = {
      uri: "https://testapi.openbanking.or.kr/v2.0/user/unlink",
      headers:{
        Authorization: `Bearer ${user.dataValues.access_token}`
      },
      form:{
        client_use_code: 'T991634670',
        user_seq_no: user.dataValues.user_seq_no  
      }
    };
  
    request.post(option,(err,response,body)=>{
      const res_body = JSON.parse(body);
      console.log(body);
      if(!res_body.api_tran_id) res.json({message:"failed logout"})
      else res.json({message: "success logout"});
    });
  }catch(e){
    res.status(400).json(e.message).end();
  }
}

const secession = async (req,res)=>{
  try{
    const user_seq_no = req.decoded.user_seq_no;
    const user = await User.findOne({
      where:{user_seq_no:user_seq_no}
    });
    if(!user) throw new Error('no exist user');
    const option = {
      uri: "https://testapi.openbanking.or.kr/v2.0/user/close",
      headers:{
        Authorization: `Bearer ${user.dataValues.access_token}`
      },
      form:{
        client_use_code: 'T991634670',
        user_seq_no: user.dataValues.user_seq_no  
      }
    };
    request.post(option,async(err,response,body)=>{
      const res_body = JSON.parse(body);
      console.log(body); 
      if(!res_body.api_tran_id) res.json({message:"failed logout"});
      else{
        await User.destroy({where:{user_seq_no:user_seq_no}});
        res.json({message: "success secession"});
      } 
    });
  }catch(e){
    res.status(400).json(e.message).end();
  }
}

module.exports = {
  authorize,
  authorize_callback,
  logout,
  secession,
}
