import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    
    return {accessToken, refreshToken};

  } catch (error) {
    throw new apiError(500,"Something went wrong while generating access or refresh tokens")
  }
}

const registerUser = asyncHandler(async (req, res) => {
  //steps to register user
  //1.get user details from frontend
  //2. validation of user details - not empty
  //3.  check if user already exists: username,emial
  //4.check for images , check for avatar(user model)
  //5.upload them to cloudinary, avatar
  //6.create user object - create entry in db
  //7.remove password adn refresh token from response
  //8.check for user creation
  //9.return response to frontend

  //1
  const { fullName, email, username, password } = req.body;

  //2
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    res.status(400);
    throw new apiError(400, "All fields are required");
  }

  //3
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new apiError(409, "Username or email already exists");
  }
  //console.log(req.files);
  
  //4
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //const coverImageLocalPath = req.files.coverImage[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar is required");
  } //coverImage is optional

  //5
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  let coverImage = null;
  if (coverImageLocalPath) {
    coverImage = await uploadOnCloudinary(coverImageLocalPath);
  }
  if (!avatar) {
    throw new apiError(500, "Avatar upload failed");
  }

  //6
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase().trim(),
  });

  //7
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //8
  if (!createdUser) {
    throw new apiError(500, "User creation failed");
  }

  //9
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req,res) => {
  // req body -> data
  //username or email
  //find the user
  //password check
  //access and refresh token 
  //send cookies

  const {email,username,password} = req.body
  console.log(email);
  if(!username && !email){
    throw new apiError(400, "Username or email is required");
  }
  const user = await User.findOne({
    $or: [{username},{email}]
  })

  if(!user){
    throw new apiError(404,"User does not exist");
  }

  const isPasswordValid = await user.comparePassword(password)

  if(!isPasswordValid){
    throw new apiError(401,"Invalid user credentials");
  }

  const { accessToken,refreshToken } = await  generateAccessAndRefreshTokens(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    //cookies modifiable by servers only not by the frontend
    httpOnly: true,
    secure: true,

  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken,options)
  .json(
    new apiResponse(
      200,
      {
        user: loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully"
    )
  )
})

const logoutUser = asyncHandler(async(req,res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new apiResponse(200,{},"User looged out"))
})

const refreshAccessToken = asyncHandler(async (req,res) => {
  const incommingRefreshToken = req.cookie.refreshToken || req.body.refreshToken;

  if(!incommingRefreshToken){
    throw new apiError(401,"Unauthorised request");
  }

  const decodedToken = jwt.verify( incommingRefreshToken, 
  process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id);

  if(!user){
    throw new apiError(401, "Invalid refresh token")
  }

  if(incommingRefreshToken !== user?.refreshToken){
    throw new error(401,"Refresh token is expired")
  }

  const options = {
    httpOnly: true,
    secure: true
  }

  const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

  return res
  .status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken", newRefreshToken,options)
  .json(
    new apiResponse(200,{accessToken, refreshToken: newRefreshToken},
      "Access token refreshed"
    )
  )
})

export { registerUser, loginUser,logoutUser, refreshAccessToken};