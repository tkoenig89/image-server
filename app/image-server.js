var imageFolder = "/images";
//load express dependencies
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var imageBrowser = require("./image-api/image-browser");
var app = express();

//initiate the user handling module
var userProvider = require("./authentication/user.module");
var userDB = userProvider.UserDB([["a", "b"], ["b", "c", 1]]);
var roles = userProvider.Roles;

//add middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//initiate the authentication module
var authProvider = require("./authentication/auth.module");
var authConfig = {
    loginPath: "/login",
    secret: "ab9!43" + Math.floor(Math.random() * 10000) + "sm024?24c"
};
var auth = authProvider(app, userDB, authConfig);
var onlyLoggedInUsers = auth.secure(roles.default);

//only logged in users can view images
app.use("/images", onlyLoggedInUsers, express.static(imageFolder));
app.use("/api", onlyLoggedInUsers, imageBrowser(imageFolder));

//start the http server
app.listen(8080);
console.log("listening...");