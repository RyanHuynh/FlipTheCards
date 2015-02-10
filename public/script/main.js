

var app = angular.module('myApp' , ['ngAnimate']);

app.controller('mainCtrl', function($scope,$compile,$http, GameControlService, GameStateService){

    $scope.service = GameStateService;
    //Default gane setting
    var timerDuration = 1000;
    var hasTimer = "false";
    var previousThemeIndex = 1;
    var cardChildScope;
    
    var _constructNewDeck = function(){
        var gameModeUsed = GameControlService.getGameMode();
        var previousThemeIndex = GameControlService.getPreviousThemeIndex();
        $http.get('api/themes/' + gameModeUsed + '/' + previousThemeIndex)
            .success(function(data){
                $scope.currentDeck = [];
                var selectedDeck = data.theme;
                previousThemeIndex = data.themeIndex;
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

                //Attach new game to game box.
                var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
                var newDeck = angular.element("<card ng-repeat='card in currentDeck' class='squareBox' data='card' index='{{ $index }}' />");

                //Flipped all card if Game mode is "Shape"
                if(gameModeUsed == "Shape")
                    newDeck.addClass('flipped');
                cardChildScope = $scope.$new();
                gameBox.append($compile(newDeck)(cardChildScope)); 
                
            });
    }

    $scope.newGame = function(){
        //Reset game state.
        GameStateService.reset();

        //Clean up old game.
        var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
        if(cardChildScope)
            cardChildScope.$destroy();
        gameBox.empty();

        //Construct new deck.
        $scope.currentDeck = [];
       _constructNewDeck(); 

       GameControlService.gameStart();
       
    };
    $scope.newGame();

    $scope.$watch('service.isGameEnd()', function(newVal, oldVal){
        if(newVal == true){
            GameControlService.display("endGame");
        }
    });



});

app.directive('card', function(GameStateService){
    return {
        scope: {
            data : '=', 
            timer : '@'
        },
        template:  "<front style='background-image: url({{ data.cover }})'></front>" +
                    "<back></back>",
        link : function(scope, element, attrs){
            element.bind('click', function(){
                if(!GameStateService.isClickEventLocked()){
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
                GameControlService.setGameMode(attrs.value);
                element.parent().children().removeClass('modeClicked');
                element.toggleClass('modeClicked');
                scope.newGame();
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



