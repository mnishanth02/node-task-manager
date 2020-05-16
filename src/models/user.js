const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const task = require('./task');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email i snot valid")
            }

        }
    },
    password: {
        type: String,
        requried: true,
        minlength: 7,
        validate(value) {
            if (value.includes("password")) {
                throw new Error("Password cannot contain Password.")
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be positive number")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
}, {
    timestamps: true,
    
})

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'author'
})
userSchema.methods.toJSON = function () {
    const user = this;
    const userObj = user.toObject()
    delete userObj.password;
    delete userObj.tokens;
    return userObj;
}

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    console.log(user)
    const token = jwt.sign({ _id: user._id.toString() }, 'mySecretPassword');
    user.tokens = user.tokens.concat({ token })

    await user.save()
    return token;


}


userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email });

    if (!user) {
        throw new Error("Unable to Login")
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Unable to Login")
    }
    return user;
}
// hash the plain password before save
userSchema.pre('save', async function (next) {
    const user = this;
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

userSchema.pre('remove', async function (next) {
    const user = this
    await task.deleteMany({ author: user._id })

    next();
})

const User = mongoose.model('User', userSchema);

module.exports = User;