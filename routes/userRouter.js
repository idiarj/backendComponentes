import { Router } from "express";
import { userController } from "../controllers/userController.js";
import { refeshMiddleware } from "../middleware/refreshMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizationMidd } from "../middleware/authorizationMidd.js";

export const userRouter = Router();

userRouter.get('/users', refeshMiddleware, authMiddleware, authorizationMidd('Admin', 'Client'), userController.getUsers);
userRouter.post('/users', refeshMiddleware, authMiddleware, authorizationMidd('Admin'), userController.createUser);
userRouter.put('/users/:id', refeshMiddleware, authMiddleware, authorizationMidd('Admin'), userController.updateUser);
userRouter.delete('/users/:id', refeshMiddleware, authMiddleware, authorizationMidd('Admin'), userController.deleteUser);
