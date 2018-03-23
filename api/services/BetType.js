var schema = new Schema({
    betName: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    participationPoints: {
        type: Number
    },
    winPoints: {
        type: Number
    },
    options: [{
        type: Number,
        enum: []
    }]
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('BetType', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    getBetType: function (data, callback1) {
        BetType.find().exec(function (err, found) {
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