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
        type:String,
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
    addPoints: function (data, callback1) {
//    update user function
        //  var updateUser=function(data){
        //      console.log("aaaaaaaaaaaaaaaa",data.user._id)
        //       User.update({
        //         _id: data.user._id
        //     }, {
        //             $inc: {
        //                 points: data.betType.winPoints
        //             }
        //         }).exec(function (err, found1) {
        //             // console.log("FFFFFFFFFFFFFFFf", found1)
        //             if (err) {

        //             } else if (_.isEmpty(found1)) {

        //             } else {
        //                 // console.log("found*************", found1);

        //             }
        //         });
        //  }
        //  var updateUserParticipationPoints=function(data){
        //      console.log("aaaaaaaaaaaaaaaa",data.user._id)
        //       User.update({
        //         _id: data.user._id
        //     }, {
        //             $inc: {
        //                 points: data.betType.participationPoints
        //             }
        //         }).exec(function (err, found1) {
        //             // console.log("FFFFFFFFFFFFFFFf", found1)
        //             if (err) {

        //             } else if (_.isEmpty(found1)) {

        //             } else {
        //                 // console.log("found*************", found1);

        //             }
        //         });
        //  }


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
                    // console.log("FFFFFFFFFFFFFFFf", found1)
                    if (err) {

                    } else if (_.isEmpty(found1)) {

                    } else {
                        //     console.log("found*************", found1);

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
                // console.log("data", found);
                // callback1(null, found);
                // call async
                async.forEach(found, function (item, index, arr) {
                    //console.log("data", item);

                    // update points for tosswinner
                    if (item.betType.betName == 'tossWinner') {
                        if (item.match.tossWinner == item.answerTeam) {
                            update(item)
                            //updateUser(item)
                        } else {
                            updateParticipationPoints(item)
                           // updateUserParticipationPoints(item)
                        }
                    }
                    // update points for winner
                    if (item.betType.betName == 'Winner') {
                        if (item.match.winner == item.answerTeam) {
                            update(item)
                            // updateUser(item)
                        } else {
                            updateParticipationPoints(item)
                           // updateUserParticipationPoints(item)
                        }
                    }
                    // update points for IstInningScore
                    if (item.betType.betName == 'IstInningScore') {
                        console.log("---in 1st inning---")
                        if (item.match.firstInningScore == item.answer) {
                            console.log("---in if---")
                            update(item)
                            // updateUser(item)
                        } else if (Math.abs(item.match.firstInningScore - item.answer) <= 5) {
                            console.log("---in if else---", Math.abs(item.match.firstInningScore - item.answer))
                       
                        //    userbets update points
                        
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

                                 //    user update points

                            //        User.update({
                            //     _id: item.user._id
                            // }, {
                            //         $inc: {
                            //             points: 200
                            //         }
                            //     }).exec(function (err, found1) {
                            //         // console.log("FFFFFFFFFFFFFFFf", found1)
                            //         if (err) {

                            //         } else if (_.isEmpty(found1)) {

                            //         } else {
                            //             // console.log("found*************", found1);

                            //         }
                            //     });
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
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });

                                 //    user update points

                            //      User.update({
                            //     _id: item.user._id
                            // }, {
                            //         $inc: {
                            //             points: 100
                            //         }
                            //     }).exec(function (err, found1) {
                            //         // console.log("FFFFFFFFFFFFFFFf", found1)
                            //         if (err) {

                            //         } else if (_.isEmpty(found1)) {

                            //         } else {
                            //             // console.log("found*************", found1);

                            //         }
                            //     });
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
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });

                                 //    user update points

                            //        User.update({
                            //     _id: item.user._id
                            // }, {
                            //         $inc: {
                            //             points: 20
                            //         }
                            //     }).exec(function (err, found1) {
                            //         // console.log("FFFFFFFFFFFFFFFf", found1)
                            //         if (err) {

                            //         } else if (_.isEmpty(found1)) {

                            //         } else {
                            //             // console.log("found*************", found1);

                            //         }
                            //     });
                        }
                    }

