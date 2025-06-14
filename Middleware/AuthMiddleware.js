import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const authMiddleware= (allowedRoles)=>{

return async(req, res, next) =>{

    try {
         const token= req.headers.authorization?.split(' ')[1];
     if(!token){
        return res.status(401).json({message:"your token is missing"});
     }
      const decoded=jwt.verify(token, process.env.JWT_SECRET);
     req.user=decoded;
     
    const role= req.user.role;
    if(allowedRoles.includes(role)){
       
        return next();
    }
     
       
          return res.status(401).json({message:"You are not authorized to perform this action", user})
   
       
     
    } catch (error) {
        res.status(500).json({message:"Internal server error Auth"});
    }

}
}

export default authMiddleware;