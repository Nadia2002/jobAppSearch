
import mongoose from "mongoose";



const userSchema = new mongoose.Schema({
  firstName:{
    type:String,
    required:true
  },
  lastName:{
    type:String,
    required:true
  },
  username:{
    type:String,
    
  },
  email:{
    type:String,
    required:true,
    unique:true,
    
  },
  password:{
    type:String,
    required:true
  },
  recoveryEmail:{
    type:String,
    required:true
  },
  DOB:{
    type:Date,
    required:true
  },
  mobileNumber:{
    type:Number,
    required:true,
    unique:true
  },
  role:{
    type:String,
    required:true,
    enum:["User","Company_HR"],
    default: 'User'
  },
  status:{
    type:String,
    default:"offline"
  },
  confirmed:{
    type:Boolean,
    default:false

  },
  resetPasswordOTP: {
    type: String,
    default: null
  },
  resetPasswordExpiry: {
    type: Date,
    default: null
  }
})

const userModel = mongoose.model("user",userSchema)
export default userModel