var schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: validators.isEmail(),
        excel: "User Email",
        unique: true
    },
    dob: {
        type: Date,
        excel: {
            name: "Birthday",
            modify: function (val, data) {
                return moment(val).format("MMM DD YYYY");
            }
        }
    },
    photo: {
        type: String,
        default: "",
        excel: [{
            name: "Photo Val"
        }, {
            name: "Photo String",
            modify: function (val, data) {
                return "http://abc/" + val;
            }
        }, {
            name: "Photo Kebab",
            modify: function (val, data) {
                return data.name + " " + moment(data.dob).format("MMM DD YYYY");
            }
        }]
    },
    socailLoginPhoto: {
        type: String,
        default: "",
        excel: [{
            name: "Photo Val"
        }, {
            name: "Photo String",
            modify: function (val, data) {
                return "http://abc/" + val;
            }
        }, {
            name: "Photo Kebab",
            modify: function (val, data) {
                return data.name + " " + moment(data.dob).format("MMM DD YYYY");
            }
        }]
    },
    password: {
        type: String,
        default: ""
    },
    confirmPassword: {
        type: String,
        default: ""
    },
    forgotPassword: {
        type: String,
        default: ""
    },
    mobile: {
        type: String,
        default: ""
    },
    otp: {
        type: String,
        default: ""
    },
    points: {
        type: Number,
        default: ""
    },

    accessToken: {
        type: [String],
        index: true
    },
    googleAccessToken: String,
    googleRefreshToken: String,
    oauthLogin: {
        type: [{
            socialId: String,
            socialProvider: String
        }],
        index: true
    },
    accessLevel: {
        type: String,
        default: "User",
        enum: ['User', 'Admin']
    }
});

schema.plugin(deepPopulate, {
    populate: {
        'user': {
            select: 'name _id'
        }
    }
});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);

