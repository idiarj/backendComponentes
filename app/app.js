import express from 'express';
import dotenv from 'dotenv';

import cookieParser from 'cookie-parser'
import { authMiddleware } from '../middleware/authMiddleware.js';
import { refeshMiddleware } from '../middleware/refreshMiddleware.js';
import { authRouter } from '../routes/authRouter.js';
import { userRouter } from '../routes/userRouter.js';
import { authorizationMidd } from '../middleware/authorizationMidd.js';



dotenv.config();





const app = express();
const PORT = process.env.PORT || 3000;
app.use(cookieParser());
app.use(express.json());

app.use('/auth', authRouter);
app.use('/user', userRouter);


-



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


