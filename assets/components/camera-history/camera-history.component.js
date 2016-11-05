angular.module("cv.components")
    .component("cameraHistory", {
        controller: cameraHistoryComponentController,
        controllerAs: "vm",
        templateUrl: "templates/camera-history.template.html",
        bindings: {
            cameraName: "<",
            isHistoryActive: "<"
        }
    });

cameraHistoryComponentController.$inject = ["images", "$scope"];
function cameraHistoryComponentController(images, $scope) {
    var vm = this;
    activate();

    function activate() {
        vm.toggleFolder = toggleFolder;
        vm.previewImage = previewImage;

        //listen for changes to the active state of the history viewer
        $scope.$watch("vm.isHistoryActive", function (newValue, oldValue) {
            if (newValue != oldValue && newValue) {
                loadCameraHistory();
            }
        });
    }

    function toggleFolder(folder) {
        if (folder.isEnfolded) {
            folder.isEnfolded = false;
        } else {
            loadFolderContent(folder);
        }
    }

    function previewImage(image) {
        if (vm.selected) { vm.selected.isActive = false; }
        vm.selected = image;
        vm.selected.isActive = true;
    }

    function loadCameraHistory() {
        images.getDaysFromCamera(vm.cameraName).then(function (folderList) {
            //create object structure from plain folder names
            for (var i = 0; i < folderList.length; i++) {
                folderList[i] = {
                    name: folderList[i].split("/")[1],
                    isEnfolded: false,
                    isContentLoaded: false,
                    content: null
                };
            }
            vm.folderList = folderList;
        });
    }

    function loadFolderContent(folder) {
        folder.isEnfolded = true;
        if (folder.content) {
            folder.isContentLoaded = true;
        } else {
            images.getImageListFromFolder(vm.cameraName, folder.name).then(function (imageList) {
                for (var i = 0; i < imageList.length; i++) {
                    imageList[i] = {
                        name: imageList[i].split("/")[2],
                        url: "/images/" + imageList[i]
                    }
                }

                folder.content = imageList;
                folder.isContentLoaded = true;
            });
        }
    }

}