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
    },
    answerTeam: {
        type: String,
        enum: ['team1', 'team2', 'draw']
    },
    pointsEarned: {
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
    addPoints: function (data, callback1) {
        var update = function (data) {
            UserBets.update({
                _id: data._id
            }, {
                    $inc: {
                        pointsEarned: data.betType.winPoints
                    }
                }).exec(function (err, found1) {
                    // console.log("FFFFFFFFFFFFFFFf", found1)
                    if (err) {

                    } else if (_.isEmpty(found1)) {

                    } else {
                        // console.log("found*************", found1);

                    }
                });
        }
        var updateParticipationPoints = function (data) {

            UserBets.update({
                _id: data._id
            }, {
                    $inc: {
                        pointsEarned: data.betType.participationPoints
                    }
                }).exec(function (err, found1) {
                    // console.log("FFFFFFFFFFFFFFFf", found1)
                    if (err) {

                    } else if (_.isEmpty(found1)) {

                    } else {
                        //     console.log("found*************", found1);

                    }
                });
        }
        UserBets.find({
            match: data._id
        }).deepPopulate('match betType user').exec(function (err, found) {
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                // console.log("data", found);
                // callback1(null, found);
                async.forEach(found, function (item, index, arr) {
                    //console.log("data", item);
                    if (item.betType.betName == 'tossWinner') {
                        if (item.match.tossWinner == item.answerTeam) {
                            update(item)
                        } else {
                            updateParticipationPoints(item)
                        }
                    }
                    if (item.betType.betName == 'Winner') {
                        if (item.match.winner == item.answerTeam) {
                            update(item)
                        } else {
                            updateParticipationPoints(item)
                        }
                    }

                    if (item.betType.betName == 'IstInningScore') {
                        console.log("---in 1st inning---")
                        if (item.match.firstInningScore == item.answer) {
                            console.log("---in if---")
                            update(item)
                        } else if (Math.abs(item.match.firstInningScore - item.answer) <= 5) {
                            console.log("---in if else---", Math.abs(item.match.firstInningScore - item.answer))
                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 200
                                    }
                                }).exec(function (err, found1) {
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });
                        }
                        else if (Math.abs(item.match.firstInningScore - item.answer) <= 20) {
                            console.log("---in if else---", Math.abs(item.match.firstInningScore - item.answer))
                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 100
                                    }
                                }).exec(function (err, found1) {
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });
                        }
                        else {
                            console.log("---in else---")
                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 20
                                    }
                                }).exec(function (err, found1) {
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });
                        }
                    }

                    if (item.betType.betName == 'playerScore') {
                        console.log("---in 1st inning---")
                        if (item.match.playerScore == item.answer) {
                            console.log("---in if---")
                            update(item)
                        } else if (Math.abs(item.match.playerScore - item.answer) <= 5) {
                            console.log("---in if else---", Math.abs(item.match.playerScore - item.answer))
                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 100
                                    }
                                }).exec(function (err, found1) {
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });
                        }

                        else {
                            console.log("---in else---")
                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 20
                                    }
                                }).exec(function (err, found1) {
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });
                        }
                    }
                });

            }

            callback1(null, "points updated successfully");
        });




    },
    tournamentWinner:function(data,callback1){
        UserBets.find({
            betType:'tournamentWinner'
        }).exec(function (err, found) {
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
    }


};
module.exports = _.assign(module.exports, exports, model);