var app = angular.module("mainApp",["ngRoute"]);

// app.config(function($routeProvider) {
//     $routeProvider
//     .when("/", {
//         templateUrl : "main.html",
//         controller: 'main'
//     });
// });

app.controller("main",["$scope","$location","$http", function($scope, $location, $http){
    $scope.users = [{user:'fabianfdz',location:'Costa Rica'},{user:'johnD',location:'USA'},{user:'qwerty',location:'España'}] //Datos de prueba

    // if(!localStorage.hasOwnProperty('regID')){
    // 	mainView.router.load({url:'index.html'});
    // }else{
    // 	localStorage['regID'] = '1'
    // }

    $scope.getSession = function () {
    	var dataObj = {
				username : $scope.usuario, 
				password : $scope.password
		};

		console.log(dataObj)

		$http({
		    method: 'POST',
		    url: 'http://localhost:8080/user/login',
		    data: dataObj,
		    headers: {'Content-Type': 'application/json'}
		}).success(function(data, status, headers, config) {
			$scope.session = data.data;
    		mainView.router.load({url:'home.html'});
		}).error(function(data, status, headers, config) {
			alert( "failure message: " + JSON.stringify({data: data}));
		});		

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