import express from 'express';
import dotenv from 'dotenv';
import {PgHandler} from '../DBComp/pgHandler.js';
import db from '../config/dbs.json' assert { type: "json" };
import querys from '../config/querys.json' assert { type: "json" };
import dbd from '../config/dbd.json' assert { type: "json" };
import cookieParser from 'cookie-parser'
import { authMiddleware } from '../middleware/authMiddleware.js';
import { refeshMiddleware } from '../middleware/refreshMiddleware.js';
import { CryptManager } from '../utils/encrypter.js';
import { sessionComponent } from '../sessionComp/sessionComponent.js';
import { authorizationMidd } from '../middleware/authorizationMidd.js';



dotenv.config();

// console.log(querys)
// console.log(db);
// console.log(db.deployed);
console.log(dbd)


const componentesDB = new PgHandler({config: dbd, querys, allowTransactions: true});

const transactionArray = [{
    key: 'getUsers',
    params: []
    }, {
    key: 'getApplications',
    params: []
}] 



// const transactionClient = testDB.beginTransaction();
// testDB.exeQuery({key: 'getUsers', params: [], client: transactionClient});
// testDB.exeQuery({key: 'getApplications', params: [], client: transactionClient})
// testDB.commitTransaction(transactionClient)

//await testDB.createModel({scriptPath: './model.txt' });




const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());


app.post('/auth/login', async (req, res)=>{
  try {
    const {user, pwd} = req.body;
    console.log("EL usuario es: ", user);
    console.log("La contraseña es: ", pwd);
    //Login
    const foundUser = await componentesDB.exeQuery({key: 'verifyUser', params: [user]})
    console.log(foundUser);
    if(foundUser.length === 0){
      res.status(401).json({success: false, message: 'Invalid user'});
      return;
    }



    const validPwd = await CryptManager.compareData({hashedData: foundUser[0].pwd, toCompare: pwd});
    if(!validPwd){
      res.status(401).json({success: false, message: 'Invalid password'});
      return;
    }

    const profiles = await componentesDB.exeQuery({key: 'getUserProfiles', params: [foundUser[0].id]});
    console.log(profiles);
    const userInfo = {
      userId: foundUser[0].id,
      username: foundUser[0].user,
      profiles
    }
    const {access_token, refresh_token} = sessionComponent.createSession({payload: userInfo, 
      access_token_key: process.env.ACCESS_TOKEN_SECRET, refresh_token_key: process.env.REFRESH_TOKEN_SECRET});
    res.cookie('refresh_token', refresh_token, {httpOnly: true, sameSite: 'none', maxAge: 1000 * 60 * 60 * 24 * 7});
    res.cookie('access_token', access_token, {httpOnly: true, sameSite: 'none', maxAge: 1000 * 30});
    res.status(200).json({success: true, message: 'Logged in succesfully'});
  } catch (error) {
    res.status(500).json({
      errorMsg: 'Error al loguearse',
      detail: error.message
    })
  }
})

// app.post('/auth/refresh', async ()=>{
//   try {
    
//   } catch (error) {
//     res.status(500).json({
//       errorMsg: 'Error al refrescar el token',
//       detail: error.message
//     })
//   }
// })


app.post('/register', async (req, res)=>{
  try {
    const {user, email, pwd} = req.body;
    console.log("El usuario es: ", user);
    const founduser = await componentesDB.exeQuery({key: 'verifyUser', params: [user]})
    if(founduser.length > 0){
      res.status(400).json({success: false, message: 'User already exists'});
      return;
    }
    console.log("El email es: ", email);
    console.log("La contraseña es: ", pwd);
    const hashedPwd = await CryptManager.encriptarData({data: pwd});
    await componentesDB.exeQuery({key: 'registerUser', params: [user, email, hashedPwd]})
    if(!user || !email || !pwd){
      res.status(400).json({success: false, message: 'Incromplete data'});
      return;
    }
    res.status(200).json({success: true, message: 'User created succesfully'});
  } catch (error) {
    res.status(500).json({
      errorMsg: 'Error al registrarse',
      detail: error.message
    })
  }
})

app.get('/users', refeshMiddleware, authMiddleware, authorizationMidd('Admin', 'Client'), async (req, res)=>{
  try {
    //Ver usuarios
    let users = await componentesDB.exeQuery({key: 'getUsers', params: []});
    res.status(200).json({success: true, users})
  } catch (error) {
    res.status(500).json({
      errorMsg: 'Error al obtener los usuarios',
      detail: error.message
    })
  }
})

-



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


