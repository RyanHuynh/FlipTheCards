app.service('GameControlService', function($http, $timeout, GameStateService){

	/********************************
	 *			VARIABLES	    	*
	 ********************************/
	 
	 var _gameModeUsed = "Identical";
	 var _previousThemeIndex = 0;
	 var _timerDuration = 10;
	 var _timeoutPromise;

	 /*******************************
	 *		GET FUNCTIONS	    	*
	 ********************************/
	 
	 //Return game mode currently used.
	 this.getGameMode = function(){
	 	return _gameModeUsed;
	 }

	 //Return previous theme index (to avoid 2 same theme in a row.)
	 this.getPreviousThemeIndex = function(){
	 	return _previousThemeIndex;
	 }
	 //Set the new game mode.
	 this.setGameMode = function(newGameMode){
	 	_gameModeUsed = newGameMode;
	 	_display(_gameModeUsed + '_mode');
	 }
	 
	var newGameReady = true;
    var timerActivated = false;
   
    var _display = this.display = function(textType){
		var displayBox = angular.element(document.querySelector("div[id='displayBox']"));
		displayBox.empty();
		if(textType == "endGame"){
			displayBox.append("<h1>Excellent !! </h1>");
		}
		else if(textType == "Identical_mode")	{
			displayBox.append("<h1>Mirror Images</h1>");
		}
		else if(textType == "Name_mode")	{
			displayBox.append("<h1>Name that image mode:</h1>");
		}
		else if(textType == "Shape_mode")	{
			displayBox.append("<h1>Shape to shape mode:</h1>");
		}

	}

	this.gameStart = function(){
		//Deactivate old timer if exists.
		if(_timeoutPromise)
			$timeout.cancel(_timeoutPromise);
		if(_gameModeUsed == "Shape"){
			_activateTimer(_timerDuration);
		}
		else
			_display(_gameModeUsed + '_mode');
	};

	var _activateTimer = function(duration){
		//Lock click event on card
		GameStateService.lockClickEvent(true);
		var _duration = duration;
		// alert(_duration);
		var displayBox = angular.element(document.querySelector("div[id='displayBox']"));
		var countDown = function(){
			displayBox.empty();
			displayBox.append("<h2>"  + _duration + "</h2>");
			if(_duration > 0){
				_duration--;
				_timeoutPromise = $timeout(countDown, 1000);
			}
			else
			{
				var cards = angular.element(document.querySelector("div[id='gameBox']")).children();
				cards.removeClass('flipped');
				GameStateService.lockClickEvent(false);
				_display('Shape_mode');
			}

		}
		countDown();
	};
});