import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import users from '../Models/User.schema.js'


export const userRegister= async(req, res) =>{
       try {
        const {name, username, password, email,base, role}= req.body;
       if( !name || !username || !password || !email || !role || !base){
        return res.status(200).json({message:"All fields are required"});
       }

       const uniqueUsername= await users.findOne({username:username});
       const uniqueEmail= await users.findOne({email:email});
         
       if(uniqueUsername){
        return req.status(200).json({message:"Username allready exists"})
       }
       if(uniqueEmail){
        return req.status(200).json({message:"Email already exists"});

       }

       const hashPassword= await bcrypt.hash(password, 10);

       const newUser= new users({
        name,
        username,
        email,
        password: hashPassword,
        base,
        role
       })

       await newUser.save();
       return res.status(200).json({message:"User registered successfully!!"})
       } catch (error) {
        res.status(500).json({message:"Internal server error"})
       }
}


export const userLogin= async(req, res) =>{
   try {
       const {username, password}= req.body;

    const user= await users.findOne({username});
    if(!user){
        return res.status(200).json({message:"username not found"})
    }
    else{
        const isMatch=await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(200).json({message:"Invalid credentials"})
        }
        else{
            console.log(user.role)
                const token=jwt.sign({id:user._id, role:user.role}, process.env.JWT_SECRET,{expiresIn:"1h"})
            return res.json({message:"Successfully Login", token:token})
        }
    }
   } catch (error) {
    res.status(500).json({message:"Internal server error"})
   }
}

export const updateUserInfo= async(req, res)=>{
    try {
        const {name, email, gender, dob}= req.body;
    const id= req.user.id;

    await users.findByIdAndUpdate(id,{name, email, gender, dob},{new:true, runValidators:true});
    res.status(200).json({message:"Personal Info Updated Successfully"})

    } catch (error) {
        res.status(500).json({message:"Internal Server Error"})
    }

}

export const updateUserInfoByAdmin= async(req, res)=>{
    try {
        const {name, username, gender, dob,base, role, email, registeredDate, exitDate, status } = req.body;
        const user= await users.findOne({username});
        const id=user._id;
        if(!user){
            return res.status(200).json({message:"User Not Found"});
        }
        else{
            await users.findByIdAndUpdate(id,{name, username, gender, dob,base, role, email, registeredDate, exitDate, status }, {new:true, runValidators:true});
             res.status(200).json({message:"User Info Updated Successfully"})

        }
    } catch (error) {
         res.status(500).json({message:"Internal Server Error"})
  
    }
}

export const getUserDetails= async(req, res)=>{
    const id= req.user.id;
    const user= await users.findById(id);
    res.json({message:"Got user Info", user:user});
}