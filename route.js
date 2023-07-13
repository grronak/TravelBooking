const express = require('express');
const app = express();
const router = express.Router();
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser'); // Add body-parser dependency
const con = require('./connectivity');

app.set('views', path.join(__dirname, 'views')); 
app.use(bodyParser.urlencoded({ extended: true }));



var connectionPool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "travel"
});

router.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

router.post('/signup', function(req, res) {
  var firstName = req.body.firstName;
  var lastName = req.body.lastname; 
  var email = req.body.email;
  var password = req.body.password;

  // Create an object with the data
  const user = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    password: password
  };

  // Execute the SQL INSERT statement
  const sql = 'INSERT INTO user SET ?';
  connectionPool.query(sql, user, (err, result) => {
    if (err) {
      console.error('Error inserting data:', err);
      res.status(500).send('Error inserting data');
    } else {
      const userId = result.insertId; // Get the generated user ID

      // Pass the user ID to the bookings route
      res.redirect(`/bookings?userId=${userId}`);
    }
  });
});
router.get('/bookings', function(req, res) {
  const userId = req.query.userId; 

  res.render('_book', { userId: userId });
});

router.post('/bookings', function(req, res) {
  const name = req.body.name;
  const fromPlace = req.body['from-place'];
  const destination = req.body.destination;
  const numOfTravelers = req.body['no-of-travelers'];
  const numOfDays = req.body['no-of-days'];
  const userId = req.query.userId || req.body.userId; // Retrieve the user ID from the query parameter or the request body

  // Create a connection from the connection pool
  connectionPool.getConnection(function(err, connection) {
    if (err) {
      console.error('Error getting database connection:', err);
      res.status(500).send('Internal server error');
      return;
    }

    // Construct the SQL INSERT statement
    const sql = 'INSERT INTO _book (name, userid, from_place, destination, `number-of-days`, num_of_travelers) VALUES (?, ?, ?, ?, ?, ?)';
const values = [name, userId, fromPlace, destination, numOfTravelers, numOfDays];

    // Execute the SQL INSERT statement
    connection.query(sql, values, function(err, result) {
      connection.release(); // Release the database connection

      if (err) {
        console.error('Error inserting data:', err);
        res.status(500).send('Error inserting data');
      } else {
        res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Booking Saved</title>
          <style>
            /* CSS styles */
            body {
              font-family: Arial, sans-serif;
              background-color: #f2f2f2;
              text-align: center;
              padding: 20px;
            }

            h1 {
              color: #333333;
            }

            .success-message {
              background-color: #dff0d8;
              color: #3c763d;
              border: 1px solid #d6e9c6;
              padding: 10px;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1>Booking Saved</h1>
          <div class="success-message">Your booking has been saved successfully!</div>
          
        </body>
        </html>
      `);
      }
    });
  });
});


router.get('/table', function(req, res) {
  var id = req.query.userId; // Assuming userId is passed as a query parameter
  var sql = "SELECT * FROM _book WHERE userId = ?";
  
  // Execute the SQL query
  connectionPool.query(sql, [id], function(err, results) {
    if (err) {
      console.error('Error executing the query: ' + err.stack);
      res.status(500).send('Internal Server Error');
      return;
    }

    // Render the EJS template with the fetched data
    res.render('table', { data: results });
  });
});
router.get('/delete-book', function(req, res) {
  const bookId = req.query.id; // Assuming you pass the book ID as a query parameter

  const sql = 'DELETE FROM _book WHERE id = ?';

  connectionPool.query(sql, [bookId], function(error, results) {
    if (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ message: 'Failed to delete book' });
    } else {
      // res.redirect('/table');
       res.render('table', { data: results });

    }
  });
});

router.get('/update-book', function(req, res) {
  const bookId = req.query.id; // Assuming you pass the book ID as a query parameter

  const sql = 'SELECT * FROM _book WHERE id = ?';

  connectionPool.query(sql, [bookId], function(error, results) {
    if (error) {
      console.error('Error retrieving book:', error);
      res.status(500).json({ message: 'Failed to retrieve book' });
    } else {
      // Render the update.ejs template with the result data
      res.render('update', { book: results[0] });

    }
  });
});

router.post('/update-book', function(req, res) {
  const bookId = req.body.id;


  const sql = 'UPDATE _book SET name = ?, from_place = ?, destination = ?, num_of_travelers = ?, `number-of-days` = ? WHERE id = ?';
  
  const name = req.body.name;
    const fromPlace = req.body['from-place'];
    const destination = req.body.destination;
    const numOfTravelers = req.body['no-of-travelers'];
    const numOfDays = req.body['no-of-days'];
const values = [name, fromPlace, destination, numOfTravelers, numOfDays, bookId];

  connectionPool.query(sql, values, function(error, results) {
    if (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ message: 'Failed to update book' });
    } else {
      // Fetch the updated data from the database
      const fetchSQL = 'SELECT * FROM _book WHERE id = ?';
      connectionPool.query(fetchSQL, [bookId], function(error, updatedData) {
        if (error) {
          console.error('Error fetching updated data:', error);
          res.status(500).json({ message: 'Failed to fetch updated data' });
        } else {
          // Pass the updated data to the 'table.ejs' template
          res.render('table', { data: updatedData });
        }
      });
    }
  });
});


router.post('/login', function(req, res) {
    const email = req.body.email;
    const password = req.body.password;
  
    // Execute the SQL SELECT statement
    const sql = 'SELECT * FROM user WHERE email = ?';
    connectionPool.query(sql, [email], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
  
      if (results.length === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      const user = results[0];
  
      if (user.password !== password) {
        res.status(401).json({ error: 'Invalid password' });
        return;
      }
  
      // Successful login
      // res.status(200).json({ message: 'Login successful' });
      // res.sendFile(path.join(__dirname, '_book.html'));
      const userId = user.id;

    // Pass the user ID to the bookings route
    res.redirect(`/bookings?userId=${userId}`);
  
    });
  });

 
  app.use(router);
module.exports = router;
