const infoRegister = (email) => {
    return ` El email ${email} ya se encuentra registrado en el sistema.
    Verifique su email y vuelva a intentarlo. De lo contrario ingrese al login.`
}
const infoCredencials = () => {
    return "Las credenciales ingresadas no son correctas, por favor vuelva a intentar"    
}

const infoProductNotFound = () => {
    return "El producto no existe"
}

module.exports = {
    infoRegister,
    infoCredencials,
    infoProductNotFound
}