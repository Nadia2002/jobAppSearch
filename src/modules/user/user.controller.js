import userModel from "../../../db/models/user.model.js";
import { sendEmail } from "../../services/sendEmail.js";
import { AppError } from "../../utils/classError.js";
import { asyncHandler } from "../../utils/globalErrorHandling.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generateOtp } from "../../services/generateOtp.js";

export const signUp = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  } = req.body;
  const userExist = await userModel.findOne({ email: email.toLowerCase() });
  userExist && next(new AppError("user is already exist", 409));
  const token = jwt.sign({ email }, process.env.SIGNUP_TOKEN);
  const rfToken = jwt.sign({ email }, process.env.REFRESH_TOKEN);
  const rflink = `${req.protocol}://${req.headers.host}/users/refreshToken/${rfToken}`;
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;
  //await sendEmail (email , "verify your email", `<a href = ${link}> Click Here </a>`)
  await sendEmail(
    email,
    "verify your email",
    `<a href = ${link}> click here </a>
    <br>
    <a href= ${rflink} > click here to resend the link </a>`
  );
  const hash = bcrypt.hashSync(password, 10);
  const user = new userModel({
    firstName,
    lastName,
    email,
    password: hash,
    recoveryEmail,
    DOB,
    mobileNumber,
    role,
  });
  const newUser = await user.save();
  newUser
    ? res.status(201).json({ msg: "done", user: newUser })
    : next(new AppError("user not created", 400));
});
export const verifyEmail = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.SIGNUP_TOKEN);
  if (!decoded?.email) {
    return next(new AppError("invalid token", 400));
  }
  const user = await userModel.findOneAndUpdate(
    { email: decoded.email, confirmed: false },
    { confirmed: true }
  );
  user
    ? res.status(201).json({ msg: "done" })
    : next(new AppError("user is already confirmed email", 500));
});

export const refreshToken = asyncHandler(async (req, res, next) => {
  const { rfToken } = req.params;
  const decoded = jwt.verify(rfToken, process.env.REFRESH_TOKEN);
  if (!decoded?.email) {
    return next(new AppError("invalid Token", 400));
  }
  const token = jwt.sign({ email: decoded.email }, process.env.SIGNUP_TOKEN, {
    expiresIn: 6,
  });
  const link = `${req.protocol}://${req.headers.host}/users/verifyEmail/${token}`;
  await sendEmail(
    decoded.email,
    "verify your email",
    `<a href = ${link}> Click Here </a>`
  );
  res.status(200).json({ msg: "done" });
});

export const signIn = asyncHandler(async (req, res, next) => {
  const { email, password, recoveryEmail, mobileNumber } = req.body;

  const user = await userModel.findOneAndUpdate(
    { email: email, confirmed: true },
    { status: "online" }
  );
  if (!user) {
    return next(
      new AppError("User does not exist or user not confirmed yet", 400)
    );
  }
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return next(new AppError("Incorrect password", 400));
  }
  const token = jwt.sign({ email: email, id: user.id },process.env.SIGNIN_TOKEN);
  res.status(200).json({ msg: "welcome", token });
});

export const updateAccount = asyncHandler(async (req, res, next) => {
  const { email, mobileNumber, recoveryEmail, DOB, lastName, firstName } =
    req.body;
  const exist = await userModel.findOne({ email, mobileNumber });
  if (exist) {
    return next(new AppError("this email and mobilenumber is already taken"));
  }
  const user = await userModel.findByIdAndUpdate(
    req.user._id,
    { mobileNumber },
    { new: true }
  );
  if (!user) {
    return next(AppError("user not exist", 400));
  }
  res.status(200).json({ msg: "user updated", user });
});
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOneAndDelete(req.user_id, {
    status: "online",
  });
  // if (user.status !== "online") {
  //   return next(new AppError("User must be online to delete the account", 400));
  // }
  if (!user) {
    return next(new AppError("failed to delete user", 400));
  }
  res.status(200).json({ msg: "user deleted done" });
});

export const getData = asyncHandler(async (req, res, next) => {
  const user = await userModel.findOne({ status: "online" });

  if (!user) {
    return next(new AppError("user not exist "), 400);
  }
  res.status(200).json({ msg: "user data", user });
});

export const getDataById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const user = await userModel.findById(id);
  if (!user) {
    return next(new AppError({ msg: "user of this id is not exist" }, 404));
  }
  res.status(200).json({ msg: "this is user data for this id", user });
});

export const updatePassword = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  const user = await userModel.findById(id);
  if (!user) {
    return next(new AppError({ msg: "user not found" }, 200));
  }
  user.password = hashedPassword;
  res.status(200).json({ msg: "password updated" });
});

export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  const otp = generateOtp(); // Your OTP generator function
  const otpHash = bcrypt.hashSync(otp, 10); // Hash the OTP

  // Save OTP hash and expiry time in the user's document
  user.resetPasswordOTP = otpHash; // Ensure field naming consistency
  user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes expiry

  await user.save();

  // Send OTP via email
  await sendEmail(email, "Reset Password OTP", `<p>Your OTP is ${otp}</p>`);

  res.status(200).json({ msg: "OTP has been sent to your email" });
});

export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;
  const user = await userModel.findOne({ email });

  if (!user) {
    return next(new AppError("User does not exist", 400));
  }

  // Check if OTP is valid and not expired
  if (!user.resetPasswordOTP || user.resetPasswordExpiry < Date.now()) {
    return next(new AppError("OTP expired or invalid", 400));
  }

  // Compare the provided OTP with the hashed OTP
  const isOtpValid = bcrypt.compareSync(otp.toString(), user.resetPasswordOTP);
  if (!isOtpValid) {
    return next(new AppError("Invalid OTP", 400));
  }

  // Hash the new password and update the user's password
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  user.password = hashedPassword;

  // Clear OTP and expiry fields
  user.resetPasswordOTP = undefined;
  user.resetPasswordExpiry = undefined;

  await user.save();

  res.status(200).json({ msg: "Password has been updated successfully." });
});

export const getAccountsByEmail = asyncHandler(async (req, res, next) => {
  const { recoveryEmail } = req.body;
  const users = await userModel.find({ recoveryEmail });
  // If no users found, return an error
  if (!users || users.length === 0) {
    return next(new AppError("No users found with this recovery email", 400));
  }
  res.status(200).json({
    msg: "These are all the users with the same recovery email",
    users,
  });
});
