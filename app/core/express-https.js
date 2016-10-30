var fs = require('fs');
var http = require('http');
var https = require('https');

module.exports = ExpressHttpsWrapper;

function ExpressHttpsWrapper(app, config) {
    var privateKey = fs.readFileSync(config.key, 'utf8');
    var certificate = fs.readFileSync(config.cert, 'utf8');
    var credentials = { key: privateKey, cert: certificate };

    var httpsServer = https.createServer(credentials, app);

    return {
        listen: listen
    }

    /**
     * Starts listening on provided port
     * @param {number} port
     */
    function listen(port) {
        httpsServer.listen(port);
    }
}