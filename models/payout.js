const mongoose = require('mongoose');

const PayoutSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    type:{type: Number, required: true },
    amount: { type: Number, required: true }
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

const Payout = mongoose.model('payout', PayoutSchema);

module.exports = Payout;