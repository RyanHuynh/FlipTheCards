var app = angular.module('myApp' , ['ngAnimate']);
app.controller('mainCtrl', function($scope,$compile,$http, GameControlService, GameStateService, StatService){

    $scope.service = GameStateService;
    //Default game setting
    var hasTimer = "false";
    var cardChildScope;
    $scope.chartShow = false;
    
    var _constructNewDeck = function(){
        var gameModeUsed = GameControlService.getGameMode();
        var previousThemeIndex = GameControlService.getPreviousThemeIndex();
        $http.get('api/themes/' + gameModeUsed + '/' + previousThemeIndex)
            .success(function(data){
                $scope.currentDeck = [];
                var selectedDeck = data.theme;
                var arraySize = selectedDeck.length;
                for(i = 0; i < 16; i++){
                    var cardCreated = false;
                    while(!cardCreated){
                        var randomIndex = Math.floor(Math.random() * arraySize);
                        var newCard = selectedDeck[randomIndex];
                        if(newCard.count > 0){
                            newCard.count--;
                            cardCreated = true;
                            $scope.currentDeck.push({ value : newCard.value, cover: newCard.background });
                        }
                    }
                }
                //Set previous theme index to avoid loading same themes in a row.
                GameControlService.setPreviousThemeIndex(data.themeIndex);

                //Attach new game to game box.
                var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
                var newDeck = angular.element("<card ng-repeat='card in currentDeck' class='squareBox' data='card' index='{{ $index }}' />");

                cardChildScope = $scope.$new();
                gameBox.append($compile(newDeck)(cardChildScope)); 
                
            });
    }

    $scope.newGame = function(){
        if(!GameControlService.isGameLocked()){
            //Lock game after create new game to prevent overloaded databse request.
            GameControlService.lockGame(true);
            
            //Reset game state.
            GameStateService.reset();

            //Kill old timer if existed.
            GameControlService.killTimer();

            //Clean up old game.
            var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
            if(cardChildScope)
                cardChildScope.$destroy();
            gameBox.empty();

            //Construct new deck.
            $scope.currentDeck = [];
           _constructNewDeck(); 
            
            GameControlService.display("loading");

            setTimeout(function(){
                GameControlService.gameStart();
                GameControlService.lockGame(false);
            }, 1500);
        } 
    };
    $scope.newGame();

    $scope.$watch('service.isGameEnd()', function(newVal, oldVal){
        if(newVal == true){
            GameControlService.display("endGame");
        }
    });

    $scope.showStat = function(){
        if(StatService.isValid()){
            var statBtn = angular.element(document.querySelector("input[id='statSwitch']"));
            statBtn.toggleClass('statBtnOn');
            if($scope.chartShow){
                $scope.chartShow = false;
                StatService.hideStat();
            }
            else{
                $scope.chartShow = true;
               setTimeout(StatService.displayStat,1);
            }
        }else{
            GameControlService.display("statNotValid");
        }
    }

});

app.directive('card', function(GameStateService, GameControlService, StatService){
    return {
        scope: {
            data : '=', 
            timer : '@'
        },
        template:  "<front style='background-image: url({{ data.cover }})'></front>" +
                    "<back></back>",
        link : function(scope, element, attrs){
            element.bind('click', function(){
                if(!GameStateService.isClickEventLocked() && !GameControlService.isGameLocked()){
                    //console.log("Inside lock");
                    element.addClass('flipped');
                    GameStateService.updateState(attrs.index, scope.data.value);
                
                }
            }); 
        }
    }
});



app.directive('mode', function(GameControlService){
    return{
        link: function(scope, element,attrs){
            element.bind('click', function(){
                if(!GameControlService.isGameLocked()){
                    GameControlService.setGameMode(attrs.value);
                    element.parent().children().removeClass('modeClicked');
                    element.toggleClass('modeClicked');
                    scope.newGame();
                }
            });
        }
    }
});

app.directive('squareBox', function($window){
    return{
        restrict: 'C',
        link: function(scope, element){
            var style = $window.getComputedStyle(element[0], null);
            var width = style.getPropertyValue('width');
            element.css('height', width);
        }
    }
});

app.directive('parentHeight', function(){
    return{
        restrict: 'C',
        link: function(scope, element){
            var width = element.parent()[0].offsetHeight - 8;
            var height = width;
            element.css('height', height + 'px');
        }
    }
});



