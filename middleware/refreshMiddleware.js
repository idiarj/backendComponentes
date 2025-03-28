import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const refeshMiddleware = async (req, res, next) => {
    const cookies = req.cookies;
    console.log('Cookies en refreshMiddleware: ', cookies);

    if (!cookies.refresh_token) {
        console.log('No hay refresh token');
        return res.status(401).json({ errorMsg: 'Unauthorized 1' });
    }

    try {
        if (!cookies.access_token) {
            console.log('No hay access token');
            const decoded = jwt.verify(cookies.refresh_token, process.env.REFRESH_TOKEN_SECRET);
            console.log(decoded);

            const new_access_token = jwt.sign(
                { userId: decoded.userId, username: decoded.username },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '5min' }
            );

            console.log('Se generó un nuevo access token');
            res.cookie('access_token', new_access_token, { 
                httpOnly: true, 
                secure: false, // Cambiar a false para desarrollo local
                sameSite: 'lax', // Cambiar a 'lax' para evitar restricciones en local
                maxAge: 1000 * 30 
            });
        }
        next();
    } catch (error) {
        console.log(error);
        return res.status(401).json({ errorMsg: 'Unauthorized 2' });
    }
};