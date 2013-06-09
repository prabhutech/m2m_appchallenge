App.controller('AppController', ['$scope', '$timeout', '$http', 'DataService', 'Utils', '$location',
function($scope, $timeout, $http, DataService, Utils, $location) {

    $scope.tabNavClass = function(linkId) {
        //var currentRoute = $location.path().substring(1);
        var currentRoute = $location.path().split("/")[1];
        //Select Summary page by default
        if(currentRoute == ""){
            currentRoute = "summary";
        }
        cssClass = linkId === currentRoute ? 'active' : '';
        return cssClass;
    };

    $scope.rebootAppliance = function() {
        DataService.rebootAppliance();
    };

    /*init*/

    $scope.getCarData = function (callbackFunc) {       
        $scope.searchTerm = $scope.twitterUser;        
        var url = "http://osisoftvcampus.cloudapp.net/vehicledata/cardata.svc/json/CWC/LiveCar";

        $http.jsonp(url, {
          params: {
            callback: 'JSON_CALLBACK',
            screen_name: $scope.twitterUser
          }
        })
        .success(function(data){
            console.dir(data);
            $scope.CarData = data;
            if(callbackFunc){
                console.log("Passing twitter results to callback: " + callbackFunc.name);
                return callbackFunc(data);
            }
        })
        .error(function() {
            $scope.tweet = "<strong>Error: could not make JSONP request to Twitter.</strong>"; 
        });
    };

      $scope.createSymbol = function(path, color){
        var markerSymbol = new esri.symbol.SimpleMarkerSymbol();
        markerSymbol.setPath(path);
        markerSymbol.setColor(new dojo.Color(color));
        markerSymbol.setOutline(null);
        return markerSymbol;
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

    $scope.pollgetCarData = function(){
        $scope.getCarData();
        pollSystemSummaryInfo = $timeout($scope.pollgetCarData, 3000);
        if($scope.CarData){
        var longi = $scope.CarData['Properties'][8].Snapshot.Value;
        var lat = $scope.CarData['Properties'][18].Snapshot.Value;
        console.log(lat + " " + longi);
        point = new esri.geometry.Point(longi, lat);
        map.centerAt(point);
        var iconPath = "M24.0,2.199C11.9595,2.199,2.199,11.9595,2.199,24.0c0.0,12.0405,9.7605,21.801,21.801,21.801c12.0405,0.0,21.801-9.7605,21.801-21.801C45.801,11.9595,36.0405,2.199,24.0,2.199zM31.0935,11.0625c1.401,0.0,2.532,2.2245,2.532,4.968S32.4915,21.0,31.0935,21.0c-1.398,0.0-2.532-2.2245-2.532-4.968S29.697,11.0625,31.0935,11.0625zM16.656,11.0625c1.398,0.0,2.532,2.2245,2.532,4.968S18.0555,21.0,16.656,21.0s-2.532-2.2245-2.532-4.968S15.258,11.0625,16.656,11.0625zM24.0315,39.0c-4.3095,0.0-8.3445-2.6355-11.8185-7.2165c3.5955,2.346,7.5315,3.654,11.661,3.654c4.3845,0.0,8.5515-1.47,12.3225-4.101C32.649,36.198,28.485,39.0,24.0315,39.0z";
        var graphic = new esri.Graphic(new esri.geometry.Point(point), $scope.createSymbol(iconPath, "#ce641d"));
        // var r = Math.floor(Math.random() * 250);
        // var g = Math.floor(Math.random() * 100);
        // var b = Math.floor(Math.random() * 100);
        // symbol = new esri.symbol.SimpleMarkerSymbol(esri.symbol.SimpleMarkerSymbol.STYLE_CIRCLE, 20, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([r, g, b, 0.5]), 10), new dojo.Color([r, g, b, 0.9]));
        // var graphic = new esri.Graphic(geometry, symbol);
        map.graphics.add(graphic);
        }
    };
    $scope.pollgetCarData();
    
    $scope.$on('$destroy', function(e) {
        $timeout.cancel(pollgetCarData);
    });

}]);

