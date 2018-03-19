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
        }).deepPopulate('match betType user').exec(function (err, found1) {
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found1)) {
                callback1("noDataound", null);
            } else {
                // if (found1[0].match.tossWinner == 2) {
                //     console.log("in if");
                //     console.log("found*************", found1[0]);
                //     callback1(null, found1[0]);
                //     if (found1[0].betType.betName == '1st inning score' && found1[0].answer == 2) {

                //     }
                // }
                async.forEach(found1, function (item, index, arr) {
                    console.log("data", item, index, arr);
                    if (item.match.tossWinner == '1') {

                    } else if (item.match.tossWinner == '2') {
                        console.log("points=", item.user.points);
                        User.aggregate().project({

                            "updatedpoints": {
                                points: {
                                    $add: item.betType.winPoints
                                }
                            }

                        }).exec(function (err, found) {
                            // console.log("FFFFFFFFFFFFFFFf", found)
                            if (err) {
                                callback1(err, null);
                            } else if (_.isEmpty(found)) {
                                callback1("noDataound", null);
                            } else {
                                console.log("found*************", found);
                                User.findOneAndUpdate({
                                    _id: item.user._id
                                }, {
                                    $set: {
                                        points: updatedpoints
                                    }
                                })
                            }
                        });
                    }

                });

            }
        });


    }
}
module.exports = _.assign(module.exports, exports, model);