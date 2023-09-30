import Users from "../models/UserModel.js";
import bcrypt from "bcrypt";
import Jwt from "jsonwebtoken";
import { Sequelize, QueryTypes } from "sequelize";
import db from "../config/Database.js";

export const getUsers = async(req, res) => {
    try {
        // === ORM ===
        //  const users = await Users.findAll({
        //     attributes:['id', 'name', 'email']
        // });

        const [users, metadata] = await db.query("SELECT id, name, email FROM master.users");
       
        res.json({
            code: 1,
            message: 'Data Berhasil Ditampilkan',
            data: users
        });
    } catch (error) {
        console.log('Users:', error);
    }
}

export const Register = async(req, res) => {
    const { name, email, password, confPassword } = req.body;

    if (password !== confPassword) {
        return res.status(400).json({message: "Password dan Confirm Password tidak cocok"});
    }

    const salt = await bcrypt.genSalt();
    const hasPassword = await bcrypt.hash(password, salt);

    try {
        // ORM
        // await Users.create({
        //     name: name,
        //     email: email,
        //     password: hasPassword
        // });

        const [createUsers, metadata] = await db.query(`INSERT INTO master.users (name, email, password, "createdAt", "updatedAt") VALUES ('${name}', '${email}', '${hasPassword}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);

        console.log(metadata)

        res.json({
            code: 1,
            message: "Register Berhasil",
            data: {
                name: name,
                email: email
            }
        });
    } catch (error) {
        console.log('Register:', error);
    }
}

export const Login = async(req, res) => {
    try {
        const user = await Users.findAll({
            where:{
                email: req.body.email
            }
        });
        const match = await bcrypt.compare(req.body.password, user[0].password);

        if(!match) {
            return res.status(400).json({message: "Wrong Password"});
        }

        const userId = user[0].id;
        const name = user[0].name;
        const email = user[0].email;
        const accessToken = Jwt.sign({userId, name, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '600s'
        });
        const refreshToken = Jwt.sign({userId, name, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        });

        await Users.update({refresh_token: refreshToken}, {
            where: {
                id: userId
            }
        });

        res.cookie('refreshTokenFikar', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({ accessToken });

    } catch (error) {
        res.status(404).json({message: "Email atau Password Salah!"});
    }
}

export const Logout = async(req, res) => {
    const refreshToken = req.cookies.refreshTokenFikar;
    
    if (!refreshToken) {
        return res.sendStatus(204);
    }

    const user = await Users.findAll({
        where: {
            refresh_token: refreshToken
        }
    });

    if (!user[0]) {
        return res.sendStatus(204);
    }

    const userId = user[0].id;

    await Users.update({ refresh_token: null}, {
        where: {
            id: userId
        }
    });

    res.clearCookie('refreshTokenFikar');

    return res.sendStatus(200);
}
 