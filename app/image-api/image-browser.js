var fs = require("fs");
var express = require('express');
module.exports = ImageBrowser;

function ImageBrowser(imageRootFolder) {
    var router = express.Router();
    var latestImages = {};
    setupRoutes();
    return {
        router: router,
        onImageReceived: onImageReceived
    };

    function setupRoutes() {
        router
            .get('/camera', function (req, res) {
                listCameras().then(function (files) {
                    res.status(200).json(files);
                });
            })
            .get("/camera/:name", function (req, res) {
                listDaysOfImages(req.params.name).then(function (files) {
                    res.status(200).json(files);
                }, function (err) {
                    res.status(404).send();
                });
            })
            .get("/camera/:name/latest", function (req, res) {
                var imgPath = latestImage(req.params.name);
                if (imgPath) {
                    res.status(200).json(imgPath);
                } else {
                    res.status(404).send();
                };
            })
            .get("/camera/:name/:dateOfImage", function (req, res) {
                listAllImagesOfTheDay(req.params.name, req.params.dateOfImage).then(function (files) {
                    res.status(200).json(files);
                }, function (err) {
                    res.status(404).send();
                });
            });
    }

    function listCameras() {
        return findAllFilesInFolder(imageRootFolder, 1);
    }

    function onImageReceived(imagePath, cameraName, timestamp) {
        var current = latestImages[cameraName];        
        if (!current || current.time < timestamp) {
            latestImages[cameraName] = {
                file: imagePath.replace(imageRootFolder, ""),
                time: timestamp
            };
        }
    }

    /**
     * Lists all days that have been found for the given camera.
     * @param {string} cameraName
     * @returns {Promise}
     */
    function listDaysOfImages(cameraName) {
        var folderToSearch = concatPath(imageRootFolder, cameraName);
        return findAllFilesInFolder(folderToSearch, 1).then(function (files) {
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    files[i] = concatPath(cameraName, files[i]);
                }
            }
            return files;
        });
    }

    function latestImage(cameraName) {
        return latestImages[cameraName] && latestImages[cameraName].file;
    }

    /**
     * Creates a list of all images for the given day
     * @param {string} cameraName
     * @param {string} dayOfImage
     * @returns {Promise}
     */
    function listAllImagesOfTheDay(cameraName, dayOfImage) {
        var subPath = concatPath(cameraName, dayOfImage);
        var folderToSearch = concatPath(imageRootFolder, subPath);
        return findAllFilesInFolder(folderToSearch, 2).then(function (files) {
            if (files) {
                for (var i = 0; i < files.length; i++) {
                    files[i] = concatPath(subPath, files[i]);
                }
            }
            return files;
        });
    }

    /**
     * Iterates through all files in the given folder and returns a list of filenames matching the selected mode.
     * Does not iterate recursivly!
     * @param {string} root
     * @param {number} mode: 0:all filetypes, 1:folders, 2:files, 3:image
     * @returns {string[]}
     */
    function findAllFilesInFolder(root, mode) {
        return new Promise(function (resolve, reject) {
            fs.readdir(root, function (err, files) {
                if (err) return reject(err);
                var folders = [];
                for (var i = 0; i < files.length; i++) {
                    try {
                        var stats = fs.lstatSync(concatPath(root, files[i]));
                        if (testFileStats(stats, files[i])) {
                            folders.push(files[i]);
                        }
                    } catch (ex) { }
                }
                resolve(folders);
            })
        });

        function testFileStats(stats, fileName) {
            return mode === 0
                || (mode === 1 && stats.isDirectory())
                || (mode === 2 && stats.isFile())
                || (mode === 3 && (fileName.endsWith(".jpg") || fileName.endsWith(".png")));
        }
    }
}

/**
 * Concatenates two given filepath strings.
 * @param {string} p1
 * @param {string} p2
 */
function concatPath(p1, p2) {
    if (!p1.endsWith("/")) {
        p1 = p1 + "/";
    }
    if (p2.startsWith("/")) {
        p2 = p2.substr(1);
    }
    return p1 + p2;
}