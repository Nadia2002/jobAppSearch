import mongoose from "mongoose";
const connectionDB= async ()=>{
  return await mongoose.connect(process.env.DATABASE_URL)
  .then(()=>{
    console.log("database connected")
  }).catch((err)=>{
    console.log("database failed to connect",err)
  })
}
export default connectionDB;