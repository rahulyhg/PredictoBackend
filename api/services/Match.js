var schema = new Schema({
    matchNumber: {
        type: Number,
        unique: true
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
        type: String,
        enum: ['team1', 'team2', 'draw']
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
var model = {
    allMatches: function (data, callback1) {
        var today = new Date();
        today.setDate(today.getDate());
        console.log(today)
        Match.find({
            startingTime: {
                $gte: today
            }
        }).deepPopulate('team1 team2').sort('startingTime').exec(function (err, found) {
            // console.log("FFFFFFFFFFFFFFFf", found)
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                //console.log("found*************", found);
                callback1(null, found);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);