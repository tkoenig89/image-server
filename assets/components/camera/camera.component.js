
(function () {
    angular.module("cv.components")
        .component("camera", {
            controller: cameraComponentController,
            controllerAs: "vm",
            templateUrl: "templates/camera.template.html",
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

            images.getLatestImage(vm.cameraName).then(function (latestImage) {
                vm.latest_image = latestImage;
            });
        }
    }
})();
