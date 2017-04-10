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









 
.controller("chatController", ["$scope", "$http", function($scope, $http) {
    $scope.user = angular.fromJson(sessionStorage['currentChat']);
    $scope.chat = [{message:{mensaje:'Esto es una prueba de un mensaje largo. ;)',user:'usrTest2'},date:new Date()}]; 
    var channel = 'test';

    pubnub = new PubNub({
        publishKey : 'pub-c-a617c0cc-d292-4b23-8d37-dadab6daa22b',
        subscribeKey : 'sub-c-24f21b62-1d83-11e7-9093-0619f8945a4f'
    });

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

    pubnub.subscribe({
        'channel': channel,
        message: handleMessage
    });

    $scope.hasText = function (text) {
        return (typeof text!='undefined') && (text!='');
    }         
}])













.controller("chatsController", ["$scope", "$http", function($scope, $http) {
    $scope.chats = [{user:'fabianfdz',location:'Costa Rica',image:'http://lorempixel.com/400/400/people/'},{user:'johnD',location:'USA',image:'http://lorempixel.com/400/400/people/'},{user:'qwerty',location:'España',image:'http://lorempixel.com/400/400/people/'}]; // Datos de Prueba

    $scope.gotoChat = function (chat) {
        sessionStorage['currentChat'] = angular.toJson(chat);
        mainView.router.loadPage('../chatInside.html');
    }
}])













.controller("loginController", ["$scope", "$http", function($scope, $http) {
    $scope.getSession = function () { 
        // var dataObj = {
        //         username : $scope.usuario, 
        //         password : $scope.password
        // };

        // console.log('mainView.router')

        // $http({
        //     method: 'POST',
        //     url: 'http://localhost:8080/user/login',
        //     data: dataObj,
        //     headers: {'Content-Type': 'application/json'}
        // }).success(function(data, status, headers, config) {
        //     $scope.session = data.data;
            // mainView.router.loadPage('../chats.html');
        // }).error(function(data, status, headers, config) {
        //     alert( "failure message: " + JSON.stringify({data: data}));
        // });  

            mainView.router.loadPage('../chats.html');
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
