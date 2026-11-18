import {Router} from "express";

import {
    loginAdmin,
    logoutAdmin
} from "../controllers/auth.controller";

import { requireAdmin } from "../middleware/auth.middleware";

const router =  Router();

//LOGIN
router.post("/admin/login", loginAdmin);

router.get("/admin/session", requireAdmin, (_req, res) => {
    return res.status(200).json({
        autenticado: true,
        rol: 'ADMIN',
    });
});

//LOGOUT
router.post("/admin/logout", logoutAdmin);

export default router;
