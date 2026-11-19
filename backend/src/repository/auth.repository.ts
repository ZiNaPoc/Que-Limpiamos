import { prisma } from "../config/prisma";

export function buscarUsuarioPorCorreo(correo: string) {
  return prisma.usuarios.findUnique({
    where: { correo },
  });
}