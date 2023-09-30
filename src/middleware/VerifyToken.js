import Jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // return res.sendStatus(401);
        return res.status(500).json({
            code: 401,
            message: 'Token Error atau Kadaluwarsa'
        })
    }

    Jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            // return res.sendStatus(403);
            return res.status(500).json({
                code: 401,
                message: 'Token Error atau Kadaluwarsa'
            })
        }

        req.email = decoded.email;
        next();
    });
}