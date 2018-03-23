var schema = new Schema({
    teamName: {
        type: String,
        required: true,
        unique: true
    },
    poster: {
        type: String

    },
    shortName: {
        type: String,
        required: true
    }
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Team', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    teamList: function (data, callback1) {
        Team.find().paginate(1, 4).exec(function (err, found) {
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