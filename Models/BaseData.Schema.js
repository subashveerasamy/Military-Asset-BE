import mongoose from 'mongoose';
import {format} from 'date-fns'
const itemDetails= new mongoose.Schema({
    arm_name:{type:String, required:true},
    specific_name:{type:String, required:true},
    quantity:{type:Number, required:true},
    
},{versionKey:false, _id:false})

const transactionData= new mongoose.Schema({
     
     requesting_base:{
        type:String,
        required:true
     },
     receiving_base:{
        type:String, required:true
     },
     transaction_purpose:{
        type:String,
  
     },
     initiator:{
        type:String, required:true
     },
     movement_type:{
        type:String,
        enum:['transfer in', 'transfer out', 'purchase'],
       
     }
     ,
     requesting_base_approval:{
        type:String,
        enum:["approved", "cancelled", "yet to approve"],
        default:"yet to approve",
        required:true
     },
     receiving_base_approval:{
        type:String,
        enum:["approved", "rejected", "yet to approve","ordered"],
        default:"yet to approve",
        required:true
     },
     approved_date:{
        type:String,
        default:"-"
     },
      initiation_date:{
        type:String,
        default:"-"
     },
      completion_date:{
        type:String,
        default:"-"
     },
     item_details:{
        type:[itemDetails],
        required:true
     },
     remarks:{type:String, default:""},
     status:{
        type:String,
        enum:["yet to approve", "approved","initiated", "completed", "cancelled", "rejected"],
        default:"yet to approve"
     }

},{versionKey:false})

const arms= new mongoose.Schema({
         arm_name:{
        type:String, required:true
    },
    specific_name:{
        type:String, required: true
    },
    total:{
        type:Number,
        required:true
    },
        assigned:{
    type:Number,
    required:true
        },
        unassigned:{
            type:Number,
            required:true
        }
})




const assign_expend= new mongoose.Schema({
    
    soldier_name:{
        type:String,
        required:true
    },
     soldier_serial:{
        type:String,
        required: true
    },
    arm_name :{
        type:String, required:true
    },
    specific_name:{
        type:String, required:true
    },
     quantity:{
        type:Number,
        required: true
    },
    condition:{
        type:String, required:true
    },
   
    expenditure:{
        type:String,
        default:""
    },
    reason_for_expenditure:{
        type:String,
        default:""
    },
    assigned_date:{
        type:String, required:true
    },
    returned_date:{
        type:String,
        default:"-"
    }, assign_remarks:{
        type:String,
        required: true
    },
    return_remarks:{
        type:String,
        default:""
    }
},{versionKey:false})


const baseDataSchema= new mongoose.Schema({
    basename:{
        type: String,
        required:true
    },
    transaction:{
        type:[transactionData],
        default:[]
    },
    arms_data:{
        type:[
            {
                date:{
                    type:String, required:true
                },
                arms:{type:[arms], required:true}
            }
        ],
        default:[]
    },
    assigned_expenditure:{
        type:[assign_expend],
        default:[]
    },

},{versionKey:false, _id:false})

const baseData= mongoose.model("baseData", baseDataSchema);
export default baseData;