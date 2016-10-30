angular.module("cv.components")
    .component("imageViewer", {
        controller: cameraComponentController,
        controllerAs: "vm",
        templateUrl: "components/image-viewer/image-viewer.template.html"
    });

cameraComponentController.$inject = ["globals", "$scope", "images"];
function cameraComponentController(globals, $scope, images) {
    var vm = this;
    activate();

    function activate() {
        vm.isEnabled = false;
        listenForUserLoginStateChange();
    }

    function onUserLoggedIn() {
        vm.isEnabled = true;
        loadCameraList();
    }

    function onUserLoggedOut() {
        vm.isEnabled = false;
    }

    function loadCameraList() {
        images.loadCameras().then(function (cameraList) {
            vm.cameraList = cameraList;
        });
    }

    /**
     * Watches changes of the global user object
     */
    function listenForUserLoginStateChange() {
        vm.User = globals.User;
        $scope.$watch("vm.User.isLoggedIn", function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (newValue) {
                    onUserLoggedIn();
                } else {
                    onUserLoggedOut();
                }
            }
        });
    }
}