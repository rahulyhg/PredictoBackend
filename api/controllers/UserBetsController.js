module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getUserBets: function (req, res) {
        console.log(req.body)
        if (req.body) {
            UserBets.getUserBets(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
   
addPoints: function (req, res) {
        console.log(req.body)
        if (req.body) {
            UserBets.addPoints(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    tournamentWinner: function (req, res) {
        console.log(req.body)
        if (req.body) {
            UserBets.tournamentWinner(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    userPoints: function (req, res) {
        if (req.body) {
            UserBets.userPoints(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    }


};
module.exports = _.assign(module.exports, controller);