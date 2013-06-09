App.controller('ReportsController', ['$scope', '$timeout', '$http', 'DataService', 'Utils', '$location',
function($scope, $timeout, $http, DataService, Utils, $location) {

    /*init*/
   $scope.FuelConsumed = {};

    $scope.getFuelConsumed = function (callbackFunc) {       
        $scope.searchTerm = $scope.twitterUser;        
        var url = "http://osisoftvcampus.cloudapp.net/vehicledata/cardata.svc/json/CWC/LiveCar/FuelConsumed/recorded?start=%27*-1d%27&end=%27*%27";

        $http.jsonp(url, {
          params: {
            callback: 'JSON_CALLBACK',
            screen_name: $scope.twitterUser
          }
        })
        .success(function(data){
            $scope.FuelConsumed.data = data;
            console.dir($scope.FuelConsumed);
            if(callbackFunc){
                console.log("Passing twitter results to callback: " + callbackFunc.name);
                return callbackFunc(data);
            }
        })
        .error(function() {
           
        });
    };

    $scope.getVehileSpeed = function (callbackFunc) {       
        $scope.searchTerm = $scope.twitterUser;        
        var url = "http://osisoftvcampus.cloudapp.net/vehicledata/cardata.svc/json/CWC/LiveCar/VehicleSpeed/Plot?start=%27*-1d%27&end=%27*%27&plotinterval=10";

        $http.jsonp(url, {
          params: {
            callback: 'JSON_CALLBACK',
            screen_name: $scope.twitterUser
          }
        })
        .success(function(data){
            $scope.VehileSpeed = data;
            console.dir($scope.VehileSpeed);
            
            if($scope.VehileSpeed){
                var VehileSpeedChartData = [];
                for(var i=0; i < $scope.VehileSpeed.length; i++){
                    var arr = [];
                    arr.push(i);
                    arr.push(Math.round($scope.VehileSpeed[i].Value));
                    VehileSpeedChartData.push(arr);
                }
            var d2 = [[0, 3], [4, 8], [8, 5], [9, 13]];
            $.plot("#placeholder", [VehileSpeedChartData]);
            }

            //$.plot("#placeholder", [d2]);
            if(callbackFunc){
                console.log("Passing twitter results to callback: " + callbackFunc.name);
                return callbackFunc(data);
            }
        })
        .error(function() {
            $scope.tweet = "<strong>Error: could not make JSONP request to Twitter.</strong>"; 
        });
    };

    $scope.pollgetVehileSpeed = function(){
        $scope.getVehileSpeed();
        getVehileSpeedInfo = $timeout($scope.getVehileSpeed, 3000);
    };
    
    $scope.getPercentage = function(usedStr, totalStr) {
        usedStr = usedStr.substring(0, usedStr.length - 3);
        totalStr = totalStr.substring(0, totalStr.length - 3);

        percentage = (usedStr / totalStr) * 100;
        return Math.round(percentage);
    };

    $scope.roundNumber = function(number){
        return Math.round(number);
    }

    //$scope.getFuelConsumed();
    $scope.pollgetVehileSpeed();
    

}]);

