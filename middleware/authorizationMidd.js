export const authorizationMidd = (...allowedRoles) => {
    return (req, res, next) => {
        const { user } = req;
        console.log('User: ', user);
        console.log(req.profiles)
        console.log(allowedRoles)
        if (user && allowedRoles.includes(req.profiles)) {
            next();
        } else {
            res.status(403).json({ message: "Forbidden" });
        }
    };
}