// Dependencies
var express = require("express");
var {Pool} = require('pg');
var app = express();

// Server Port
var port = process.env.PORT || 8080;


// Heroku DB connection 
var connectionString = process.env.DATABASE_URL || "postgres://vekibicpuuxhkl:36e1e13b194f3377e312588f4dd9808cdb67008c08bc55f20a8de12f816457b1@ec2-54-197-232-203.compute-1.amazonaws.com:5432/df5pn8ffgdhg87?ssl=true";
var pool = new Pool({connectionString: connectionString});

// View Setup
app.use(express.static("public"));
app.set("views", "views");
app.set("view engine", "ejs");

//Routes
app.get("/", function(req, res){
    
    console.log("SERVER UP");
    res.write("WORKING");
    res.end();

});

app.get("/getExpenses", function(req, res) {
	
    var sql = "SELECT * FROM expenses";
    
    pool.query(sql, function(err, result){
       if (err){
           console.log("ERROR");
           console.log(err);
       }
        console.log(result.rows[0]);
        res.write("Query Successful");
        res.end();
    });
});

// Server Listening
app.listen(port, function() {
    console.log("The server is on port 8080");
});