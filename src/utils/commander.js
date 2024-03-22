const {Command} = require("commander");
const program = new Command(); 

//Comando, descripción, Valor por default
program
    .option("--mode <mode>", "modo de trabajo", "prod")
program.parse();

module.exports = program;