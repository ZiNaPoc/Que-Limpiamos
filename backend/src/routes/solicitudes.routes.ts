import {Router} from "express";

import { obtenerSolicitudes } from "../controllers/solicitudes.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAdmin)

router.get("/", obtenerSolicitudes);

export default router;