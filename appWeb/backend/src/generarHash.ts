import bcrypt from "bcrypt";

async function main(){
    const password = "Limpieza2026";

    const hash = await bcrypt.hash(password, 12);

    console.log("Contraseña: ", password);
    console.log("Hash: ", hash);
}

main();