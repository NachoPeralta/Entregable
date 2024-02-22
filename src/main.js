const Server = require('./service/Server');

console.log("Instancia de la clase Server");
const myServer = new Server();

console.log("*********************************************");
console.log("Iniciando Servidor...");
myServer.start();
console.log("*********************************************");