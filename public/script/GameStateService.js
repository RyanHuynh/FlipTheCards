app.service('GameStateService', function($rootScope, $timeout, StatService){

	/********************************
	 *			VARIABLES	    	*
	 ********************************/

	var _currentState = 1;
	var _comparedCardValue = "";
	var _comparedCardIndex = "";
	var _matchedPairCount = 8;
	var _clickEventLocked = false;
	var _endGame = false;
	var _cardFlipDelay;
	var setState = function(newState){
		_currentState = newState;
	}

	 /*******************************
	 *		   MAIN FUNCTIONS	    *
	 ********************************/

	//Update and handle logic when card is flipped.
	this.updateState = function(cardIndex, cardValue){
		if(_currentState == 1){
            _setComparedCard(cardIndex, cardValue);
            setState(2);
            StatService.updateClick();
        }
        else if(_currentState == 2){
        	//If not the same card clicked previously
			if(_comparedCardIndex != cardIndex)
			{
				var comparedCard = angular.element(document.querySelector("card[index='" + _comparedCardIndex + "']"));
                var currentCard = angular.element(document.querySelector("card[index='" + cardIndex + "']"));
			    StatService.updateClick();
			    if(_comparedCardValue == cardValue){
			        _matchedPairCount--;

			        //Disable clicked on matched pair.
			        comparedCard.off('click');
			         currentCard.off('click');

                    //
                    if(_matchedPairCount == 0){
                    	_endGame = true;
                    	$rootScope.$apply();
                    	StatService.updateEndGameStat();
                    }
                    else{
                    	//Reset back to state 1
                    	_comparedCardValue = "";
						_comparedCardIndex = "";
						setState(1);
                    }
			    }
			    else
			   	{    
			   		//Not matching, reset everything flipped both cards back and back to state 1.
			   		//Delay: to make sure the card is flipped up for 1.5s
			   		_clickEventLocked = true;
			   		_cardFlipDelay = $timeout(function(){
				   		comparedCard.removeClass('flipped');
				   		currentCard.removeClass('flipped');
				   		_comparedCardValue = "";
						_comparedCardIndex = "";
						setState(1);
						_clickEventLocked = false;
					}, 1500);
			    }
			}
		}
	}

	//Save the current compared card.
	var _setComparedCard = function(index, value){
		_comparedCardValue = value;
		_comparedCardIndex = index;
	}

	//Check to see if click event is locked.
	this.isClickEventLocked = function(){
		return _clickEventLocked;
	}

	//Lock click event.
	this.lockClickEvent = function(flag){
		_clickEventLocked = flag;
	};

	//Reset game state when new game is created
	this.reset = function(){
		_comparedCardValue = "";
		_comparedCardIndex = "";
		_currentState = 1;
		_clickEventLocked = false;
		_matchedPairCount = 8;
		_endGame = false;
		$timeout.cancel(_cardFlipDelay);
	};

	//Signal Controller that the game is ended (ia $watch)
	this.isGameEnd = function(){
		return _endGame;
	}

	
});