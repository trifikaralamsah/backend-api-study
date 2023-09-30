import Users from "../models/UserModel.js";
import Jwt from "jsonwebtoken";

export const refreshToken = async(req, res) => {
    try {
        const refreshToken = req.cookies.refreshTokenFikar;
        // const refreshToken = req.body.refreshTokenFikar;
        if (!refreshToken) {
            return res.sendStatus(401);
        }

        const user = await Users.findAll({
            where:{
                refresh_token: refreshToken
            }
        })


        if (!user) {
            return res.sendStatus(403);
        }

        Jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            console.log(decoded.exp)
            if (err) {
                return res.sendStatus(403);
            }

            const userId = user[0].id;
            const name = user[0].name;
            const email = user[0].email;
            const accessToken = Jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '600s'
            });

            console.log('name', name);

            res.json({ 
                'accessToken': accessToken,
                'expire': decoded.exp
            });
        });
    } catch (error) {
        // console.log('refreshToken', error);
    }
}