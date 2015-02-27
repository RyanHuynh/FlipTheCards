//

app.service('StatService', function($timeout){

	/********************************
	 *			VARIABLES	    	*
	 ********************************/
	 
	var _minClicked = 16;
	var _totalClicked = 0;
	var _currentGameClicked = 0;
	var _gamePlayed = 0;
	var _AgamePlayed = 0;
	var _BgamePlayed = 0;
	var _CgamePlayed = 0;
	var _gameMode = "";
	var _showChartPromise;
	var _currentChartDisplay = 0;
	var _AgameClicked = 0;
	var _BgameClicked = 0;
	var _CgameClicked = 0;

	 /*******************************
	 *		   MAIN FUNCTIONS	    *
	 ********************************/

	//Update No of click in current game.
	this.updateClick = function(){
		_currentGameClicked++;
	};

	//Reset No click when new game is created.
	this.resetStat = function(){
		_currentGameClicked = 0;
	}

	//Update stat at end game.
	this.updateEndGameStat = function(){
		if(_gameMode == "Identical")
			_AgameClicked =_AgameClicked + _currentGameClicked;
		else if (_gameMode == "Name")
			_BgameClicked = _BgameClicked + _currentGameClicked;
		else
			_CgameClicked = _CgameClicked + _currentGameClicked;
		_totalClicked = _totalClicked + _currentGameClicked;
		_updateGamePlayed();
	}

	//Update game played.
	var _updateGamePlayed = function(){
		if(_gameMode == "Identical")
			_AgamePlayed++;
		else if (_gameMode == "Name")
			_BgamePlayed++;
		else
			_CgamePlayed++;
		_gamePlayed++;
	}

	//Calculate Overall Accuracyy Stat and redendered to screen.
	var _calculateOverallAcc = function(){
		var overallAcc = Math.floor(_minClicked * _gamePlayed / _totalClicked * 100 );
		var ctx = document.querySelector("canvas[id='overallChart']").getContext("2d");
		var inaccuracy = 100 - overallAcc;
		var data = [
		    {
		        value: overallAcc,
		        color:"#FFB300"
		    },
		    {
		        value: inaccuracy,
		        color: "#4DB8C9"
		    }
		];
		var options = { animation : false, 
						tooltipTemplate: "<%= value %>",
					    onAnimationComplete: function()
					    {
					    	var newSegment = [];
					    	var currentSegment = this.segments;
					    	for(i = 0; i < currentSegment.length - 1; i++){
					    		if (currentSegment[i].value != 0)
					    			newSegment.push(currentSegment[i]);
					    	}

					        this.showTooltip(newSegment, true);
					    },
   						tooltipEvents: [],
    					tooltipCaretSize: 0,
    					segmentStrokeColor : "#fff",
    					tooltipFillColor: "rgba(0,0,0,0)",
    					tooltipFontSize: 13
					};
		var myPieChart = new Chart(ctx).Pie(data, options);
	}

	//Calculate game played stat and rendered to screen.
	var _calculateGamePlayed = function(){
		var ctx = document.querySelector("canvas[id='gamePlayedChart']").getContext("2d");
		var data = [
		    {
		        value: _AgamePlayed,
		        color:"#FFB300",
		        highlight: "#FF5A5E"
		    },
		    {
		        value: _BgamePlayed,
		        color: "#4DB8C9",
		        highlight: "#5AD3D1"
		    },
		     {
		        value: _CgamePlayed,
		        color: "#DE1B1B",
		        highlight: "#5AD3D1"
		    }
		];
		var options = { animation : false, 
						tooltipTemplate: "<%= value %>",
					    onAnimationComplete: function()
					    {
					    	var newSegment = [];
					    	var currentSegment = this.segments;
					    	for(i = 0; i < currentSegment.length; i++){
					    		if (currentSegment[i].value != 0)
					    			newSegment.push(currentSegment[i]);
					    	}

					        this.showTooltip(newSegment, true);
					    },
   						tooltipEvents: [],
    					showTooltips: true,
    					tooltipCaretSize: 0,
    					scaleFontColor: "black",
    					scaleLineColor: "rgba(0,0,0,.1)",
    					tooltipFillColor: "rgba(0,0,0,0)"
					};
		var myPieChart = new Chart(ctx).Pie(data, options);
	}

	//Caculate Accuracy for each game mode and rendered to screen.
	var _calculateModeAcc = function(){
		var options = { animation : false, 
						tooltipTemplate: "<%= value %>",
					    onAnimationComplete: function()
					    {
					    	var newSegment = [];
					    	var currentSegment = this.segments;
					    	for(j = 0; j < currentSegment.length - 1; j++){
					    		if (currentSegment[j].value != 0)
					    			newSegment.push(currentSegment[j]);
					    	}

					        this.showTooltip(newSegment, true);
					    },
   						tooltipEvents: [],
    					tooltipCaretSize: 0,
    					tooltipFontSize: 12,
    					tooltipFillColor: "rgba(0,0,0,0)",
    					tooltipYPadding: 0,
    					tooltipYPadding: 0
					};
		var gamePlayedArray = [_AgamePlayed, _BgamePlayed, _CgamePlayed];
		var gameClickedArray = [_AgameClicked, _BgameClicked, _CgameClicked];
		var canvasModeArray = ["modeA", "modeB", "modeC"];
		for(i = 0; i < gamePlayedArray.length; i++){
			if(gamePlayedArray[i] != 0){
				var modeAcc = Math.floor(_minClicked * gamePlayedArray[i] / gameClickedArray[i] * 100 );
				var inaccuracy = 100 - modeAcc;
				var data =	[{
						        value: modeAcc,
						        color:"#FFB300"
						    },
						    {
						        value: inaccuracy,
						        color: "#4DB8C9"
						    }];
			    var ctx = document.querySelector("canvas[id='" + canvasModeArray[i] + "']").getContext("2d");
			    var chart = new Chart(ctx).Pie(data, options);
			}
		}

	}

	//Execute stat caculation routine.
	this.displayStat = function(){
		_calculateOverallAcc();
		_calculateGamePlayed();
		_calculateModeAcc();
		_showNextChart();
	}

	//Hide stat chart.
	this.hideStat = function(){
		$timeout.cancel(_showChartPromise);
		var statChart = angular.element(document.querySelector("div[id='statChart']"));
		statChart.children().removeClass('hide');
		_currentChartDisplay = 0;
	}

	//Get the current game mode.
	this.setGameMode = function(gameMode){
		_gameMode = gameMode;
	}

	//Display the next game stat chart.
	var _showNextChart = function(){
		var statChart = angular.element(document.querySelector("div[id='statChart']"));
		statChart.children().addClass('hide');
		_currentChartDisplay = _currentChartDisplay % 3 + 1;
		var nextChart = angular.element(document.querySelector("li[position='" + _currentChartDisplay + "']"));
		nextChart.removeClass('hide');
		_showChartPromise =  $timeout(_showNextChart, 5000);
	}

	//Check if displaying stat is allowed. (only valid is player played at least 1 game.)
	this.isValid = function(){
		return (_gamePlayed != 0) ? true : false;
	}
});








