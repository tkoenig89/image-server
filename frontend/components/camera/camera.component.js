angular.module("cv.components")
    .component("camera", {
        controller: cameraComponentController,
        controllerAs: "vm",
        templateUrl: "components/camera/camera.template.html",
        bindings: {
            cameraName: "<"
        }
    });

cameraComponentController.$inject = ["images"];
function cameraComponentController(images) {
    var vm = this;

    activate();
    function activate() {
        vm.folders = [];
        
        images.getDaysFromCamera(vm.cameraName).then(function (folderList) {
            vm.folders = folderList;
        });

        images.getLatestImage(vm.cameraName).then(function (latestImage) {
            vm.latest_image = latestImage;
        });
    }
}