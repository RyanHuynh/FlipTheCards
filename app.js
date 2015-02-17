
//Import dependences
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

//Initialze app
var app = express();
var router = express.Router();
var port = process.env.PORT || 3000;
mongoose.connect('mongodb://localhost:27017/card-collections');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());

//Define schema for our theme model.
var Schema = mongoose.Schema;
var ThemeSchema = new Schema({
	data : [{id: Number,  value : String , background : String, count: Number }]
});
				
//Define our API
app.use('/api', router);
router.route('/themes/:theme_type/:theme_index')
	.get(function(req, res){
		//Set theme type to correct model
		var Theme = mongoose.model(req.params.theme_type, ThemeSchema);
		//Get total entries in collection
		var totalEntries = 0;
		Theme.count({},function(err,count){
			if(err)
				res.send(err);
			totalEntries = count;

			Theme.find(function(err, themes){
			if(err){
				res.send(err);
			}
			var randomIndex = 1;
			do {
				randomIndex = Math.floor(Math.random() * totalEntries);
			} while ( randomIndex == req.params.theme_index);
			var result = { theme : themes[randomIndex].data, themeIndex : randomIndex};
			res.json(result); 
			});
		});
	});

//Assign port for our app.
app.listen(port);
console.log('App is listening in port ' + port);

