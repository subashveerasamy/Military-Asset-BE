import mongoose from 'mongoose';
import {format} from 'date-fns';


const userSchema= new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    username:{
        type: String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        enum:["admin","base_commander", "logistics_officer"],
        required:true
    },
    base:{
        type:String,
        required:true
    },
     gender:{type:String,default:""},
    dob:{type:String,default:""},
    registeredDate:{
        type:String,
        default: format(new Date(), 'yyyy-MM-dd')
    },
    exitDate:{
        type:String,
        default: ""
    },
    status:{
        type:String,
        enum:["active", "inactive"],
        default:"active"
    }
},{versionKey:false})

const users=mongoose.model("users",userSchema);
export default users;