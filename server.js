// Dependencies
var express = require("express");
var {Pool} = require('pg');
var app = express();
var bodyParser = require("body-parser");

// Server Port
var port = process.env.PORT || 8080;


// Heroku DB connection 
var connectionString = process.env.DATABASE_URL || "postgres://vekibicpuuxhkl:36e1e13b194f3377e312588f4dd9808cdb67008c08bc55f20a8de12f816457b1@ec2-54-197-232-203.compute-1.amazonaws.com:5432/df5pn8ffgdhg87?ssl=true";
var pool = new Pool({connectionString: connectionString});

// View Setup
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", "views");
app.set("view engine", "ejs");

//Globals
var userID;
var budgetID;

// Routes
app.get("/", function(req, res){
    
    console.log("SERVER UP");
    res.render("login");

});

app.get("/newUser", function(req, res){
    
    res.render("newUser");

});

app.post("/postNewUser", function(req, res){
    
    var username = req.body.username;
    var password = req.body.password;
    
    var sq = "\'";
    var sql = "INSERT INTO users (username, pass) values (" + sq + username + sq + ", " + sq + password + sq + ")";
    //console.log("Sending Query: " + sql);
    
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
    });
    res.render("postNewUser");

});

app.get("/dash", function(req, res){
    
    var sql = "SELECT budget_id FROM budgets WHERE user_id = " + userID;
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        if(result.rowCount > 0){
            var ids = "";
            for (var i = 0; i < result.rowCount; i++){
                ids += result.rows[i].budget_id + " ";
            }
            console.log(ids);
            var params = {budgets: ids};
            res.render("dash", params);
        }
        else {
            var params = {budgets: "None"};
            res.render("dash", params);
        }
        
    });
});

app.post("/verify", function(req, res){
    
    var username = req.body.username;
    var password = req.body.password;
    
    var sq = "\'";
    var sql = "SELECT user_id FROM users WHERE username =" + sq + username + sq + "AND pass =" + sq + password + sq;
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
            res.render("error");
        };
        if (result.rowCount > 0){
            userID = result.rows[0].user_id;
            res.render("loginSuccess");
        }
        else
            res.render("error");
    });
});

app.get("/newBudget", function(req, res){
    
    res.render("newBudget");

});

app.post("/expenses", function(req, res){
    
    var yearly = Number(req.body.yrly);
    var fedTax = Number(req.body.fed);
    var staTax = Number(req.body.stt);
    var med = Number(req.body.med);
    var ssc = Number(req.body.ssc);
    var totalDeductions = fedTax + staTax + med + ssc;
    var monthly = (yearly/12) - totalDeductions;
    var netYearly = monthly * 12;

    var sql = "INSERT INTO budgets (user_id, gross_income, total_deductions, net_yearly, net_monthly) values (" + userID + ", " + yearly + ", " + totalDeductions + ", " + netYearly + ", " + monthly + ")";
    
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        
        //Get Current Budget ID for Expense Tracking
        var sq = "\'";
        var sqlGet = "SELECT budget_id FROM budgets WHERE user_id = " + userID + "AND net_yearly = " + netYearly;
        pool.query(sqlGet, function(err, resultGet) {
        // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        budgetID = resultGet.rows[0].budget_id;
        console.log(budgetID);
        res.render("expenses");
        });
    });
});

app.post("/postExpenses", function(req, res){
    
    var rent = Number(req.body.rent);
    var car = Number(req.body.car);
    var ins = Number(req.body.ins);
    var gas = Number(req.body.gas);
    var phn = Number(req.body.phn);
    var food = Number(req.body.food);
    var util = Number(req.body.util);
    var ent = Number(req.body.ent);
    var tith = Number(req.body.tith);
    var tuit = Number(req.body.tuit);
    var totalExpenses = rent + car + ins + gas + phn + food + util + ent + tith + tuit;
    
    postNewExpense("Rent", rent);
    postNewExpense("Car", car);
    postNewExpense("Insurance", ins);
    postNewExpense("Gas", gas);
    postNewExpense("Phone", phn);
    postNewExpense("Food", food);
    postNewExpense("Utilities", util);
    postNewExpense("Entertainment", ent);
    postNewExpense("Tithing", tith);
    postNewExpense("Tuition", tuit);
    
    
    res.render("budgetSuccess");

});

app.get("/selectBudget", function(req, res){
    
    res.render("selectBudget");

});

app.post("/view", function(req, res){

    var budgetNum = Number(req.body.budgetId);
    var sql = "SELECT * FROM budgets WHERE user_id = " + userID + " AND budget_id = " + budgetNum;
    console.log(sql);
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        if(result.rowCount > 0){
            var params = {
                budgetId: result.rows[0].budget_id,
                grossIncome: result.rows[0].gross_income,
                totalDeductions: result.rows[0].total_deductions,
                netYearly: result.rows[0].net_yearly,
                netMonthly: result.rows[0].net_monthly
            };
            budgetID = Number(result.rows[0].budget_id);
            res.render("view", params);
        }
        else {
            res.render("selectBudget");
        }

    });

});

app.get("/viewExpenses", function(req, res){
    
    var sql = "SELECT * FROM expenses WHERE budget_id = " + budgetID;
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        if(result.rowCount > 0){
            var params = {};
            for (var i = 0; i < result.rowCount; i++){
                params[result.rows[i].expense_name] = result.rows[i].projected_cost;
            }
            res.render("viewExpenses", params);
        }
    });
});

app.get("/selectBudgetToDelete", function(req, res){
    
    res.render("selectBudgetToDelete");

});

app.post("/deleteBudget", function(req, res){

    var budgetNum = Number(req.body.budgetId);
    var sql = "DELETE FROM budgets WHERE budget_id =" + budgetNum + "AND user_id =" + userID;
    console.log(sql);
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
        res.render("deleteSuccess");

    });

});

// Server Listening
app.listen(port, function() {
    console.log("The server is on port 8080");
});

// Controller
function postNewExpense(name, expense){
    var sq = "\'";
    var sql = "INSERT INTO expenses (budget_id, expense_name, projected_cost, actual_cost) values (" + budgetID + ", " + sq + name + sq + ", " + expense + ", 0)";
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
    });
}

function getExpenses(){
    var sql = "SELECT * FROM expenses WHERE budget_id = 1";
    pool.query(sql, function(err, result) {
    // If an error occurred...
        if (err) {
            console.log("Error in query: ")
            console.log(err);
        };
    });
}