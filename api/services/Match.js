var schema = new Schema({
    matchNumber: {
        type: Number
    },
    team1: {

        type: Schema.Types.ObjectId,
        ref: 'Team',
        index: true

    },
    team2: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        index: true
    },
    startingTime: {
        type: Date
    },
    winner: {
        type: String,
        enum: ['team1', 'team2', 'tie']
    },
    tossWinner: {
        type: Number
    },
    firstInningScore: {
        type: Number
    },
    player: {
        type: String
    },
    playerScore: {
        type: Number
    }
});
schema.plugin(deepPopulate, {
    'team1': {
        select: ''
    },
    'team2': {
        select: ''
    }

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Match', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "team1 team2", "team1 team2", "order", "asc"));
var model = {};
module.exports = _.assign(module.exports, exports, model);