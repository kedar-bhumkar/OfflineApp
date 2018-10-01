const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const dbPath = path.resolve(__dirname, 'offline.db')


// SQLite connection
function connectDB(){
	db = new sqlite3.Database(dbPath, (err) => {
	  if (err) {
		return console.error(err.message);
	  }
	  console.log('Connected to the on-disk SQlite database.');
	});
	 
	// close the database connection
	db.close((err) => {
	  if (err) {
		return console.error(err.message);
	  }
	  console.log('Close the database connection.');
	});
}

module.exports = {
		connectDB:connectDB
}


