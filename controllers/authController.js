import { iMailer } from "../instances/iMailer.js";
import { componentesDB } from "../instances/iPgHandler.js";
import { CryptManager } from "../utils/encrypter.js";
import { sessionComponent } from "../components/sessionComponent.js";
import { getTemplate } from "../utils/template.js";

export class authController {
    static async login(req, res) {
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
    }

    static async register(req, res) {
      const client = await componentesDB.beginTransaction();
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
        if(!user || !email || !pwd){
          res.status(400).json({success: false, message: 'Incromplete data'});
          return;
        }
    
        const [{id_usuario}] = await componentesDB.exeQuery({key: 'registerUser', params: [user, email, hashedPwd], client});
        await componentesDB.exeQuery({key: 'insertUserProfile', params: [id_usuario], client});
        await componentesDB.commitTransaction(client);

        await iMailer.sendTemplate({
          from: 'idiar16@gmail.com',
          to: email,
          subject: 'Bienvenido a la plataforma',
          template: getTemplate({user}),
          attachments: [{
            filename: 'Bienvenido.jpg',
            path: './assets/img.jpg'
          }]
        })
        res.status(200).json({success: true, message: 'User created succesfully'});
      } catch (error) {
        await componentesDB.rollbackTransaction(client);
        res.status(500).json({
          errorMsg: 'Error al registrarse',
          detail: error.message
        })
    
      }
    }
}