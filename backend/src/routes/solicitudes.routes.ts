import {Router} from "express";

import { cambiarTrabajadorAsignado, obtenerSolicitudes } from "../controllers/solicitudes.controller";
import { requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAdmin)

router.get("/", obtenerSolicitudes);

router.patch("/:id/asignacion", cambiarTrabajadorAsignado);

export default router;