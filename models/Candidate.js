const mongose = require('mongoose');

const CandidateSchema = new mongose.Schema({
    name:{
        type: String,
        required: true
    },
    age:{
        type: Number,
        required: true
    },
    party:{
        type: String,
        required: true
    },
    votes:[
        {
            user:{
                type: mongose.Schema.Types.ObjectId,
                ref: 'User',
                required: true    
            },
            votedAt:{
                type: Date,
                default: Date.now
            }
        }
    ],
    voteCount:{
        type: Number,
        default: 0
    }
});

module.exports = mongose.model('Candidate', CandidateSchema);