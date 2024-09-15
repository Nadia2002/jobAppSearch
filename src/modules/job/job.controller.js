import { asyncHandler } from "../../utils/globalErrorHandling.js";
import { AppError } from "../../utils/classError.js";
import jobModel from "../../../db/models/job.model.js";
import companyModel from "../../../db/models/company.model.js";

/////////////////////////////"addJob"//////////////////////////////////////////

export const addJob = asyncHandler(async (req, res, next) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const addedBy = req.user._id;

  const newJob = new jobModel({
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
    addedBy,
  });

  const savedJob = await newJob.save();
  res.status(201).json({ message: "Job added successfully", job: savedJob });
});
/////////////////////////////"updateJob"//////////////////////////////////////////
export const updateJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;

  const job = await jobModel.findById(jobId);
  if (!job) {
    return next(new AppError("job is not exist", 404));
  }
  if (job.addedBy.toString() !== req.user._id.toString()) {
    return next(new AppError("you are not authorized to update", 403));
  }
  job.jobTitle = jobTitle || job.jobTitle;
  job.jobLocation = jobLocation || job.jobLocation;
  job.workingTime = workingTime || job.workingTime;
  job.seniorityLevel = seniorityLevel || job.seniorityLevel;
  job.jobDescription = jobDescription || job.jobDescription;
  job.technicalSkills = technicalSkills || job.technicalSkills;
  job.softSkills = softSkills || job.softSkills;

  // Save the updated job
  const updatedJob = await job.save();

  // Return success response
  res.status(200).json({
    message: "Job updated successfully",
    job: updatedJob,
  });
});
/////////////////////////////"deleteJob"//////////////////////////////////////////
export const deleteJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const job = await jobModel.findById(jobId);
  if (!job) {
    return next(new AppError("job not found", 404));
  }
  if (job.addedBy.toString() !== req.user._id.toString()) {
    return next(new AppError("you are not authorized to delete", 403));
  }
  await job.deleteOne();
  res.status(200).json({
    msg: "job deleted successfully",
  });
});
/////////////////////////////"getJobByCompany"//////////////////////////////////////////
export const getJobByCompany = asyncHandler(async (req, res, next) => {
  const { companyName } = req.query;

  // Check if the company name was provided
  if (!companyName) {
    return next(
      new AppError("Please provide a company name in the query.", 400)
    );
  }

  // Find the company by its name (case-insensitive search)
  const company = await companyModel.findOne({
    companyName: { $regex: new RegExp(companyName, "i") },
  });

  // If the company doesn't exist
  if (!company) {
    return next(
      new AppError(`Company with name "${companyName}" not found`, 404)
    );
  }

  // Find all jobs that belong to this company
  const jobs = await jobModel.find({ addedBy: company.companyHR });

  // If no jobs were found for the company, return a message
  if (jobs.length === 0) {
    return next(
      new AppError(`No jobs found for the company: ${companyName}`, 404)
    );
  }

  // Send the response with the jobs
  res.status(200).json({
    message: `Jobs for the company: ${companyName}`,
    jobs,
  });
});

/////////////////////////filterJob////////////////////////////////////////////////
export const filterJob = asyncHandler(async (req, res, next) => {
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;
  const query = {};
  if (workingTime) {
    query.workingTime = workingTime;
  }
  if (jobLocation) {
    query.jobLocation = jobLocation;
  }
  if (seniorityLevel) {
    query.seniorityLevel = seniorityLevel;
  }
  if (jobTitle) {
    query.jobTitle = { $regex: new RegExp(jobTitle, "i") }; // Case-insensitive job title search
  }
  if (technicalSkills) {
    const skillsArray = Array.isArray(technicalSkills)
      ? technicalSkills
      : technicalSkills;
    query.technicalSkills = { $all: skillsArray };
  }
  const jobs = await jobModel.find(query);
  if (jobs.length === 0) {
    return next(
      new AppError("No jobs found matching the provided criteria.", 404)
    );
  }
  res.status(200).json({
    message: "Filtered jobs retrieved successfully",
    jobs,
  });
});
///////////////////////////////"applicationJob"/////////////////////////////////////////////////
export const applyToJob = asyncHandler(async (req, res, next) => {
  const { jobId } = req.params;
  const { userTechSkills, userSoftSkills, userResume } = req.body;

  // Validate job existence
  const job = await jobModel.findById(jobId);
  if (!job) {
    return next(new AppError("Job not found.", 404));
  }

  // Check if the user has already applied to this job
  const existingApplication = await applicationModel.findOne({
    jobId: jobId,
    userId: req.user._id
  });
  if (existingApplication) {
    return next(new AppError("You have already applied for this job.", 400));
  }

  // Validate the necessary fields
  if (!userTechSkills || !userSoftSkills || !userResume) {
    return next(new AppError("Technical skills, soft skills, and resume are required.", 400));
  }

  // Create a new application
  const application = await applicationModel.create({
    jobId: jobId,
    userId: req.user._id,
    userTechSkills: userTechSkills,
    userSoftSkills: userSoftSkills,
    userResume: userResume
  });

  // Return success message
  res.status(201).json({
    message: "Application submitted successfully.",
    application
  });
});