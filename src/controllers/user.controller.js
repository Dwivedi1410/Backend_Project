import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave : false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh Token");
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // steps to register our user are :- 
    // get user details from the frontend
    // validate the data entered by the user
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to clodinary, then check avatar again
    // create user object- create entru in db
    // remove password and refresh token form the response
    // check for user creation
    // return res

    const { username, email, fullName, password } = req.body;
    //because we get all the data from the body
    // console.log("email :", email);

    if(
        [username, email, fullName, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username}, {email}]
        //$or => this is operators we can also use and and not 
    })
    //findOne will return the first one that will match this username or password in the database => if return then the value or user alread exists.

    if(existedUser){
        throw new ApiError(409, "User with this email or username alredy exists")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // Because req.files.avatar is an array of files
    //this req.files feature is given by the multer => here i am getting where multer has stored the file in out local server(in public/temp)

    // const coverImageLocalPath = req.files?.coverImage[0].path;

    let coverImageLocalPath;
    if(req.files &&  Array.isArray(req.files.coverImage)  &&  req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // here i put wait because this process takes some time to execute that's why i used await because i don't want to move to the next step before executing this.

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }

    const user= await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        // if coverImage is not present then return "" => because it is not necessary that coverImage is always present
        email,
        password,
        username: username.toLowerCase()
    })
    // here i am making an object and putting it in database

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // I am checking that user is created or not in the database => because if created then database will provide an unique _id to it by itself in the databse. and I am removing the two fields from the response (password and refreshToken).

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
           "User resgistered successfully",
        )
    )    
})

const loginUser = asyncHandler( async (req, res) => {
    //steps :-
    //get user data from the body
    //you can either choose username or email for login
    //find the user
    //password check
    //access and refresh token
    //send these tokens with the cookies(secure cookies)

    const { username, email, password} = req.body;

    if(!username && !email){
        throw new ApiError(400, "Username or Email is required");
    }

    const user = await User.findOne({
        $or : [{username}, {password}]
    })

    if(!user){
        throw new ApiError(404, "User dosn't exists")
    }

    const isValidPassword = await user.isPasswordCorrect(password)

    if(!isValidPassword) {
        throw new ApiError(401, "Invalid Password");
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id);

    const loggedInUser = await User.findOne(user._id).select("-password -refreshToken");


    // Now we have to send the cookies
    // For this we have to create options(nomral object)

    const options = {
        httpOnly : true,
        secure : true,
        //This is done so that no one can modify our cookies from the frontend it can only be controlled or modifiable from the server
    }

    return res
    .status(200)
    .cookie("refreshToken" , refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser,
                refreshToken,
                accessToken,
            },
            "User LoggedIn successfully"
        )
    )
})

const logoutUser = asyncHandler( async (req, res) => {
    //what are the steps need to logout user :- 
    //first clear the cookies
    //and also remove the access and refresh tokens

    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken : undefined
            }
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true,
        //This is done so that no one can modify our cookies from the frontend it can only be controlled or modifiable from the server
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User LoggedOut"
        )
    )

})

const refreshAccessToken = asyncHandler( async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    
        const user = await User.findById(decodedToken?._id);
    
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if(incomingRefreshToken !== user.refreshToken){
            throw new ApiError(401, "Refresh Token is expired or Used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    "accessToken": accessToken,
                    "refreshToken": newRefreshToken
                },
                "Access Token Refreshed"
    
            )
        )
    } catch (error) {
        throw new ApiError(
            401,
            error?.message || "Invalid Refresh Token"
        )
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken
}