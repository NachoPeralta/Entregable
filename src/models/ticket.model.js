const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    purchace_datetime: {
        type: Date,
        default: Date.now,
        required: true
    },
    amount: {
        type: Number,
        required: true,
    },
    purchase: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
});

const TicketModel = mongoose.model('tickets', ticketSchema);

module.exports = TicketModel;