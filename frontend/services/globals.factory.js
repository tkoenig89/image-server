angular.module("cv.services")
    .factory("globals", globalData);

function globalData() {
    return {
        User: {
            isLoggedIn: false,
            userName: ""
        }
    };
}