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
    answerFinal: {
        type: Schema.Types.ObjectId,
        ref: 'Team',
        index: true
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
    },
    'answerFinal': {
        select: ''
    }

});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('UserBets', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user match betType answerFinal", "user match betType answerFinal", "order", "asc"));
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

    // add points in userbets

    addPoints: function (data, callback1) {

        //    update userbets function
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

                    if (err) {

                    } else if (_.isEmpty(found1)) {

                    } else {


                    }
                });
        }


        // find userbets by match id
        UserBets.find({
            match: data._id
        }).deepPopulate('match betType user').exec(function (err, found) {
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                console.log("data", found);
                async.each(found, function (item, arr) {

                    if (item.betType.betName == 'tossWinner') {
                        if (item.match.tossWinner == item.answerTeam) {
                            update(item)
                        } else {
                            updateParticipationPoints(item)
                        }
                    }
                    // update points for winner
                    if (item.betType.betName == 'Winner') {
                        if (item.match.winner == item.answerTeam) {
                            update(item)
                        } else {
                            updateParticipationPoints(item)
                        }
                    }
                    // update points for IstInningScore
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
                                    if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")
                                        }
                                });

                        }
                        else if (Math.abs(item.match.firstInningScore - item.answer) <= 20) {
                            console.log("---in if else---", Math.abs(item.match.firstInningScore - item.answer))

                            //    userbets update points

                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 100
                                    }
                                }).exec(function (err, found1) {

                                     if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")
                                        }
                                });

                        }
                        else {
                            console.log("---in else---")

                            //    userbets update points

                            UserBets.update({
                                _id: item._id
                            }, {
                                    $inc: {
                                        pointsEarned: 20
                                    }
                                }).exec(function (err, found1) {

                                    if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")
                                        }
                                });

                        }
                    }

                    //update points for player 

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

                                    if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")

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

                                     if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")


                                    }
                                });
                        }
                    }

                });

            }

            callback1(null, "points updated successfully");
        });
    },



    tournamentWinner: function (data, callback1) {
        BetType.findOne({
            betName: 'tournamentWinner'
        }).exec(function (err, found) {

            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                callback1("null",found)

                // update uerbets points

                UserBets.find({
                    "betType": found._id
                }).deepPopulate('betType answerFinal').exec(function (err, found1) {

                    if (err) {
                        callback1(err, null);
                    } else if (_.isEmpty(found1)) {
                        callback1("noDataound", null);
                    } else {

                        async.each(found1, function (item, arr) {
                            console.log("found*************", item);
                            if (item.answerFinal.rank == 1) {
                                console.log("******in if*******");
                                UserBets.update({
                                    _id: item._id
                                }, {
                                        $inc: {
                                            pointsEarned: item.betType.winPoints
                                        }
                                    }).exec(function (err, found1) {

                                        if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("nodatafound",null)
                                        } else {
                                            arr(null,"data updated")

                                        }
                                    });
                            }
                            else {
                                partialPoints = 5000 - (item.answerFinal.rank * 600);

                                // update uerbets points

                                UserBets.update({
                                    _id: item._id
                                }, {
                                        $inc: {
                                            pointsEarned: partialPoints
                                        }
                                    }).exec(function (err, found1) {

                                        if (err) {
                                            arr(err,null)
                                        } else if (_.isEmpty(found1)) {
                                            arr("noDataFound",null)
                                        } else {
                                            (err,"points updated ")

                                        }
                                    });
                            }
                        });
                    }
                });
            }
        })
    },


    userPoints: function (data, callback1) {
        UserBets.aggregate(
            {
                $group: {
                    _id: "$user",
                    "sum": { "$sum": "$pointsEarned" }
                }
            })
            .exec(function (err, found1) {
                if (err) {
                    callback1(err, null);
                } else if (_.isEmpty(found1)) {
                    callback1("noDataFound", null);
                } else {
                    console.log("found*************", found1);
                    callback1(null, found1)
                    async.each(found1, function (item, cb) {
                        console.log("item", item);
                        User.findOneAndUpdate({ _id: item._id }, {
                            $inc: {
                                points: item.sum
                            }
                        }).exec(function (err, result) {
                            if (err) {
                                cb(err, null);
                            }
                            else if (_.isEmpty(result)) {
                                cb("noDataFound", null);
                            }
                            else {
                                console.log("*************", result);
                                cb(null, result)
                            }
                        })
                    })
                }
            })
    }


};
module.exports = _.assign(module.exports, exports, model);