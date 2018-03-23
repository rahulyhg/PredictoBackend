module.exports = _.cloneDeep(require("sails-wohlig-controller"));
var controller = {
    index: function (req, res) {
        res.json({
            name: "Hello World"
        });
    },
    loginFacebook: function (req, res) {
        passport.authenticate('facebook', {
            scope: ['public_profile', 'user_friends', 'email'],
            failureRedirect: '/'
        }, res.socialLogin)(req, res);
    },

    loginGoogle: function (req, res) {
        if (req.query.returnUrl) {
            req.session.returnUrl = req.query.returnUrl;
        } else {

        }

        passport.authenticate('google', {
            scope: ['openid', 'profile', 'email'],
            failureRedirect: '/'
        }, res.socialLogin)(req, res);
    },
    profile: function (req, res) {
        if (req.body && req.body.accessToken) {
            User.profile(req.body, res.callback);
        } else {
            res.callback("Please provide Valid AccessToken", null);
        }
    },
    pdf: function (req, res) {

        var html = fs.readFileSync('./views/pdf/demo.ejs', 'utf8');
        var options = {
            format: 'A4'
        };
        var id = mongoose.Types.ObjectId();
        var newFilename = id + ".pdf";
        var writestream = gfs.createWriteStream({
            filename: newFilename
        });
        writestream.on('finish', function () {
            res.callback(null, {
                name: newFilename
            });
        });
        pdf.create(html).toStream(function (err, stream) {
            stream.pipe(writestream);
        });
    },
    backupDatabase: function (req, res) {
        res.connection.setTimeout(200000000);
        req.connection.setTimeout(200000000);
        var q = req.host.search("127.0.0.1");
        if (q >= 0) {
            _.times(20, function (n) {
                var name = moment().subtract(5 + n, "days").format("ddd-Do-MMM-YYYY");
                exec("cd backup && rm -rf " + name + "*", function (err, stdout, stderr) {});
            });
            var jagz = _.map(mongoose.models, function (Model, key) {
                var name = Model.collection.collectionName;
                return {
                    key: key,
                    name: name,
                };
            });
            res.json("Files deleted and new has to be created.");
            jagz.push({
                "key": "fs.chunks",
                "name": "fs.chunks"
            }, {
                "key": "fs.files",
                "name": "fs.files"
            });
            var isBackup = fs.existsSync("./backup");
            if (!isBackup) {
                fs.mkdirSync("./backup");
            }
            var mom = moment();
            var folderName = "./backup/" + mom.format("ddd-Do-MMM-YYYY-HH-mm-SSSSS");
            var retVal = [];
            fs.mkdirSync(folderName);
            async.eachSeries(jagz, function (obj, callback) {
                exec("mongoexport --db " + database + " --collection " + obj.name + " --out " + folderName + "/" + obj.name + ".json", function (data1, data2, data3) {
                    retVal.push(data3 + " VALUES OF " + obj.name + " MODEL NAME " + obj.key);
                    callback();
                });
            }, function () {
                // res.json(retVal);
            });
        } else {
            res.callback("Access Denied for Database Backup");
        }
    },
    getAllMedia: function (req, res) {
        Media.getAllMedia(req.body, res.callback);
    },
    sendmail: function (req, res) {
        Config.sendEmail("chintan@wohlig.com", "jagruti@wohlig.com", "first email from endgrid", "", "<html><body>dome content</body></html>");
    },
    saveNewPassword: function (req, res) {
        if (req.body) {
            User.saveNewPassword(req.body.password, req.body.mobile, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    getUser: function (req, res) {
        if (req.body) {
            User.getUser(req.body.userEmail, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    login: function (req, res) {
        if (req.body && req.body.mobile && req.body.mobile !== '' && req.body.password && req.body.password !== '') {
            User.doLogin(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    registerUser: function (req, res) {
        function callback(err, data) {

            if (data) {
                res.json({
                    value: true,
                    data: {
                        message: "Registration Successful!"
                    }
                });
            } else {
                res.json({
                    value: false,
                    data: {
                        message: "Registration Failed!"
                    }
                });
            }
        }
        if (req.body) {
            User.registerUser(req.body, callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },

    getUserforSocailLogin: function (req, res) {
        if (req.body) {
            console.log("is ide ctrl");
            User.getUserforSocailLogin(req.body.screenName, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    getUserforSocailLoginFacebook: function (req, res) {
        if (req.body) {
            console.log("is ide ctrl");
            User.getUserforSocailLoginFacebook(req.body.email, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },

    leaderBoard: function (req, res) {
        if (req.body) {
            User.leaderBoard(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    editUser: function (req, res) {
        if (req.body) {
            User.editUser(req.body, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            });
        }
    },
    sendOtp: function (req, res) {
        if (req.body) {
            User.sendOtp(req.body.mobile,req.body.userId, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    }, verifyOTPForResetPass: function (req, res) {
        if (req.body) {
            User.verifyOTPForResetPass(req.body.otp,req.body._id, res.callback);
        } else {
            res.json({
                value: false,
                data: {
                    message: "Invalid Request"
                }
            })
        }
    }

};
module.exports = _.assign(module.exports, controller);