const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
    status: { type: String, default: "pending" },
    package_title: { type: String },
    duration: { type: Number, minValue: 1, maxValue: 12, required: true },
    category: {
        type: mongoose.Types.ObjectId,
        ref: "categories"
    },
    product_id: [{
        item: {
            type: mongoose.Types.ObjectId,
            ref: "products"
        },
        qty: { type: Number, default: 1 }
    }],
    user_id: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    payment_frequency: {
        type: String, required: true, default: "daily"
    },
    total: {
        type: String
    },
    daily: {
        type: String
    },
    weekly: {
        type: String
    },
    monthly: {
        type: String
    },
    balance: {
        type: String,
        default: 0
    },
    paid: {
        type: String,
        default: 0
    },
    numberOfExpectedPayments: {
        type: Number,
        default: 0
    },
    nextPayment: {
        type: String
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.__v;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const Packages = mongoose.model('packages', PackageSchema);

module.exports = Packages

