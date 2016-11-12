angular.module("cv.components")
    .filter("imageTime", imageTimeFilter);

function imageTimeFilter() {
    return function (value) {
        var matchResult;
        if (value) {
            if ((matchResult = value.match(/[0-9]{6}/))) {
                value = matchResult[0];
                value = value.slice(0, 2) + ":" + value.slice(2, 4) + " Uhr";
            } else if ((matchResult = value.match(/[0-9]{2}_[0-9]{2}_[0-9]{2}/))) {
                value = matchResult[0];
                value = value.slice(0, 2) + ":" + value.slice(3, 5) + " Uhr";
            }
        }
        return value;
    };
}