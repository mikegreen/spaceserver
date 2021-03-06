var http = require("http");
// var https = require("https");
var compression = require('compression');
var express = require('express');
var app = express();
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var db = require('./dbconfig_local');
var logger = require('./logger');
var config = require('./config');

app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

var server = app.listen(8001,"0.0.0.0", function() {
	var host = server.address().address
	var port = server.address().port

	var startTime = new Date().toISOString();
	console.log(startTime + " API listening http://%s:%s", host, port);
	logger.info(config.logType + "API startup at http://%s:%s", host, port );

});

app.get('/', function (req, res) {
	res.json({message: 'Nothing to see here'});
});

var querySpaces = 'select market, company, location_name, address_1, address_2, address_city, address_state, address_zip from spaces_staging;' ;

app.get('/spaces', function (req, res) {
   db.query(querySpaces, function (error, results, fields) {
	  if (error) {
	  	console.log("Error: ", error);// throw error;
	  	logger.error(config.logType, req.originalUrl, " error: ", error);
	  	res.status(500).json({error:error.message});
	  } else {
	  	// console.log(results[0].market);
	  	res.json(results);
	  	logger.info(config.logType, req.originalUrl, " success returned:", results.length);
	  }

	});
});

var queryMarkets = 'select market, count(company + location_name) as spaces_in_market from spaces_staging group by market order by market;' ;

app.get('/markets', function (req, res) {
   db.query(queryMarkets, function (error, results, fields) {
	  if (error) {
	  	console.log("Error: ", error);// throw error;
	  	logger.error(config.logType, req.originalUrl, " error: ", error);
	  	res.status(500).json({error:error.message});
	  } else {
		  var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
		  console.log(fullUrl);

		  for (i = 0; i < results.length; i++) {
		  	// console.log(results[i].market);
			results[i].marketSpacesLink = fullUrl + "/" + results[i].market;
		  }

	  	logger.info(config.logType, req.originalUrl, " success returned:", results.length);
		res.json(results);
	  }

	});
});

var queryMarket = 'select market, company, location_name, address_1, address_2, address_city, address_state, address_zip from spaces_staging where market = ?;' ;

app.get('/markets/:id', function (req, res) {
	query = mysql.format(queryMarket, req.params.id) ;  
	db.query(query, function (error, results, fields) {
	  if (error) {
	  	console.log("Error: ", error);// throw error;
	  	logger.error(config.logType, req.originalUrl, " error: ", error);
	  	res.status(500).json({error:error.message});
	  } else {
	  	logger.info(config.logType, req.originalUrl, " success returned:", results.length);
	  	res.json(results);	
	  }
	  
	});
});