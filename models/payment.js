const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    amount: { type: String, required: true },
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users",
        required: true
    },
    package_id: {
        type: mongoose.Types.ObjectId,
        ref: "packages",
        required: true
    },
    image: { type: String },
    method: { type: String },
    status: { type: String, default: "confirmed" },
    referrence: { type: String, required: true }
},
    {
        toJSON: {
            transform(doc, ret) {
                delete ret.__v;
                delete ret.createdAt;
                delete ret.updatedAt;
            },
        },
        timestamps: true
    });

const Payment = mongoose.model('payment', PaymentSchema);

module.exports = Payment;