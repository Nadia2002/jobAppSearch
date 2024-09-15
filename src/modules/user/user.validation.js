import joi from "joi"
export const signUpValidation ={
 body:joi.body({
  fisrtName:joi.string.alphanum().min(3).max(30),
  lastName:joi.string.alphanum().min(3).max(30),
  email:joi.string().email(),
  recoveryEmail:joi.string().email(),
  password:joi.string(),
  DOB: joi.date().iso()
    .messages({
      'date.format': `"DOB" must be in the format YYYY-MM-DD`
    }),
  mobileNumber: joi.string(),
  role: joi.string().valid('User', 'Company_HR'),
  status: joi.string().valid('online', 'offline'),
})

}