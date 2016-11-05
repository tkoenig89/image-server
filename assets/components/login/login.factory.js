angular.module("cv.components")
    .factory("loginService", loginServiceFactory);

loginServiceFactory.$inject = ["$http"];
function loginServiceFactory($http) {
    return {
        isLoggedIn: isLoggedIn,
        login: login,
        logout: logout
    };

    function isLoggedIn() {
        return $http.get("/login").then(function (resp) {
            return resp.data;
        });
    }

    function logout() {
        return $http.delete("/login");
    }

    function login(username, password) {
        return $http.post("/login", {
            user: username,
            passw: password
        });
    }
}