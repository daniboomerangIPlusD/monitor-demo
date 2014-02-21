angular.module('synopticDemo', ['sticky', 'ui.bootstrap'])

  .controller('synopticCtrl', function($scope){
    $scope.synoptic = {BOXES: 'boxes', OTHER: 'other'};
    $scope.svgs = ['boxes', 'other'];
    $scope.svgIndex = 0;
    $scope.previousSynoptic = function() {
      $scope.svgIndex = Math.abs($scope.svgIndex - 1) % $scope.svgs.length;
    }
    $scope.nextSynoptic = function() {
      $scope.svgIndex = ($scope.svgIndex + 1) % $scope.svgs.length;
    }
  })

  .service('dataServerService', function ($rootScope) {
    var dataServerArray = new Array(); 
    var randomsServerArray = new Array(); 

    return {
      pullDataFromServer : function() {
        dataServerArray["rectFill"] = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
        dataServerArray["rectBorder"] = 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')';
        $rootScope.$broadcast('dataServerChanged', dataServerArray);
      },
      pullRandomsFromServer : function() {
        randomsServerArray["randomA"] = Math.floor((Math.random()*100)+1);
        randomsServerArray["randomB"] = Math.floor((Math.random()*100)+1);
        randomsServerArray["randomC"] = Math.floor((Math.random()*100)+1);
        randomsServerArray["randomD"] = Math.floor((Math.random()*100)+1);
        randomsServerArray["randomE"] = Math.floor((Math.random()*100)+1);
        randomsServerArray["randomF"] = Math.floor((Math.random()*100)+1);
        $rootScope.$broadcast('randomsServerChanged', randomsServerArray);
      },
      getDataServer : function() {
        return randomsServerArray;
      }
   };
  })

 .service('calculator', function ($rootScope) {
    var operation = {
      A: 0, B: 0, C: 0, D: 0, E: 0, F: 0,
      resultAB: 0,
      resultCD: 0,
      resultEF: 0,
      result: 0, 
    }    
    return {
      performRandomOperation : function(randomsServerArray) {
        operation.A = randomsServerArray["randomA"]; operation.B = randomsServerArray["randomB"];
        operation.C = randomsServerArray["randomC"]; operation.D = randomsServerArray["randomD"];
        operation.E = randomsServerArray["randomA"]; operation.F = randomsServerArray["randomA"];
        operation.resultAB = randomsServerArray["randomA"] + randomsServerArray["randomB"];
        operation.resultCD = randomsServerArray["randomC"] + randomsServerArray["randomD"];
        operation.resultEF = randomsServerArray["randomE"] + randomsServerArray["randomF"];
        operation.result = operation.resultAB + operation.resultCD + operation.resultEF;
        console.log("performing operation and result is ", operation.result);
        $rootScope.$broadcast('operationPerformed', operation);
      },
      getOperationResult : function(){
        return operation.result;
      }
   };
  })

  .controller('boxesManagerCtrl', function($scope, dataServerService) {  
    $scope.timeInterval = 1000;
    $scope.loggerData = [];
    logMessage('Synoptic Boxes server running at => http://localhost:8000/ CTRL + C to shutdown');
    logMessage('Initial interval => 1000ms');
    $scope.$on('dataServerChanged', function(event, dataServerArray) {
      $scope.$apply(function () {
        //updateLogger
        logMessage('Fill=> ' + dataServerArray["rectFill"]);
        logMessage('Border=> ' + dataServerArray["rectBorder"]);
        //processStatistics
        //* TO  DO */
        if (dataServerArray["rectFill"] == dataServerArray["rectBorder"]){
          logMessage("Match fill and border => " + dataServerArray["rectBorder"]);          
        }
      });
    });

    // The remote control
    $scope.updateInterval = function(timeInterval) {
      logMessage('timermeInterval = ' + timeInterval);
      logMessage('Synchronizing...');  
      $scope.timeInterval = timeInterval;
      this.stopPulling();
      this.startPulling();      
    };

    $scope.startPulling = function() {
      logMessage('Pulling data from server...');  
      $scope.timer = setInterval(this.refresh, $scope.timeInterval);
    };

    $scope.stopPulling = function() {
      logMessage('Stopping simulation...');  
      clearInterval($scope.timer);
    };  

    $scope.refresh = function() {  
      dataServerService.pullDataFromServer();
    };

    function getCurrentDate() {
        // Today date time which will used to set as default date.
        var todayDate = new Date();
        todayDate = todayDate.getFullYear() + "-" +
                       ("0" + (todayDate.getMonth() + 1)).slice(-2) + "-" +
                       ("0" + todayDate.getDate()).slice(-2) + " " + ("0" + todayDate.getHours()).slice(-2) + ":" +
                       ("0" + todayDate.getMinutes()).slice(-2);

        return todayDate;
    };

    function logMessage(message){
      var auxArray = [];
      $scope.loggerData.push(getCurrentDate() + '# ' + 'root@synopticDemo> ' + message);
      if ($scope.loggerData.length % 13 == 0){
        for (var i=$scope.loggerData.length-1;i>=1;i--){
          auxArray[i] = $scope.loggerData[i+1];
        } 
        $scope.loggerData = auxArray.slice(0,12);
        $scope.loggerData.lenght = 0;
      }
      console.log(" logMessage is finishing");     
    };
  }) 

  .controller('svgBoxesCtrl', function($scope, dataServerService) {  
    $scope.serverData = new Array();
    $scope.$on('dataServerChanged', function(event, dataServerArray) {
      $scope.serverData = dataServerArray;
      $scope.$apply(function () {
        $scope.serverData = dataServerArray;
      });
    }); 
  })

  .controller('sumManagerCtrl', function($scope, dataServerService, calculator) {  
    $scope.timeInterval = 1000;
    $scope.loggerData = [];
    $scope.operationResults = [0,0,0,0,0,0,0,0];
    $scope.operationPercentages = [0,0,0,0,0,0,0,0];
    var totalOperations = 0;
    logMessage('Synoptic Sum server running at => http://localhost:8000/ CTRL + C to shutdown');
    logMessage('Initial interval => 1000ms');
    $scope.$on('randomsServerChanged', function(event, randomsServerArray) {
      calculator.performRandomOperation(randomsServerArray);
      totalOperations += 1;
      $scope.$apply(function () {
        
        //UpdateLogger
        logMessage('RandomA=> ' + randomsServerArray["randomA"]);
        logMessage('RandomB=> ' + randomsServerArray["randomB"]);
        logMessage('RandomC=> ' + randomsServerArray["randomC"]);
        logMessage('RandomD=> ' + randomsServerArray["randomD"]);
        logMessage('RandomE=> ' + randomsServerArray["randomE"]);
        logMessage('RandomF=> ' + randomsServerArray["randomF"]);
        
        // ProcessStatistics
        //Result mod 6
        var resultMod8 = calculator.getOperationResult() % 8;
        $scope.operationResults[resultMod8] += 1;
        // Recalculate percentages
        for (i=0;i<$scope.operationPercentages.length;i++){
          var percentage = Math.round(($scope.operationResults[i] / totalOperations) * 100);
          $scope.operationPercentages[i] = percentage;
        }
        $scope.operationPercentages.sort(function compareNumbers(a, b) {
          return a - b;
        });
      });
    });

    // The remote control
    $scope.updateInterval = function(timeInterval) {
      logMessage('timermeInterval = ' + timeInterval);
      logMessage('Synchronizing...');  
      $scope.timeInterval = timeInterval;
      this.stopPulling();
      this.startPulling();      
    };

    $scope.startPulling = function() {
      logMessage('Pulling data from server...');  
      $scope.timer = setInterval(this.refresh, $scope.timeInterval);
    };

    $scope.stopPulling = function() {
      logMessage('Stopping simulation...');  
      clearInterval($scope.timer);
    };  

    $scope.refresh = function() {  
      dataServerService.pullRandomsFromServer();
    };

    function getCurrentDate() {
        // Today date time which will used to set as default date.
        var todayDate = new Date();
        todayDate = todayDate.getFullYear() + "-" +
                       ("0" + (todayDate.getMonth() + 1)).slice(-2) + "-" +
                       ("0" + todayDate.getDate()).slice(-2) + " " + ("0" + todayDate.getHours()).slice(-2) + ":" +
                       ("0" + todayDate.getMinutes()).slice(-2);

        return todayDate;
    };

    function logMessage(message){
      var auxArray = [];
      $scope.loggerData.push(getCurrentDate() + '# ' + 'root@synopticDemo> ' + message);
      if ($scope.loggerData.length % 13 == 0){
        for (var i=$scope.loggerData.length-1;i>=1;i--){
          auxArray[i] = $scope.loggerData[i+1];
        } 
        $scope.loggerData = auxArray.slice(0,12);
        $scope.loggerData.lenght = 0;
      }
    };
  })

  .controller('svgSumCtrl', function($scope, calculator) {  
    $scope.operation = [];
    $scope.resultMod8 = 0;
    $scope.operation['A']=0; $scope.operation['B']=0; $scope.operation['C']=0;
    $scope.operation['D']=0; $scope.operation['E']=0; $scope.operation['F']=0;
    $scope.operation['resultAB']=0; $scope.operation['resultCD']= 0; $scope.operation['resultEF']=0; $scope.operation['result']=0;     
    $scope.$on('operationPerformed', function(event, operationPerformed) {
      $scope.$apply(function () {
        $scope.operation = operationPerformed;
        $scope.resultMod8 = calculator.getOperationResult() % 8;
      });
    }); 
  })

  .directive('svgBoxes', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/svgs/boxes.svg'
    };
  })

  .directive('boxesDescription', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/templates/boxes-description.html'
    };
  })

  .directive('boxesManager', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/templates/boxes-manager.html'
    };
  })

  .directive('svgSum', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/svgs/sumTest.svg'
    };
  })

  .directive('sumDescription', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/templates/sum-description.html'
    };
  })

  .directive('sumManager', function() {
    return {
      restrict: 'E',
      templateUrl: '/app/templates/sum-manager.html'
    };
  })

  .directive('backgroundImage', function () {
    return function (scope, element, attrs) {
      element.css({
        'background-image': 'url(' + attrs.backgroundImage + ')',
        'background-size': 'cover',
        'background-repeat': 'no-repeat',
        'background-position': 'center center'
      });
    };
  });
