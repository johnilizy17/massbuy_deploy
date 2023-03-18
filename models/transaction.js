const mongoose = require('mongoose');

const TranactionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    amount: { type: String, required: true },
    
    transaction_title: { type: String},
    referrence: { type: String, required: true },
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const Transaction = mongoose.model('transaction', TranactionSchema);

module.exports = Transaction;