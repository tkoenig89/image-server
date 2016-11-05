angular.module("cv.components")
    .component("login", {
        controller: loginComponentController,
        controllerAs: "vm",
        templateUrl: "templates/login.template.html"
    });

loginComponentController.$inject = ["loginService", "globals"];
function loginComponentController(loginService, globals) {
    var vm = this;
    activate();

    function activate() {
        vm.userObj = null;
        vm.username = "";
        vm.password = "";
        vm.loginErrorOccured = false;
        vm.login = login;
        vm.logout = logout;

        updateLoginStatus();
    }

    function login() {
        vm.loginErrorOccured = false;

        loginService.login(vm.username, vm.password)
            .then(updateLoginStatus, onLoginError);
    }

    function onLoginError() {
        vm.password = "";
        vm.loginErrorOccured = true;
    }

    function logout() {
        vm.username = "";
        vm.password = "";
        loginService.logout().then(updateLoginStatus);
    }

    function updateLoginStatus() {
        vm.loginErrorOccured = false;

        loginService.isLoggedIn().then(function (user) {
            vm.userObj = user;
            updateGlobalUserObject(user);
        }, function (err) {
            vm.userObj = null;
            updateGlobalUserObject();
        });
    }

    function updateGlobalUserObject(userName) {
        globals.User.isLoggedIn = userName ? true : false;
        globals.User.userName = userName || "";
    }
}
