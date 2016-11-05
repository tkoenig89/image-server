angular.module("cv.components")
    .component("cameraHistory", {
        controller: cameraHistoryComponentController,
        controllerAs: "vm",
        templateUrl: "templates/camera-history.template.html",
        bindings: {
            cameraName: "<"
        }
    });

cameraHistoryComponentController.$inject = ["images"];
function cameraHistoryComponentController(images) {
    var vm = this;
    activate();

    function activate() {
        vm.isHistoryActive = false;

        vm.showHistory = showHistory;
        vm.closeHistory = closeHistory;
        vm.toggleFolder = toggleFolder;
        vm.previewImage = previewImage;
    }

    function showHistory() {
        vm.isHistoryActive = true;
        loadCameraHistory();
    }

    function closeHistory() {
        vm.isHistoryActive = false;
    }
    function toggleFolder(folder) {
        if (folder.isEnfolded) {
            folder.isEnfolded = false;
        } else {
            loadFolderContent(folder);
        }
    }

    function previewImage(image) {
        vm.selected = image;
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