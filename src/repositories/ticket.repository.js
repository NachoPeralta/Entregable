const TicketManager = require('../dao/db/ticket-manager-db');
const dbTicketManager = new TicketManager();

class TicketRepository  {
   
    async getTicketById(cid) {
        const ticket = await dbTicketManager.getTicketById(cid);
        return ticket;
    }
}

module.exports = TicketRepository;