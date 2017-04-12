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

// var ENDPOINT = 'http://localhost:8080/'; // Si no se va a usar otro dispositivo
var ENDPOINT = 'http://192.168.0.102:8080/'; // Si no se va a usar otro dispositivo
 
var Proxy = {
    get : function($scope, $http, uri, onSuccess) {
        UI.showPreloader("Cargando...");
        return $http({
            method: 'GET',
            url: ENDPOINT + uri,
            headers: { 'Content-Type': 'application/json' }
        }).success(function(data) {
            if (data.status == "error") {
                $scope.error = true;
                $scope.errorMessage = data.error;
                // onError(data.status, data.error)
            } else {
                $scope.error = false;
                onSuccess(data.data);
            }
            UI.hidePreloader();
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
            if (data.status == "error") {
                $scope.error = true;
                $scope.errorMessage = data.error;
                // onError(data.status, data.error)
            } else {
                $scope.error = false;
                onSuccess(data.data);
            }
            UI.hidePreloader();
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
App.controller("ChatController", ["$scope", "$http", function($scope, $http) {
    var chatID = ChatManager.getCurrent();

    $scope.user = UserManager.getCurrent();

    $scope.chat = []; 

    /*
        Estructura del mensaje = {
            channel : channel,
            message : {
                user : $scope.user,
                mensaje
            } 
        }
    */

    $scope.startChat = startChat.bind(this, $scope, $http);

    $scope.startChat($scope, $http, chatID);

    function init(channel) {
        pubnub = new PubNub({
            publishKey : 'pub-c-a617c0cc-d292-4b23-8d37-dadab6daa22b',
            subscribeKey : 'sub-c-24f21b62-1d83-11e7-9093-0619f8945a4f'
        });

        pubnub.subscribe({
            'channel': channel,
            message: handleMessage
        });
    }

    // Handles all the messages coming in from pubnub.subscribe.
    function handleMessage(message) {
        message.time = message.timetoken.toString().slice(0,10)
        $scope.chat.push(message)
        console.log($scope.chat)
        $scope.$apply();
    };

    // Handle message
    $scope.enviarMensaje = function () {
        var message = $scope.mensajeInput;

        if (message != '') {
            pubnub.publish({
                'channel': channel,
                message: {
                  username: 'test',
                  text: message
                }
            });

            $scope.mensajeInput = "";
        };
    };

    $scope.hasText = function(text) {
        return (typeof text != 'undefined') && (text != '');
    };
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
