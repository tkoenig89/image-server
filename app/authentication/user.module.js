var roles = {
    default: Symbol(),
    admin: Symbol()
};
module.exports = {
    UserDB: UserDB,
    Roles: roles
};
function UserDB(userSource) {
    var tokenNmbr = Math.floor(Math.random() * 10000);
    var users = [];
    activate();
    return {
        find: findByNameAndPassword,
        findByToken: findByToken,
        Roles: roles
    };
    function activate() {
        //attach prototype functions to User objects
        User.prototype.getSaveUserWrap = getSaveUserWrap;
        User.prototype.setRole = setRole;
        loadFromUserSource();
    }
    function loadFromUserSource() {
        if (typeof (userSource) === "string") {
            userSource = readUsersFromFile();
        }
        arrayToUsers(userSource);
    }
    function readUsersFromFile() {
        var fs = require("fs");
        var os = require("os");
        var content = fs.readFileSync(userSource, "utf8");
        var lines = content.split(os.EOL);
        for (var i = 0; i < lines.length; i++) {
            lines[i] = lines[i].split(",");
        }
        return lines;
    }
    function arrayToUsers(array) {
        for (var i = 0; i < array.length; i++) {
            if (array[i].length >= 2) {
                var u = new User(array[i][0], array[i][1]);
                if (array[i][2]) {
                    u.setRole(roles.admin);
                }
                users.push(u);
            }
        }
    }
    function findByNameAndPassword(name, password, callback) {
        var publicUserToken, err;
        for (var i = 0; i < users.length; i++) {
            if (users[i].Name === name) {
                if (users[i].Password !== password) {
                    err = "wrong password";
                } else {
                    publicUserToken = users[i].PublicToken;
                }
                break;
            }
        }
        if (!err && !publicUserToken) {
            err = "not found";
        }
        setTimeout(callback.bind(null, err, publicUserToken), 1);
    }
    function findByToken(token, callback) {
        var user;
        for (var i = 0; i < users.length; i++) {
            if (users[i].PublicToken == token) {
                user = users[i].getSaveUserWrap();
                break;
            }
        }
        setTimeout(callback.bind(null, user ? null : "not found", user), 1);
    }
    function User(name, password) {
        this.Name = name;
        this.Password = password;
        this.PublicToken = "u_" + (tokenNmbr++);
        this.Role = roles.default;
    }
    /**
     * Creates a new user object without the password information
     * @returns
     */
    function getSaveUserWrap() {
        return {
            Name: this.Name,
            Role: this.Role,
            PublicToken: this.PublicToken
        };
    }
    function setRole(role) {
        this.Role = role;
        return this;
    }
}