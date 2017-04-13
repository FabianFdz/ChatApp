var UI, View; // Framework7 UI and main view

/**
 * Helpers
 */
function goToView(viewInfo) {
    window.location.hash = viewInfo.hash;
}

var SessionManager = {
    exists : function() {
        return sessionStorage.hasOwnProperty('session');
    },
    get : function() {
        return this.exists() ? sessionStorage['session'] : {};
    },
    set : function(sessionID) {
        sessionStorage['session'] = sessionID;
    },
    flush : function() {
        delete sessionStorage['session'];
    }
};

var UserManager = {
    exists : function() {
        return sessionStorage.hasOwnProperty('user');
    },
    get : function() {
        return this.exists() ? angular.fromJson(sessionStorage['user']) : {};
    },
    set : function(userData) {
        sessionStorage['user'] = angular.toJson({
            avatar : userData.avatar,
            id : userData.id,
            username : userData.username
        });
    },
    flush : function() {
        delete sessionStorage['user'];
    }
};

var ChatManager = {
    hasCurrent : function() {
        return sessionStorage.hasOwnProperty('currentChat');
    },
    setCurrent : function(chatID) {
        sessionStorage['currentChat'] = angular.toJson(chatID);
    },
    getCurrent : function() {
        return this.hasCurrent() ? angular.fromJson(sessionStorage['currentChat']) : {}
    }
};

var ENDPOINT = 'http://localhost:8080/'; // Si no se va a usar otro dispositivo
// var ENDPOINT = 'http://192.168.0.100:8080/'; // Si se va a usar otro dispositivo, poner IP y puerto del server. http://<IP>:<PORT>/
 
var Proxy = {
    get : function($scope, $http, uri, onSuccess) {
        UI.showPreloader("Cargando...");
        return $http({
            method: 'GET',
            url: ENDPOINT + uri,
            headers: { 'Content-Type': 'application/json' }
        }).success(function(data) {
            UI.hidePreloader();
            if (data.status == "error") {
                $scope.error = true;
                $scope.errorMessage = data.error;
                // onError(data.status, data.error)
            } else {
                $scope.error = false;
                onSuccess(data.data);
            }
        }).error(function(data , status/*, headers, config */) {
            UI.hidePreloader();
            alert( "failure message: " + JSON.stringify({ data: data , status: status }));
        });
    }, 
    post : function($scope, $http, uri, dataObj, onSuccess) {
        UI.showPreloader("Cargando...");
        return $http({
            method: 'POST',
            url: ENDPOINT + uri,
            data: dataObj,
            headers: { 'Content-Type': 'application/json' }
        }).success(function(data /* , status, headers, config */) {
            UI.hidePreloader();
            if (data.status == "error") {
                $scope.error = true;
                $scope.errorMessage = data.error;
                // onError(data.status, data.error)
            } else {
                $scope.error = false;
                onSuccess(data.data);
            }
        }).error(function(data , status/*, headers, config */) {
            UI.hidePreloader();
            alert( "failure message: " + JSON.stringify({ data: data , status: status }));
        });
    }
};

/**
 * Constants
 */
var VIEWS = {
    LOGIN : {
        hash : "#!/login.html",
        url : "login.html"
    },
    CHAT : {
        hash : "#!/chat.html",
        url : "chat.html"
    },
    LISTING : {
        hash : "#!/listing.html",
        url : "listing.html"
    }
};

/**
 * SendChatApp app
 */
var App = angular.module("SendChatApp", ['ngTouch']);

App.run(function() {
    UI = new Framework7({
        pushState: true,
        angular: true
    });
    View = UI.addView('.view-main', {});
});

App.config(function() {
    goToView(SessionManager.exists() ? VIEWS.LISTING : VIEWS.LOGIN);
});

/**
 * ROOT
 */
App.controller("RootController", ["$scope", function($scope) {
    $scope.title = "Root";
}]);

function processStartSessionData(data) {
    UserManager.set({
        avatar : data.avatar,
        id : data.id,
        username : data.username
    });
    SessionManager.set(data.session.id);
    View.router.loadPage(VIEWS.LISTING.url);
}

/**
 * LOGIN
 */
App.controller("LoginController", ["$scope", "$http", function($scope, $http) {
    $scope.login = function () {
        Proxy.post($scope, $http, 'user/login', {
            username : $scope.usuario,
            password : $scope.password
        }, processStartSessionData);
    };
}]);