module.exports = mongoose.model('User', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema, "user", "user"));
var model = {
    // for change the password
    saveNewPassword: function (password, mobile, callback) {
        User.findOneAndUpdate({
            mobile: mobile
        }, {
                password: md5(password)
            }, {
                new: true
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback(null, "noDataound");
                } else {
                    User.find({
                        mobile: mobile
                    }).exec(function (err, created) {
                        if (err) {
                            callback(err, null);
                        } else if (_.isEmpty(created)) {
                            callback("noDataound", null);
                        } else {
                            callback(null, created);
                        }
                    });
                }

            });
    },

    getUserforSocailLogin: function (screenName, callback) {
        // console.log("***************",userEmail)
        User.findOne({
            screenName: screenName,
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("noDataound", null);
            } else {
                callback(null, found);
            }
        });
    },
    getUserforSocailLoginFacebook: function (email, callback) {
        // console.log("***************",userEmail)
        User.findOne({
            email: email,
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("noDataound", null);
            } else {
                callback(null, found);
            }
        });
    },
    getUser: function (userEmail, callback) {
        // console.log("***************",userEmail)
        User.findOne({
            email: userEmail
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("noDataound", null);
            } else {
                callback(null, found);
            }
        });
    },
    doLogin: function (data, callback) {
        // console.log(md5(data.password));
        User.findOne({
            mobile: data.mobile,
            password: md5(data.password)

        }).exec(function (err, found) {
            if (err) {

                callback(err, null);
            } else {
                if (found) {
                    var foundObj = found.toObject();
                    delete foundObj.password;
                    callback(null, foundObj);

                } else {
                    callback({
                        message: "Incorrect Credentials!"
                    }, null);
                }
            }

        });
    },
    add: function () {
        var sum = 0;
        _.each(arguments, function (arg) {
            sum += arg;
        });
        return sum;
    },
    existsSocial: function (user, callback) {
        var Model = this;
        Model.findOne({
            "oauthLogin.socialId": user.id,
            "oauthLogin.socialProvider": user.provider,
        }).exec(function (err, data) {
            if (err) {

                console.log(err);
                callback(err, data);
            } else if (_.isEmpty(data)) {
                var modelUser = {
                    name: user.displayName,
                    accessToken: [uid(16)],
                    oauthLogin: [{
                        socialId: user.id,
                        socialProvider: user.provider,
                    }]
                };
                if (user.emails && user.emails.length > 0) {
                    modelUser.email = user.emails[0].value;
                    var envEmailIndex = _.indexOf(env.emails, modelUser.email);
                    if (envEmailIndex >= 0) {
                        modelUser.accessLevel = "Admin";
                    }
                }
                modelUser.googleAccessToken = user.googleAccessToken;
                modelUser.googleRefreshToken = user.googleRefreshToken;
                if (user.image && user.image.url) {
                    modelUser.photo = user.image.url;
                }
                Model.saveData(modelUser, function (err, data2) {
                    if (err) {
                        callback(err, data2);
                    } else {
                        data3 = data2.toObject();
                        delete data3.oauthLogin;
                        delete data3.password;
                        delete data3.forgotPassword;
                        delete data3.otp;
                        callback(err, data3);
                    }
                });
            } else {
                delete data.oauthLogin;
                delete data.password;
                delete data.forgotPassword;
                delete data.otp;
                data.googleAccessToken = user.googleAccessToken;
                data.save(function () { });
                callback(err, data);
            }
        });
    },
    registerUser: function (data, callback) {
        var user = this(data);
        user.accessToken = [uid(16)];
        user.password = md5(user.password);
        // if (user.drone) {
        //     user.lisence = "NDB";
        // } else {
        //     user.lisence = "UDB";
        // }
        user.confirmPassword = md5(user.confirmPassword);;
        if (user.password == user.confirmPassword) {
            user.save(function (err, created) {
                if (err) {
                    callback(err, null);
                } else if (created) {
                    callback(null, created);
                } else {
                    callback(null, {});
                }
            });
        } else {
            callback("password not matched");
        }
    },
    profile: function (data, callback, getGoogle) {
        var str = "name email photo mobile accessLevel";
        if (getGoogle) {
            str += " googleAccessToken googleRefreshToken";
        }
        User.findOne({
            accessToken: data.accessToken
        }, str).exec(function (err, data) {
            if (err) {
                callback(err);
            } else if (data) {
                callback(null, data);
            } else {
                callback("No Data Found", data);
            }
        });
    },
    updateAccessToken: function (id, accessToken) {
        User.findOne({
            "_id": id
        }).exec(function (err, data) {
            data.googleAccessToken = accessToken;
            data.save(function () { });
        });
    },
    /**
     * This function get all the media from the id.
     * @param {userId} data
     * @param {callback} callback
     * @returns  that number, plus one.
     */
    getAllMedia: function (data, callback) {

    },
    leaderBoard: function (data, callback1) {
        User.find().sort('-points').exec(function (err, found) {
            // console.log("FFFFFFFFFFFFFFFf", found)
            if (err) {
                callback1(err, null);
            } else if (_.isEmpty(found)) {
                callback1("noDataFound", null);
            } else {
                console.log("found*************", found);
                callback1(null, found);
            }
        });
    },
    editUser: function (data, callback1) {
        User.findOneAndUpdate({
            "_id": data.id
        }, {
                name: data.userName,
                dob: data.dob,
                email: data.userEmail,
                points: data.points
            }, {
                multi: true
            }).exec(function (err, found) {
                if (err) {
                    callback1(err, null);
                } else if (_.isEmpty(found)) {
                    callback1("noDataFound", null);
                } else {
                    console.log("-----------", found)
                    callback1(null, "Data updated Successfully");
                }
            });
    },

    sendOtp: function (mobile, userId, callback) {
        console.log("inside send otp", mobile, userId)
        var emailOtp = (Math.random() + "").substring(2, 6);
        var foundData = {};
        User.findOneAndUpdate({
            // _id: userId,
            mobile: mobile
        }, {
                otp: emailOtp
            }).exec(function (err, found) {
                if (err) {
                    callback(err, null);
                } else if (_.isEmpty(found)) {
                    callback("noDataound", null);
                } else {
                    callback(null, found);


                }

            });
    },
    verifyOTPForResetPass: function (otp, _id, callback) {
        console.log("*********************", otp)
        User.findOne({
            otp: otp
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("noDatafound", null);
            } else {

                dataToSave = {}
                dataToSave.otp = ''
                dataToSave._id = found._id
                console.log("************************", dataToSave)
                User.saveData(dataToSave, function (err, created) {
                    if (err) {
                        callback(err, null);
                    } else if (_.isEmpty(created)) {
                        callback(null, "noDatafound");
                    } else {
                        callback(null, found);
                    }
                });
            }
        });
    },


};
module.exports = _.assign(module.exports, exports, model);