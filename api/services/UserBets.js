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
var model = {
    getUserBets: function (data, callback1) {
        UserBets.find({
            user: data.id
        }).deepPopulate('user').exec(function (err, found) {
            // console.log("FFFFFFFFFFFFFFFf", found)
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                console.log("found*************", found);
                callback1(null, found);
            }
        });
    },
    updatePoints: function (data, callback1) {
        UserBets.find({
            match: data.id
        }).deepPopulate('match betType user').exec(function (err, found) {
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                //console.log("data", found);
                //callback1(null, found);
                async.forEach(found, function (item, index, arr) {
                    if (item.betType.betName == 'Toss Winner' && ((item.match.tossWinner == '2' && item.answer == 2) || (item.match.tossWinner == '1' && item.answer == 1))) {
                        User.update({
                            _id: item.user._id
                        }, {
                            $inc: {
                                points: item.betType.winPoints
                            }
                        }).exec(function (err, found1) {
                            // console.log("FFFFFFFFFFFFFFFf", found)
                            if (err) {
                                callback1(err, null);
                            } else if (_.isEmpty(found1)) {
                                callback1("noDataound", null);
                            } else {
                                console.log("found*************", found1);
                                //callback1(null, found1);
                            }
                        });
                    }
                    if (item.betType.betName == 'Winner' && ((item.match.winner == 'team1' && item.answer == 1) || (item.match.winner == 'team2' && item.answer == 2) || ((item.match.winner == 'tie' && item.answer == 3)))) {
                        User.update({
                            _id: item.user._id
                        }, {
                            $inc: {
                                points: item.betType.winPoints
                            }
                        }).exec(function (err, found1) {
                            // console.log("FFFFFFFFFFFFFFFf", found)
                            if (err) {
                                callback1(err, null);
                            } else if (_.isEmpty(found1)) {
                                callback1("noDataound", null);
                            } else {
                                console.log("found*************", found1);
                                //callback1(null, found1);
                            }
                        });
                    }

                });

            }

            callback1(null, "points updated successfully");
        });

    },
    updateParticipatePoints: function (data, callback1) {
        UserBets.find({
            match: data.id
        }).deepPopulate('match betType user').exec(function (err, found) {
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                async.forEach(found, function (item, index, arr) {
                    User.update({
                        _id: item.user._id
                    }, {
                        $inc: {
                            points: item.betType.participationPoints
                        }
                    }).exec(function (err, found1) {
                        // console.log("FFFFFFFFFFFFFFFf", found)
                        if (err) {
                            callback1(err, null);
                        } else if (_.isEmpty(found1)) {
                            callback1("noDataound", null);
                        } else {
                            console.log("found*************", found1);
                        }
                    });

                });
                callback1(null, "points updated successfully");
            }
        });

    }

};
module.exports = _.assign(module.exports, exports, model);