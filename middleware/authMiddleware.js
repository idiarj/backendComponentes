import { sessionComponent } from "../sessionComp/sessionComponent.js";
import dotenv from 'dotenv';
dotenv.config();



export const authMiddleware = (req, res, next)=>{
    const cookies = req.cookies;
    console.log(cookies);
    if(!(cookies.access_token && cookies.refresh_token)){
        console.log('No hay cookies');
        res.status(401).json({errorMsg: 'Unauthorized 3'});
        return;
    }
    const decoded = sessionComponent.verifyToken({token: cookies.access_token, key: process.env.ACCESS_TOKEN_SECRET});
    console.log(`Authentication Middleware`);
    req.user = {
        userId: decoded.userId,
        username: decoded.username
    }
    req.profiles = decoded.profiles;
    next();

}