/**
 * REGISTER
 */
App.controller("RegisterController", ["$scope", "$http", function($scope, $http) {
    $scope.register = function () {
        Proxy.post($scope, $http, 'user/register', {
            username : $scope.usuario,
            password : $scope.password
        }, processStartSessionData);
    };
}]);

function startChat($scope, $http, userID) {
    Proxy.post($scope, $http, 'chat/start', {
        recepient : userID,
        session : SessionManager.get()
    }, function(data) {
        goToChat(data.id); // chatID
    });
}

function goToChat(chatID) { 
    ChatManager.setCurrent(chatID);
    View.router.loadPage(VIEWS.CHAT.url);
}

/**
 * SEARCH
 */
App.controller("SearchController", ["$scope", "$http", function($scope, $http) {
    $scope.users = [];

    $scope.getUsers = function() {
        var filter = $scope.filter == undefined ? "" : $scope.filter;
        Proxy.get($scope, $http, 'user/search?session=' + SessionManager.get() + '&filter=' + filter, function(data) {
            $scope.users = data.users;
        });
    };

    $scope.startChat = startChat.bind(this, $scope, $http);
}]);

/**
 * CHAT (single channel)
 */
App.controller("ChatController", ["$scope", "$http", "$filter", function($scope, $http, $filter) {
    var chatID = ChatManager.getCurrent(); //

    $scope.user = UserManager.get(); // Datos de usuario

    $scope.chat = []; // Lista de mensajes

    /*
        Estructura del mensaje (PubNub) = {
            channel : channel,
            message : {
                "_id"       :   data.message._id,
                "text"      :   data.message.text,
                "owner"     :{
                        _id     :   $scope.user.id,
                        avatar  :   $scope.user.avatar
                },
                "createdOn" : $filter('date')(new Date(), 'medium')
            }
        }



        Estructura del mensaje (Server) = {
            "_id"       :   data.message._id,
            "text"      :   data.message.text,
            "owner"     :{
                    _id     :   $scope.user.id,
                    avatar  :   $scope.user.avatar
            },
            "createdOn" : $filter('date')(new Date(), 'medium')
        }
    */


    // Envia mensaje a server y luego a PubNub en el success

    $scope.enviarMensaje = function () {
        var message = $scope.mensajeInput;

        if (message != '') {
            Proxy.post($scope, $http, 'chat/' + chatID, {
                session : SessionManager.get(),
                text : message
            }, function(data) {
                var msj = {
                    "_id":data.message._id,
                    "text":data.message.text,
                    "owner":{
                        _id:$scope.user.id,
                        avatar:$scope.user.avatar
                    },
                    "createdOn": $filter('date')(new Date(), 'medium')
                };
                pubnub.publish({
                    'channel': data.chat,
                    message: msj
                });
            });

            $scope.mensajeInput = "";
        };
    };

    $scope.getMessages = function() {
        Proxy.get($scope, $http, 'chat/' + chatID + '?session=' + SessionManager.get(), function(data) {
            $scope.chat = data.messages;
        });
    };

    $scope.getMessages();

    var pubnub = new PubNub({
        publishKey : 'pub-c-a617c0cc-d292-4b23-8d37-dadab6daa22b',
        subscribeKey : 'sub-c-24f21b62-1d83-11e7-9093-0619f8945a4f'
    });

    pubnub.subscribe({ channels: [chatID.toString()] });

    pubnub.addListener({
        message: function (message) {
            $scope.chat.push(message.message);
            $scope.$apply();
        }
    });

}]);

/**
 * LISTING (listing)
 */
App.controller("ListingController", ["$scope", "$http", function($scope, $http) {
    $scope.chats = [];

    $scope.goToChat = goToChat;

    $scope.logOut = function () {
        Proxy.get($scope, $http, 'user/logout?session=' + SessionManager.get(), function() {
            UserManager.flush()
            SessionManager.flush();
            View.router.loadPage(VIEWS.LOGIN.url);
        });
    };

    $scope.hasAvatar = function(chat) {
        return chat.participants[0].hasOwnProperty('avatar');
    }

    Proxy.get($scope, $http, 'chat/list?session=' + SessionManager.get(), function(data) {
        $scope.chats = data;
    });
}]);