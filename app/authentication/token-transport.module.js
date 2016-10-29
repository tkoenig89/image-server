var identifier = "jwtauth";
module.exports = {
    get: getToken,
    set: setToken
};
function setToken(resp, token) {
    //create a cookie valid for 20min
    cookie(resp, token);
}
function getToken(req) {
    return cookie(req);
}
function cookie(reqOrResp, token) {
    if (token) {
        reqOrResp.cookie(identifier, token, { maxAge: 1200000 });
    } else {
        return reqOrResp.cookies && reqOrResp.cookies[identifier];
    }
}
function header(reqOrResp, token) {
    if (token) {
        reqOrResp.setHeader(identifier, token);
    } else {
        return reqOrResp.header(identifier);
    }
}