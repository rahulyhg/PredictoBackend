module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    getBetType: function (req, res) {
        console.log(req.body);
        if (req.body) {
            BetType.getBetType(req.body, res.callback);
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