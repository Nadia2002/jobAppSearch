import mongoose from "mongoose"


const jobSchema = new mongoose.Schema({
  jobTitle:{
    type:String,
    required:true
  },
  jobLocation:{
    type:String,
    required:true
  },
  workingTime:{
    type:String,
    required:true,
    enum:["part-time","full-time"],
    default:"full-time"
  },
  seniorityLevel:{
    type:String,
    required:true,
    enum:["Junior", "Mid-Level", "Senior,Team-Lead", "CTO"],
  },
  jobDescription:{
    type:String,
    required:true
  },
  technicalSkills:{
    type:[String],
    required:true
  },
  softSkills:{
    type:[String],
    required:true
  },
  addedBy:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"company",
    required:true
  }
})
const jobModel = mongoose.model("job",jobSchema)
export default jobModel