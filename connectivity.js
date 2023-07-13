var mysql = require("mysql");

var connectionConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "travel"
};

var con = mysql.createConnection(connectionConfig);

con.connect(function(err) {
  if (err) {
    console.error("Error connecting to the database: " + err.stack);
    return;
  }

  console.log("Connected to the database as id " );

 
});
module.exports=con;