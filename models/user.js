const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true, trim: true },
    password: { type: String, minlength: 8, trim: true, required: true },
    phone: { type: String, minlength: 10, maxlength: 11 },
    referrals: [{
        type: mongoose.Types.ObjectId,
        ref: "users"
    }],
    referalLink: {
        type: mongoose.Types.ObjectId,
        ref: "users"
    },
    order: { type: Number, default: 0 },
    status: { type: String, default: "inactive" },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
        },
    },
    timestamps: true
});

const User = mongoose.model('users', UserSchema);

module.exports = User;