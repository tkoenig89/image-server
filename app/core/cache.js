module.exports = Cache;

function Cache(expirationTimeMs) {
    expirationTime = expirationTime || 360000;
    var _cache = {};
    return {
        get: get,
        set: set
    }

    function get(key) {
        var cacheObj = _cache[key];
        if (cacheObj && !isExpired(cacheObj)) {
            return cacheObj.value;
        } else {
            return null;
        }
    }

    function set(key, value) {
        _cache[key] = {
            value: value,
            time: Date.now()
        };
    }

    function isExpired(cacheObj) {
        return cacheObj.time < (Date.now() - expirationTime);
    }
}