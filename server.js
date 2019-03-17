var express = require("express");
var app = express();
var port = process.env.PORT || 8080;

app.get("/", function(req, res) {
	
	res.write("Nigga we made it");
    res.end();
});

app.listen(port, function() {
    console.log("The server is on port 8080");
});