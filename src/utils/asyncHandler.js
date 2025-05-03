const asyncHandler = (handleRequest) => {
    return (req, res, next) => {
        Promise.resolve(handleRequest(req, res, next)).catch((error) => next(error))
    }
}





/*
2'nd method of writtig the above code by using the try catch block

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        res.status(err.code || 500).json({
            success: false,
            message: err.message
        })
    }
}
*/
/* 
In Express, if you use async/await and an error is thrown, Express won’t automatically catch it unless you manually wrap every route in a try/catch.



Example with asyncHandler:(wraps the function inside the asyncHandler so it will automatically apply try catch logic in this function)

import { asyncHandler } from "./utils/asyncHandler.js";
app.get("/user", asyncHandler(async (req, res) => {
    const user = await getUserFromDB();
    res.json(user);
}));

*/


export { asyncHandler }