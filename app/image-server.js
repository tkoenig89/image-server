var imageFolder = "/images";
//load configuration
var config = require("./core/config").load(process.argv[2] || "config.json");

//load express dependencies
var express = require("express");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var staticGzip = require("express-static-gzip");
var imageBrowser = require("./image-api/image-browser");
var app = express();
// var httpsExpress = require("./core/express-https")(app, {
//     key: config.server.key,
//     cert: config.server.cert
// });

//initiate the user handling module
var userProvider = require("./authentication/user.module");
var userDB = userProvider.UserDB(config.users);
var roles = userProvider.Roles;

//add middleware
app.use(bodyParser.json());
app.use(cookieParser());

//initiate the authentication module
var authProvider = require("./authentication/auth.module");
var auth = authProvider(app, userDB, {
    loginPath: config.authentication.loginPath,
    secret: config.authentication.secret
});
var onlyLoggedInUsers = auth.secure(roles.default);

//only logged in users can view images
app.use("/images", onlyLoggedInUsers, express.static(config.imageFolder));
app.use("/", staticGzip("static", { ensureGzipedFiles: true, indexFromEmptyFile: true }));
app.use("/api", onlyLoggedInUsers, imageBrowser(config.imageFolder));

//start the http server
app.listen(8080);
//httpsExpress.listen(8443);
console.log("listening...");