var app = angular.module('myApp' , ['ngAnimate']);
app.controller('mainCtrl', function($scope,$compile,$http, GameControlService, GameStateService, StatService){

    $scope.service = GameStateService;
    
    //Default game setting
    var _cardChildScope;
    $scope.chartShow = false;
    
    //Construct new deck base on theme
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

                _cardChildScope = $scope.$new();
                gameBox.append($compile(newDeck)(_cardChildScope)); 
                
            });
    }

    //Generate new game.
    $scope.newGame = function(){
        if(!GameControlService.isGameLocked()){
            //Lock game after create new game to prevent overloaded database request.
            GameControlService.lockGame(true);
            
            //Turn off stat button.
            if($scope.chartShow){
                $scope.showStat();
            }

            //Reset game state.
            GameStateService.reset();

            //Kill old timer if existed (in Shape mode).
            GameControlService.killTimer();

            //Clean up old game.
            var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
            if(_cardChildScope)
                _cardChildScope.$destroy();
            gameBox.empty();

            //Construct new deck.
            $scope.currentDeck = [];
            _constructNewDeck(); 
            
            //Start loading game
            GameControlService.loadGame();

        } 
    };

    //Check to see if the game ended.
    $scope.$watch('service.isGameEnd()', function(newVal, oldVal){
        if(newVal == true){
            GameControlService.display("endGame");
        }
    });

    //Display stat when button is switched on.
    $scope.showStat = function(){

        //Disable stat switch when timer is running.
        if(!GameControlService.isStatDisabled()){
            var statBtn = angular.element(document.querySelector("input[id='statSwitch']"));
                statBtn.toggleClass('statBtnOn');
            if(StatService.isValid()){
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
                statBtn.toggleClass('statBtnOn');
            }
        }
    }

    //Initial run
     $scope.newGame();

});


/****************************************
 *          ELEMENT DIRECTIVE           *
 ****************************************/

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


/****************************************
 *          CSS DIRECTIVE           *
 ****************************************/
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

//Compute the height of controler box base on game box height ( to make them have sae height).
app.directive('controllerBoxHeight', function(GameControlService){
    return{
        restrict: 'C',
        link: function(scope, element){
            //Only need on desktop
            if(!GameControlService.isMobile()){
                var gameBox = angular.element(document.querySelector("div[id='gameBox']"));
                var width = gameBox[0].offsetWidth;
                var height = width - 60;
                element.css('height', height + "px");
            }
        }
    }
});

app.directive('btnHover', function(){
    return{
        restrict: 'C',
        link: function(scope, element){
            element.on('touchstart touchend', function(){
                console.log(1);
                element.toggleClass('hover');
            });
        }
    }
});


