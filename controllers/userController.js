import { componentesDB } from "../instances/iPgHandler.js";
import { CryptManager } from "../utils/encrypter.js";

export class userController {
    static async getUsers(req, res) {
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
      }

      static async createUser(req, res){
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
          res.status(200).json({success: true, message: 'User created succesfully'});
        } catch (error) {
          await componentesDB.rollbackTransaction(client);
          res.status(500).json({
            errorMsg: 'Error al crear usuario',
            detail: error.message
          })
      
        }
      }

      static async updateUser(req, res){
        try {
          const {user, email, pwd} = req.body;
          const {id} = req.params;
          const hashedPwd = await CryptManager.encriptarData({data: pwd});
          await componentesDB.exeQuery({key: 'updateUser', params: [user, email, hashedPwd, id]});
          res.status(200).json({success: true, message: 'Usuario actualizado correctamente'});
        } catch (error) {
          res.status(500).json({
            errorMsg: 'Error al actualizar usuario',
            detail: error.message
          })
        }
      }

      static async deleteUser(req, res){
        try {
          const {id} = req.params;
          const client = await componentesDB.beginTransaction();
          await componentesDB.exeQuery({key: 'deleteUser', params: [id], client});
          await componentesDB.exeQuery({key: 'deleteUserProfile', params: [id], client});
          await componentesDB.commitTransaction(client);
          res.status(200).json({success: true, message: 'Usuario eliminado correctamente'});
        } catch (error) {
          res.status(500).json({
            errorMsg: 'Error al eliminar usuario',
            detail: error.message
          })
        }
      }
}