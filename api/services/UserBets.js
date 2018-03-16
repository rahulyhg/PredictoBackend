var schema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        index: true
    },
    betType: {
        type: Schema.Types.ObjectId,
        ref: 'BetType',
        index: true
    },
    status: {
        type: String,
        enum: ['betMade', 'betLocked', 'betWon', 'betLost']

    },
    answer: {
        type: Number
    }
});

schema.plugin(deepPopulate, {
    'user': {
        select: ''
    },
    'match': {
        select: ''
    },
    'betType': {
        select: ''
    }

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('UserBets', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user match betType", "user match betType", "order", "asc"));
var model = {};
module.exports = _.assign(module.exports, exports, model);