var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
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
    password: {
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
            password: password
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

    // for sending otp
    sendOtp: function (mobile, userId, callback) {
        console.log("inside send otp", mobile, userId);
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
                // callback(null, found);
                var smsMessage = "Use " + emailOtp + " as your login OTP. OTP is confidential.";
                var smsObj = {
                    "message": "kwack",
                    "sender": "Kwackk",
                    "sms": [{
                        "to": mobile,
                        "message": smsMessage,
                        "sender": "Kwackk"
                    }]
                };
                console.log("Data for sms send is---------------->>>>>>>>>", smsObj);
                Config.sendSMS(smsObj, function (error, SMSResponse) {
                    console.log(" SMS Response is----------------->>>>>>>>>>>", SMSResponse);
                    if (error || SMSResponse == undefined) {
                        console.log("User >>> generateOtp >>> User.findOne >>> Config.sendSMS >>> error >>>", error);
                        callback(error, null);
                    } else if (SMSResponse == "INV-NUMBER") {
                        callback(null, "INV-NUMBER");
                    } else if (SMSResponse == "sms-sent") {
                        callback(null, "sms-sent");
                    }
                });

            }

        });
    },
    // verify otp
    verifyOTPForResetPass: function (otp, _id, callback) {
        console.log("*********************", otp);
        User.findOne({
            otp: otp
        }).exec(function (err, found) {
            if (err) {
                callback(err, null);
            } else if (_.isEmpty(found)) {
                callback("noDatafound", null);
            } else {

                dataToSave = {};
                dataToSave.otp = '';
                dataToSave._id = found._id;
                console.log("************************", dataToSave);
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
    VerifyUser: function (userEmail, password, callback) {
        async.waterfall([
            function (callback1) {
                console.log("inside 1st waterfall model");
                User.findOne({
                    email: userEmail,
                    password: password
                }).exec(function (err, found) {
                    if (err) {
                        callback1(err, null);
                    } else if (_.isEmpty(found)) {
                        callback1("noDataound", null);
                    } else {

                        callback1(null, found);
                    }

                });
            },
            function (data, callback2) {
                console.log("inside 2nd waterfall model");

                User.findOne({
                    email: data.email,
                    password: data.password,
                    status: "Active"
                }).exec(function (err, found) {
                    if (err) {
                        callback2(err, null);
                    } else if (_.isEmpty(found)) {
                        callback2("DeactiveAcc", null);
                    } else {

                        callback2(null, found);

                    }

                });

            },

        ], function (err, data) {
            console.log("final data for callback is", data);
            if (err || _.isEmpty(data)) {
                callback(err, []);
            } else {
                callback(null, data);
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
                data.save(function () {});
                callback(err, data);
            }
        });
    },
    saveUser: function (name, email, userName, mobile, password, _id, callback) {
        console.log("***1111", name, email, userName, mobile, password);
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            password = hash;

            console.log("---------****************-------------", password);
            var dataToSave = {};
            dataToSave.name = name;
            dataToSave.email = email;
            dataToSave.userName = userName;
            dataToSave.mobile = mobile;
            dataToSave.password = password;

            if (_id) {
                dataToSave._id = _id;
            }

            async.waterfall([
                function (callback1) {
                    User.find({
                        email: email,
                        _id: _id ? {
                            $ne: ObjectId(_id)
                        } : {
                            $exists: true
                        }
                    }).exec(function (err, found) {
                        if (err) {
                            console.log("*******err", err);
                            callback1(err, null);
                        } else if (_.isEmpty(found)) {
                            console.log("1111111111111111111111", dataToSave);
                            callback1(null, dataToSave);

                        } else {
                            callback1("emailExist", null);

                        }

                    });
                },
                function (datain, callback2) {
                    User.find({
                        mobile: mobile.toString(),
                        _id: _id ? {
                            $ne: ObjectId(_id)
                        } : {
                            $exists: true
                        }
                    }).exec(function (err, found) {
                        if (err) {
                            console.log("*******err", err);
                            callback2(err, null);
                        } else if (_.isEmpty(found)) {
                            console.log("222222222222222222222222", dataToSave);
                            callback2(null, dataToSave);

                        } else {
                            callback2("mobileExist", null);

                        }

                    });
                },
                function (datain, callback3) {
                    console.log("Inside 3rd waterfall model33333333333333333333333333");
                    User.saveData(dataToSave, function (err, created) {
                        if (err) {
                            callback3(err, null);
                        } else if (_.isEmpty(created)) {
                            callback3(null, "noDataound");
                        } else {
                            if (!_id) {
                                callback3(null, created);
                            } else {
                                callback3(null, dataToSave);
                            }
                        }
                    });
                },
            ], function (err, data) {
                console.log("final data for callback is", data);
                if (err || _.isEmpty(data)) {
                    callback(err, []);
                } else {
                    callback(null, data);
                }
            });
        });

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
            data.save(function () {});
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
                callback1("noDataound", null);
            } else {
                console.log("found*************", found);
                callback1(null, found);
            }
        });
    }
};
module.exports = _.assign(module.exports, exports, model);