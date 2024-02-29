import { Router } from "express";
import { register, login, logout, validateToken, deleteUser, updateUser } from "../controllers/auth.controller.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/validateToken', validateToken);

export default router;