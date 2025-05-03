import express from "express";

//we can configure cors and cookieParser after the formation of app
import cors from "cors";
//note:-Helps in security and browser communication when your frontend and backend are hosted on different domains.

import cookieParser from "cookie-parser";
//note:- Middleware to parse(break the code in to structured format that the  programme can undersatnd) cookies attached to the client request object. Useful for authentication and sessions.

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))
/* 
app.use(): Adds middleware to the Express app.

cors():
origin: Specifies which origin is allowed to make requests (like http://localhost:3000).
credentials: true: Allows cookies and HTTP credentials to be sent in cross-origin requests.

This is important for security and enabling the frontend to talk to the backend when they’re on different domains or ports.
*/ 



app.use(express.json({limit: "16kb"}))
/* 
Parses incoming JSON requests and makes the data available in req.body.

limit: "16kb": Restricts the size of the request body to 16 kilobytes to prevent large payloads or attacks.
*/


app.use(express.urlencoded({extended: true, limit: "16kb"}))
/* 
Parses data sent via HTML forms (application/x-www-form-urlencoded).

extended: true: Allows nested objects.

Also limited to 16kb for security.
*/


app.use(express.static("public"))
/* 
Serves static files like images, CSS, and JavaScript from the public directory.

Example: A request to /logo.png would serve the file public/logo.png.
*/


app.use(cookieParser());

export { app };
//we can also export it by using "export default app" but this is also same 