var express = require("express");

var app = express();

// Set the port of our application
// process.env.PORT lets the port be set by Heroku
var PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'))

var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

var mysql = require("mysql");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "burgers_db"
});

connection.connect(function (err) {
    if (err) {
        console.error("error connecting: " + err.stack);
        return;
    }

    console.log("connected as id " + connection.threadId);
});

// Use Handlebars to render the main index.html page with the movies in it.
app.get("/", function (req, res) {
    var burgers = [];
    var dburgers = [];
    connection.query("SELECT * FROM burgers;", function (err, data) {
        if (err) {
            return res.status(500).end();
        }
        for (var i = 0; i < data.length; i++) {
            if (data[i].devoured) {
                dburgers.push(data[i]);
            } else {
                burgers.push(data[i]);
            }
        }

        res.render("index", { burgers: burgers, dburgers:dburgers });
    });
});

// Create a new burger
app.post("/", function (req, res) {
    connection.query("INSERT INTO burgers (burger_name) VALUES (?)", req.body.burger_name, function (err, result) {
        if (err) {
            return res.status(500).end();
        }

        // Send back the ID of the new burger
        res.json({ id: result.insertId });
        console.log({ id: result.insertId });
    });
});

//Devour a burger
app.put("/", function (req, res) {
    console.log(req.body.id)
    connection.query("UPDATE burgers SET devoured = true WHERE id = ?", req.body.id, function (err, result) {
        if (err) {
            // If an error occurred, send a generic server failure
            return res.status(500).end();
        }
        else if (result.changedRows === 0) {
            // If no rows were changed, then the ID must not exist, so 404
            return res.status(404).end();
        }
        res.status(200).end();
        console.log(result.changedRows);
    });
});


// Start our server so that it can begin listening to client requests.
app.listen(PORT, function () {
    // Log (server-side) when our server has started
    console.log("Server listening on: http://localhost:" + PORT);
});
