export const asyncHandler =(fn)=>{
  return (req,res,next)=>{
    fn(req,res,next).catch((err)=>{
      next(err)
    })
  }
}

export const GlobalErrorHandling =((err,req,res,next)=>{
  res.status(err.statuscode || 500).json({msg:'error',err:err.message})
})