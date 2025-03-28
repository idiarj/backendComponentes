export const authorizationMidd = (...allowedRoles) => {
    return (req, res, next) => {
        const { user } = req;
        console.log('User: ', user);
        console.log('req.profiles: ', req.profiles);
        console.log('allowedRoles: ', allowedRoles);

        if (user && req.profiles.some(profile => allowedRoles.includes(profile.perfil))) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden" });
        }
    };
};