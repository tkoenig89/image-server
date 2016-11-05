angular.module("cv.components")
    .factory("images", imagesFactory);

imagesFactory.$inject = ["$http"];
function imagesFactory($http) {
    return {
        loadCameras: loadCameras,
        getDaysFromCamera: getDaysFromCamera,
        getLatestImage: getLatestImage,
        getImageListFromFolder:getImageListFromFolder
    }

    function loadCameras() {
        return $http.get("/api/camera").then(function (resp) {
            return resp.data;
        });
    }

    function getDaysFromCamera(cameraName) {
        return $http.get("/api/camera/" + cameraName).then(function (resp) {
            return resp.data;
        });
    }

    function getImageListFromFolder(cameraName, folderName) {
        return $http.get("/api/camera/" + cameraName + "/" + folderName).then(function (resp) {
            return resp.data;
        });
    }

    function getLatestImage(cameraName) {
        return $http.get("/api/camera/" + cameraName + "/latest").then(function (resp) {
            return resp.data;
        });
    }
}