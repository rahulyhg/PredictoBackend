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
var model = {};
module.exports = _.assign(module.exports, exports, model);