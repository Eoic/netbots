const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const UserSchema = new Schema({
    username: {
        type: mongoose.Schema.Types.String,
        required: true
    }, 
    password: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    resetPasswordToken: {
        type: mongoose.Schema.Types.String,
        required: false
    },
    resetPasswordTokenExpires: {
        type: mongoose.Schema.Types.Date,
        required: false
    },
    email: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    isAdmin: {
        type: mongoose.Schema.Types.Boolean,
        default: false,
        required: false
    },  
    identiconHash: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    scripts: [{
        name: mongoose.Schema.Types.String,
        code: mongoose.Schema.Types.String
    }],
    statistic: {
        gamesPlayed: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },
        gamesWon: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },
        gameTime: {
            type: mongoose.Schema.Types.Number,
            default: 0
        },
        experience: {
            type: mongoose.Schema.Types.Number,
            default: 4
        }
    },
    achievements: [{
        key: mongoose.Schema.Types.String,
        unlockedAt: mongoose.Schema.Types.Date
    }],
    multiplayerScript: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        required: false
    }
}, {
    timestamps: true
});

/**
 * Hash password before saving to DB
 */
UserSchema.pre('save', function (next) {
    const user = this;
    console.log('Called pre-save.')
    return bcrypt.hash(user.password, SALT_ROUNDS).then(hash => {
        user.password = hash;
        next();
    }).catch(err => next(err));
});

/**
 * Compare password with one stored in the database
 */
UserSchema.methods.comparePasswords = function (password, callback) {
    const user = this;
    bcrypt.compare(password, user.password, callback);
}

let User = mongoose.model('user', UserSchema);
module.exports = User;