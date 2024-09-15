import jwt from "jsonwebtoken"
import bcrpyt from "bcrypt"
import { asyncHandler } from "../../utils/globalErrorHandling.js";
import { AppError } from "../../utils/classError.js";
import companyModel from "../../../db/models/company.model.js";


export const addCompany = asyncHandler( async(req,res,next)=>{
  const {companyName ,description ,industry,address , numberOfEmployees ,companyEmail} = req.body
  const companyExist = await companyModel.findOne({companyName})
  if(companyExist){
    return next (new AppError("this company is already exist",404))
  }
  const company =  new companyModel({
    companyName ,description ,industry,address , numberOfEmployees ,companyEmail,companyHR: req.user._id 
  })
  await company.save();
  res.status(201).json({
    msg: "Company created successfully",
    company: company
  });
})


export const updateCompany = asyncHandler(async(req,res,next)=>{
  const { companyId } = req.params;
  const { companyName, description, industry, address, numberOfEmployees, companyEmail } = req.body;

  // Find the company by its ID
  const company = await companyModel.findById(companyId);

  if (!company) {
    return next(new AppError("Company not found", 404));
  }
  if(company.companyHR.toString() !== req.user._id.toString()){
    return next(new AppError("you are not authorized to update", 403));
  }
  company.companyName = companyName || company.companyName;
  company.description = description || company.description;
  company.industry = industry || company.industry;
  company.address = address || company.address;
  company.numberOfEmployees = numberOfEmployees || company.numberOfEmployees;
  company.companyEmail = companyEmail || company.companyEmail;

  await company.save();
  res.status(200).json({msg:"company updated",company:company})
})

export const deleteCompany = asyncHandler(async (req,res,next)=>{
  const {companyId} = req.params
  const company = await companyModel.findById(companyId)
  if(!company){
    return next(new AppError("Company not found", 404));
  }
  if (company.companyHR.toString() !== req.user._id.toString()){
    return next(new AppError("you are not authorized to update", 403));
  }
  await company.deleteOne()
  res.status(200).json({
    msg: "Company deleted successfully"
  });
})


export const getCompany = asyncHandler (async (req,res,next)=>{
  const {companyId}= req.params
  const company = await companyModel.findById(companyId)
  if(!company){
    return next(new AppError("Company not found", 404));
  }
  if (company.companyHR.toString() !== req.user._id.toString()) {
    return next(new AppError("You are not authorized to access this company's data", 403));
  }
  const jobs = await jobModel.find({ companyId });
  res.status(200).json({msg:"company data",company,jobs})
})


export const searchCompanyByName = asyncHandler(async(req,res,next)=>{
  const {companyName} = req.query
  if(!companyName){
    return next(new AppError("Please provide a company name to search for", 400));
  }
  const companies = await companyModel.find ({
    companyName: { $regex: companyName, $options: "i" }
})
  if(!companies.length){
    return next(new AppError("No companies found matching this name", 400));
  }
  res.status(200).json({
    msg: "Companies found",
    companies
  })
})