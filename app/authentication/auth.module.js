var jwt = require("jsonwebtoken");
var tokenTransport = require("./token-transport.module");
module.exports = JWTAuthHandler;
function JWTAuthHandler(app, userProvider, config) {
    var baseLoginPath = config.loginPath || "/login";
    init();
    //public api
    return {
        secure: secure
    };
    function init() {
        injectMiddleWare();
        setupLogin();
    }
    /**
     * Creates a Middleware function to ensure only authorized users will get to the trailing route
     * @param {Symbol} requiredRole
     * @returns {Function}
     */
    function secure(requiredRole) {
        return ensureUserHasRoleMiddleware;
        /**
         * Middleware function that ensures, that the current user is logged in and has the apropriate rights
         * @param {Request} req
         * @param {Response} resp
         * @param {Function} next
         * @returns {Function}
         */
        function ensureUserHasRoleMiddleware(req, resp, next) {
            if (!req.User) {
                return resp.status(401).send("not logged in");
            } else if (req.User.Role !== requiredRole) {
                return resp.status(401).send("not authorized");
            } else {
                next();
            }
        }
    }
    function injectMiddleWare() {
        app.use(jwtMiddleWare);
    }
    function setupLogin() {
        //provide user information
        app.get(baseLoginPath, function (req, resp) {
            if (req.User) {
                resp.status(200).send(req.User.Name);
            } else {
                resp.status(401).send("none");
            }
        });

        //provide logout capability
        app.delete(baseLoginPath, function (req, resp) {
            tokenTransport.set(resp, "empty");
            resp.status(200).send();
        });

        //allow logging in
        app.post(baseLoginPath, login);
    }
    /**
     * Will 
     * 
     * @param {any} req
     * @param {any} resp
     */
    function login(req, resp) {
        userProvider.find(req.body.user, req.body.passw, function (err, publicUserToken) {
            if (err) {
                resp.status(401).send(err);
            }
            else if (publicUserToken) {
                //sign a token expiring in 20min
                var token = jwt.sign({ ut: publicUserToken }, config.secret, { expiresIn: 1200 });
                tokenTransport.set(resp, token);
                resp.status(200).send();
            }
        });
    }
    /**
     * Looks for a jwtoken inside the request cookies and resolve the matching user into the request object
     * @param {Request} req
     * @param {Response} resp
     */
    function jwtMiddleWare(req, resp, next) {
        var jwToken = tokenTransport.get(req);
        if (jwToken) {
            jwt.verify(jwToken, config.secret, function (err, verifiedToken) {
                if (err) return next();
                userProvider.findByToken(verifiedToken.ut, function (err, user) {
                    if (user) {
                        req.User = user;
                    }
                    next();
                });
            });
        } else {
            next();
        }
    }
}