app.service('GameControlService', function($http, $timeout, GameStateService, StatService){

	/********************************
	 *			VARIABLES	    	*
	 ********************************/
	 
	 var _gameModeUsed = "Identical";
	 var _previousThemeIndex = 0;
	 var _timerDuration = 10;
	 var _timeoutPromise;
	 var _gameLocked = false;

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
	 this.setPreviousThemeIndex = function(prevThemeIndex){
	 	_previousThemeIndex = prevThemeIndex;
	 }
	 //Check to see if the game is locked.
	 this.isGameLocked = function(){
	 	return _gameLocked;
	 }

	 //Lock game
	 this.lockGame = function(flag){
	 	_gameLocked = flag;
	 }
	 //Set the new game mode.
	 this.setGameMode = function(newGameMode){
	 	_gameModeUsed = newGameMode;
	 	_display(_gameModeUsed + '_mode');
	 }
	 
	var newGameReady = true;
    var timerActivated = false;
   
    var _display = this.display = function(textType){
		var displayTextBox = angular.element(document.querySelectorAll("div[id='gameText']"));
		displayTextBox.empty();
		if(textType == "endGame"){
			displayTextBox.append("<h3>Excellent</h3>");
		}
		else if(textType == "Identical_mode")	{
			displayTextBox.append("<h1><b>Mirror Images: </b><br > Find image pair that are identical to the each other. <br ><br ><b>Difficulty: </b>Easy</h1>");
		}
		else if(textType == "Name_mode")	{
			displayTextBox.append("<h1><b>Name that Image: </b><br > Find the text that match with image.<br ><br ><b>Difficulty: </b>Medium</h1></h1>");
		}
		else if(textType == "Shape_mode")	{
			displayTextBox.append("<h1><b>Shape to Shape: </b><br >Find pair of shapes that can match with each other.<br ><br ><b>Difficulty: </b>Extremely hard !!!</h1></h1>");
		}
		else if(textType == "loading") {
			displayTextBox.append("<h3>Loading</h3>");
		}
		else if(textType == "statNotValid") {
			displayTextBox.append("<h4>You must play at least one game before viewing stat.</h4>");
			setTimeout(function(){
				_display(_gameModeUsed + '_mode');
			},2000);
		}

	}

	this.gameStart = function(){
		if(_gameModeUsed == "Shape"){
			_activateTimer(_timerDuration);
			//Flipped all card.
            var newDeck = angular.element(document.querySelectorAll("card")); 
            newDeck.addClass('flipped');
		}
		else
			_display(_gameModeUsed + '_mode');
		StatService.resetStat();
		StatService.setGameMode();
	};

	var _activateTimer = function(duration){
		//Lock click event on card
		GameStateService.lockClickEvent(true);
		var _duration = duration;
		// alert(_duration);
		var displayTextBox = angular.element(document.querySelectorAll("div[id='gameText']"));
		var countDown = function(){
			displayTextBox.empty();
			displayTextBox.append("<h2>"  + _duration + "</h2>");
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

	this.killTimer = function(){
		if(_timeoutPromise){
			$timeout.cancel(_timeoutPromise);
		}

	}
});