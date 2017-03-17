var mqtt = require("mqtt");
var fs = require("fs");

module.exports = MqttImageReceiver;

/**
 * This 
 * @param {Object} config
 */
function MqttImageReceiver(config) {
    var client;
    var onImageListeners = [];

    return {
        start: start,
        onImage: onImage
    };

    function start() {
        initClient();
        setupEventlisteners();
    }

    function initClient() {
        client = mqtt.connect(config.address, {
            clientId: config.identifier,
            username: config.username || null,
            password: config.password || null,
            clean: config.clean_session,
            ca: config.ca ? [fs.readFileSync(config.ca)] : null,
            checkServerIdentity: checkServerIdentityOverwrite
        });
    }

    /**
     * This will check that the connection is opened to a valid host.
     * If passing returns undefined, in all other cases it should return an error.
     * See here for more info: https://github.com/nodejs/node-v0.x-archive/commit/bf5e2f246eff55dfc33318f0ffb4572a56f7645a
     * @param {string} host
     * @param {Object} cer
     * @returns {Error}
     */
    function checkServerIdentityOverwrite(host, cer) {
        if (host === config.trustedHostname) {
            return undefined;
        } else {
            return Error("unknown host: " + host);
        };
    }

    function setupEventlisteners() {
        client.on("connect", onConnect);
        client.on("message", onMessage);
        client.on("error", onError);
    }

    function onMessage(topic, messageBuffer) {
        var data = parseMessage(messageBuffer);
        data.cameraName = cameraNameFromTopic(topic);
        storeImage(data);
    }

    function onConnect(connack) {
        if (!connack.sessionPresent) {
            client.subscribe(config.subscribe_topic, { qos: config.subscribe_qos });
        }
    }

    /**
     * Extracts the name of the sending camera from the topic
     * @param {string} topic
     * @returns {string}
     */
    function cameraNameFromTopic(topic) {
        var topicSplit = topic.split("/");
        if (topicSplit.length >= 2) {
            return topicSplit[topicSplit.length - 2];
        } else {
            return "unknwon";
        }
    }

    function onError(err) { }

    /**
     * 
     * @param {{buffer:Buffer, time: string, ext:string, cameraName: string}} data
     */
    function storeImage(data) {
        var date = new Date(data.time);

        //create camera directory path 
        var cameraFolderPath = ensureFolderPath(config.imageLocation, data.cameraName);

        //create date folder path
        var dateFolderName = "" + date.getFullYear() + padNumber(date.getMonth() + 1) + padNumber(date.getDate());
        var targetFolderPath = ensureFolderPath(cameraFolderPath, dateFolderName);

        //create file path
        var timeFileName = padNumber(date.getHours()) + "_" + padNumber(date.getMinutes()) + "_" + padNumber(date.getSeconds()) + "." + data.ext;
        var targetFilePath = concatFilepath(targetFolderPath, timeFileName);

        fs.writeFile(targetFilePath, data.buffer, (err) => {
            if (!err) notifyOnImageListeners(targetFilePath, data.cameraName, data.time);
        });

        //keep one file in the camera folder
        //keepLatestInTopFolder(cameraFolderPath, dateFolderName + "_" + timeFileName, data);
    }

    // function keepLatestInTopFolder(cameraFolderPath, fileName, data) {
    //     var oldLatestFile = latestFiles[data.cameraName];
    //     //remove old file
    //     if (oldLatestFile) {
    //         fs.unlink(oldLatestFile);
    //     }

    //     var latestFilePath = concatFilepath(cameraFolderPath, fileName);
    //     fs.writeFile(latestFilePath, data.buffer, function (err) {
    //         if (err) return console.log(err);
    //         latestFiles[data.cameraName] = latestFilePath;
    //     });
    // }

    /**
     * Concatenates the given paths and creates the folder if not already existing
     * @param {string} parentFolderPath
     * @param {string} folderName
     * @returns {string} concatenated path
     */
    function ensureFolderPath(parentFolderPath, folderName) {
        var folderPath = concatFilepath(parentFolderPath, folderName);
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
        return folderPath;
    }

    function concatFilepath(folder, fileName) {
        if (!folder) {
            return fileName;
        } else {
            if (folder.endsWith("/")) {
                return folder + fileName;
            } else {
                return folder + "/" + fileName;
            }
        }
    }

    /**
     * 
     * @param {Buffer} messageBuffer
     * @returns {{buffer:Buffer, time: string, ext:string}}
     */
    function parseMessage(messageBuffer) {
        var str = messageBuffer.toString("utf-8");
        var meta = str.substr(0, str.indexOf(";#"));
        var fileBuffer = str.substr(str.indexOf(";#") + 2);
        var metaObject = JSON.parse(meta);
        metaObject.buffer = new Buffer(fileBuffer, "base64");
        return metaObject;
    }

    function onImage(callback) {
        if (callback) {
            onImageListeners.push(callback);
            return true;
        } else {
            return false;
        }
    }

    function notifyOnImageListeners(imagePath, camerName, timestamp) {
        for (var i = 0; i < onImageListeners.length; i++) {
            setTimeout(onImageListeners[i].bind(null, imagePath, camerName, timestamp), 1);
        }
    }
}

function padNumber(nmbr) {
    if (nmbr < 10) {
        return "0" + nmbr;
    } else {
        return "" + nmbr;
    }
}