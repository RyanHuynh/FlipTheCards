app.service('GameStateService', function($rootScope){
	var _currentState = 1;
	var _comparedCardValue = "";
	var _comparedCardIndex = "";
	var _matchedPairCount = 8;
	var _clickEventLocked = false;
	var _endGame = false;

	var setState = function(newState){
		_currentState = newState;
	}

	this.updateState = function(cardIndex, cardValue){
		if(_currentState == 1){
            _setComparedCard(cardIndex, cardValue);
            setState(2);
        }
        else if(_currentState == 2){
        	//If not the same card clicked previously
			if(_comparedCardIndex != cardIndex)
			{
				var comparedCard = angular.element(document.querySelector("card[index='" + _comparedCardIndex + "']"));
                var currentCard = angular.element(document.querySelector("card[index='" + cardIndex + "']"));
			    
			    if(_comparedCardValue == cardValue){
			        _matchedPairCount--;

			        //Disable clicked on matched pair.
			        comparedCard.off('click');
			         currentCard.off('click');

                    //
                    if(_matchedPairCount == 0){
                    	_endGame = true;
                    	$rootScope.$apply();
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
			   		setTimeout(function(){
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

	var _setComparedCard = function(index, value){
		_comparedCardValue = value;
		_comparedCardIndex = index;
	}

	this.isClickEventLocked = function(){
		return _clickEventLocked;
	}
	this.lockClickEvent = function(flag){
		_clickEventLocked = flag;
	};
	this.reset = function(){
		_comparedCardValue = "";
		_comparedCardIndex = "";
		_currentState = 1;
		_clickEventLocked = false;
		_matchedPairCount = 8;
		_endGame = false;
	};


	this.isGameEnd = function(){
		return _endGame;
	}

	
});