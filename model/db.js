var mongoose = require('mongoose');

let connectionString = process.env.CONNECTION_STRING;
mongoose.connect(connectionString, function(err, db) {
    if (err) {
        console.log('Unable to connect to the server. Please start the server.', err);
    } else {
        console.log('Connected to Server successfully');
    }
});
