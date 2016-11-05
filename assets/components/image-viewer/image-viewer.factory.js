angular.module("cv.components")
    .factory("images", imagesFactory);

imagesFactory.$inject = ["$http"];
function imagesFactory($http) {
    return {
        loadCameras: loadCameras,
        getDaysFromCamera: getDaysFromCamera,
        getLatestImage: getLatestImage
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
    function getLatestImage(cameraName) {
        return $http.get("/api/camera/" + cameraName + "/latest").then(function (resp) {
            return resp.data;
        });
    }
}