const mongoose = require('mongoose');
const voteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    pollId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Poll',
        required: true,
    },
    optionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Option',
        required: true,
    }
},
    {
        timestamps: true
    }
);
voteSchema.index({ userId: 1, pollId: 1 }, { unique: true })
const vote = mongoose.model('Vote', voteSchema);
module.exports = vote;