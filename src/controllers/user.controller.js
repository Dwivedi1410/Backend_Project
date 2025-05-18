import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    console.log("email :", email);

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

    const coverImageLocalPath = req.files?.coverImage[0].path;

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

export {registerUser}