//update points for player 

                    if (item.betType.betName == 'playerScore') {
                        console.log("---in 1st inning---")
                        if (item.match.playerScore == item.answer) {
                            console.log("---in if---")
                            update(item)
                           //  updateUser(item)
                        } else if (Math.abs(item.match.playerScore - item.answer) <= 5) {
                            console.log("---in if else---", Math.abs(item.match.playerScore - item.answer))
                           
                            //    userbets update points

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

                                 //    user update points

                            //            User.update({
                            //     _id: item.user._id
                            // }, {
                            //         $inc: {
                            //             points: 100
                            //         }
                            //     }).exec(function (err, found1) {
                            //         // console.log("FFFFFFFFFFFFFFFf", found1)
                            //         if (err) {

                            //         } else if (_.isEmpty(found1)) {

                            //         } else {
                            //             // console.log("found*************", found1);

                            //         }
                            //     });
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
                                    // console.log("FFFFFFFFFFFFFFFf", found1)
                                    if (err) {

                                    } else if (_.isEmpty(found1)) {

                                    } else {
                                        // console.log("found*************", found1);

                                    }
                                });

                                 //    user update points

                            //     User.update({
                            //     _id: item.user._id
                            // }, {
                            //         $inc: {
                            //             points: 20
                            //         }
                            //     }).exec(function (err, found1) {
                            //         // console.log("FFFFFFFFFFFFFFFf", found1)
                            //         if (err) {

                            //         } else if (_.isEmpty(found1)) {

                            //         } else {
                            //             // console.log("found*************", found1);

                            //         }
                            //     });
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
            // console.log("FFFFFFFFFFFFFFFf", found)
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataound", null);
            } else {
                console.log("found*************", found._id);

                // update uerbets points

                UserBets.find({
                    "betType": found._id
                }).deepPopulate('betType answerFinal').exec(function (err, found1) {
                    // console.log("FFFFFFFFFFFFFFFf", found)
                    if (err) {
                        callback1(err, null);
                    } else if (_.isEmpty(found1)) {
                        callback1("noDataound", null);
                    } else {
                        // console.log("found*************", found1);
                        async.forEach(found1, function (item, index, arr) {
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
                                        // console.log("FFFFFFFFFFFFFFFf", found1)
                                        if (err) {

                                        } else if (_.isEmpty(found1)) {

                                        } else {
                                            console.log("found*************", found1);

                                        }
                                    });

                                    // update user points

                                //       User.update({
                                //     _id: item.user._id
                                // }, {
                                //         $inc: {
                                //             points: item.betType.winPoints
                                //         }
                                //     }).exec(function (err, found1) {
                                //         // console.log("FFFFFFFFFFFFFFFf", found1)
                                //         if (err) {

                                //         } else if (_.isEmpty(found1)) {

                                //         } else {
                                //             console.log("found*************", found1);

                                //         }
                                //     });
                            }
                            else {
                                    partialPoints=5000-(item.answerFinal.rank*600);

                                     // update uerbets points

                                    UserBets.update({
                                    _id: item._id
                                }, {
                                        $inc: {
                                            pointsEarned: partialPoints
                                        }
                                    }).exec(function (err, found1) {
                                        // console.log("FFFFFFFFFFFFFFFf", found1)
                                        if (err) {

                                        } else if (_.isEmpty(found1)) {

                                        } else {
                                            console.log("found*************", found1);

                                        }
                                    });

                                    // update userPoints

                                //           User.update({
                                //     _id: item.user._id
                                // }, {
                                //         $inc: {
                                //             points: partialPoints
                                //         }
                                //     }).exec(function (err, found1) {
                                //         // console.log("FFFFFFFFFFFFFFFf", found1)
                                //         if (err) {

                                //         } else if (_.isEmpty(found1)) {

                                //         } else {
                                //             console.log("found*************", found1);

                                //         }
                                //     });
                            }
                        });
                    }
                });
            }
        })
    }


};
module.exports = _.assign(module.exports, exports, model);