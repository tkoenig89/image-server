angular.module("cv.components")
    .filter("timeConvert", timeConvertFilter);

function timeConvertFilter() {
    return function (value, mode) {
        var matchResult;
        if (value) {
            if (mode === "time") {
                if ((matchResult = value.match(/[0-9]{2}_[0-9]{2}_[0-9]{2}/))) {
                    value = matchResult[0];
                    value = value.slice(0, 2) + ":" + value.slice(3, 5) + " Uhr";
                } else if ((matchResult = value.match(/[0-9]{6}/))) {
                    value = matchResult[0];
                    value = value.slice(0, 2) + ":" + value.slice(2, 4) + " Uhr";
                }
            } else if (mode === "date") {
                if ((matchResult = value.match(/[0-9]{8}/))) {
                    value = matchResult[0];
                    value = value.slice(6, 8) + "." + value.slice(4, 6) + "." + value.slice(0, 4);
                }
            }
        }
        return value;
    };
}