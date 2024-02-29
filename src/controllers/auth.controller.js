import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';
import jwt from 'jsonwebtoken'
import { TOKEN_SECRET } from '../config.js';

export const register = async (req, res) => {

    const { password, username } = req.body;

    try {
        const passwordHash = await bcrypt.hash(password, 10)
        const newUser = new User({
            username,
            password: passwordHash,
           
        });

        const userSaved = await newUser.save();
        const token = await createAccessToken({ id: userSaved._id });

        res.json({
            user: {
                id: userSaved._id,
                username: userSaved.username,
              
            },
            token: token

        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const login = async (req, res) => {
    const { username, password } = req.body;
    try {

        const userFound = await User.findOne({ username });
      
        if (!userFound) return res.status(400).json({ message: "Usuario no encontrado" });

        const isMatch = await bcrypt.compare(password, userFound.password);
       
        if (!isMatch) return res.status(400).json({ message: "Credenciales incorrectas" });


        const token = await createAccessToken({ id: userFound._id });

        res.json({
            user: {
                id: userFound._id,
                username: userFound.username,              
                password: password
            },
            token: token

        })

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "El usuario no existe" });

        if (user.image_user?.public_id) {
            await deleteImage(user.image_user.public_id);
        }

        return res.json(user);

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "El usuario no existe" });

        if (req.body) {
            Object.assign(user, req.body);
        }

        if (req.body.password) {
            const passwordNormal = req.body.password;
            const passwordHash = await bcrypt.hash(passwordNormal, 10)
            user.password = passwordHash
        }

        // Actualiza el usuario en la base de datos
        await User.findOneAndUpdate({ _id: id }, user);

        res.json({
            user: {
                id: user._id,
                username: user.username,
                password: user.password,
            }

        })


    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
}

export const validateToken = async (req, res) => {
    const tokenHeader = req.header('x-token');

    if (!tokenHeader) {
        res.status(401).json({ message: 'No hay token en la petición' });
    }
    try {
        const { id } = jwt.verify(tokenHeader, TOKEN_SECRET);

        const userSaved = await User.findById(id);
        if (!userSaved) {
            return res.status(401).json({ message: 'Token no válido - usuario no existe' })
        }
        res.json({
            user: {
                id: userSaved._id,
                username: userSaved.username,
                email: userSaved.email,
                image: userSaved.image_user
            },
            token: tokenHeader
        });

    } catch (error) {
        return res.status(401).json({ message: 'Token inválido' });
    }
}