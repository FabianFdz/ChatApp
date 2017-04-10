var myApp = {};
var mainView = {};
var rightView = {};
var $$ = Dom7;

angular.module("AngularApp", ['ngTouch'])

.run(function() {
    myApp = new Framework7({
        // modalTitle: 'Framework7',
        // material: true,
        pushState: true,
        angular: true
    });
    mainView = myApp.addView('.view-main', {});
})   

.config(function() {
    if(sessionStorage.hasOwnProperty("session"))
        window.location.hash = "#!/../chats.html";
    else
        window.location.hash = "#!/home.html";  
})
// .directive('onTouch', function() {
//   return {
//         restrict: 'A',
//         link: function(scope, elm, attrs) {
//             var ontouchFn = scope.$eval(attrs.onTouch);
//             elm.bind('touchstart', function(evt) {
//                 scope.$apply(function() {
//                     ontouchFn.call(scope, evt.which);
//                 });
//             });
//             elm.bind('click', function(evt){
//                     scope.$apply(function() {
//                         ontouchFn.call(scope, evt.which);
//                     });
//             });
//         }
//     };
// });








  
.controller("RootController", ["$scope", function($scope) {
    $scope.title = "Examples";
}])
 


 




.controller("searchController", ["$scope", "$http", function($scope,$http) {
    $scope.users = [];

    $scope.getUsers = function () {
        myApp.showPreloader("Buscando...");
        $http({
            method: 'GET',
            url: 'http://localhost:8080/user/search?filter='+($scope.filter==undefined?"":$scope.filter),
            headers: {'Content-Type': 'application/json'}
        }).success(function(data, status, headers, config) {
            if(data.status=="error"){
                $scope.error = true; 
            }else{
                $scope.error = false;
                $scope.users = data.data.users;
            }
            myApp.hidePreloader();
        }).error(function(data, status, headers, config) {
            myApp.hidePreloader();
            alert( "failure message: " + JSON.stringify({data: data}));
        });  

            // mainView.router.loadPage('../chats.html');
    }

    $scope.getUsers();

    $scope.gotoChat = function (usr) {
        sessionStorage['currentChat'] = angular.toJson(usr);
        mainView.router.loadPage('../chatInside.html');
    }
}])









 
.controller("chatController", ["$scope", "$http", function($scope, $http) {
    var session = angular.fromJson(sessionStorage["session"])
    $scope.user = angular.fromJson(sessionStorage['currentChat']);
    $scope.chat = [{message:{mensaje:'Esto es una prueba de un mensaje largo. ;)',user:'usrTest2'},date:new Date()}]; 

    $scope.startChat = function () { 
        var dataObj = {
                recepient : $scope.user._id,
                session : session.session.id
        };

        $http({
            method: 'POST',
            url: 'http://localhost:8080/chat/start',
            data: dataObj,
            headers: {'Content-Type': 'application/json'}
        }).success(function(data, status, headers, config) {
            if(data.status=="error"){
                $scope.error = true;
            }else{
                $scope.error = false;
                $scope.chat = data.data;
            }
        }).error(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });
    }

    $scope.startChat();

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

    $scope.hasText = function (text) {
        return (typeof text!='undefined') && (text!='');
    }       
}])












.controller("chatsController", ["$scope", "$http", function($scope, $http) {
    $scope.chats = [];
    var session = angular.fromJson(sessionStorage["session"])

    $scope.gotoChat = function (chat) {
        sessionStorage['currentChat'] = angular.toJson(chat);
        mainView.router.loadPage('../chatInside.html');
    }

    $scope.logOut = function () {
        delete sessionStorage["session"];
        mainView.router.loadPage('../chatInside.html');
        // window.location.hash = "#!/home.html";
    }

    $scope.getChats = function () {
        myApp.showPreloader("Cargando...");
        $http({
            method: 'GET',
            url: 'http://localhost:8080/chat/list?session='+session.session.id,
            headers: {'Content-Type': 'application/json'}
        }).success(function(data, status, headers, config) {
            if(data.status=="error"){
                $scope.error = true; 
            }else{
                $scope.error = false;
                $scope.users = data.data.users;
            }
            myApp.hidePreloader();
        }).error(function(data, status, headers, config) {
            myApp.hidePreloader();
            alert( "failure message: " + JSON.stringify({data: data}));
        });  

            // mainView.router.loadPage('../chats.html');
    }

    $scope.getChats();
}])













.controller("loginController", ["$scope", "$http", function($scope, $http) {
    $scope.getSession = function () { 
        var dataObj = {
                username : $scope.usuario, 
                password : $scope.password
        };

        console.log('mainView.router')

        $http({
            method: 'POST',
            url: 'http://localhost:8080/user/login',
            data: dataObj,
            headers: {'Content-Type': 'application/json'}
        }).success(function(data, status, headers, config) {
            if(data.status=="error"){
                $scope.error = true;
            }else{
                $scope.error = false;
                sessionStorage['session'] = angular.toJson(data.data);
                mainView.router.loadPage('../chats.html');
            }
        }).error(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });  

            // mainView.router.loadPage('../chats.html');
    }

    $scope.setUser = function () {
        var dataObj = {
                username : $scope.usuario, 
                password : $scope.password
        };

        $http({
            method: 'POST',
            url: 'http://localhost:8080/user/register',
            data: dataObj,
            headers: {'Content-Type': 'application/json'}
        }).success(function(data, status, headers, config) {
            $scope.session = data.data;
            mainView.router.load({url:'home.html'});
        }).error(function(data, status, headers, config) {
            alert( "failure message: " + JSON.stringify({data: data}));
        });     

    }
}]);


var isLoading = function ($http){
    return $http.pendingRequests.length !== 0;
}
