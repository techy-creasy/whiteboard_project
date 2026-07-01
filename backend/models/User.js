const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: validator.isEmail,
                message: 'Please provide a valid email address',
            },
        },
        password: {
            // This is always a bcrypt HASH, never the plain text password.
            type: String,
            required: [true, 'Password is required'],
            minlength: 8,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

module.exports = User;
