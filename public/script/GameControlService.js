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
		var displayBox = angular.element(document.querySelectorAll("div[class='displayBox']"));
		displayBox.empty();
		if(textType == "endGame"){
			displayBox.append("<h3>Excellent</h3>");
		}
		else if(textType == "Identical_mode")	{
			displayBox.append("<h1><b>Mirror Images: </b><br > Find image pair that are identical to the each other. <br ><br ><b>Difficulty: </b>Easy</h1>");
		}
		else if(textType == "Name_mode")	{
			displayBox.append("<h1><b>Name that Image: </b><br > Find the text that match with image.<br ><br ><b>Difficulty: </b>Medium</h1></h1>");
		}
		else if(textType == "Shape_mode")	{
			displayBox.append("<h1><b>Shape to Shape: </b><br >Find pair of shapes that can match with each other.<br ><br ><b>Difficulty: </b>Extremely hard !!!</h1></h1>");
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
		var displayBox = angular.element(document.querySelectorAll("div[class='displayBox']"));
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