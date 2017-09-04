require('dotenv').config()
const express = require('express');
const scraper = require('./scraper.js');
const schedule = require('node-schedule');

require('./model/model.js');
const db = require('./model/db');
const app = express();

app.get('/scrap', function(req, res) {
    let year = (new Date()).getFullYear();
    if (req.query.year) {
        let queryYear = parseInt(req.query.year);
        if (isNaN(queryYear)) {
            return res.status(400).send();
        }
        year = queryYear;
    }      
    scraper.start(year);
    res.status(200).send('Scraper started!');
});
 
// run scraper every day at 00:00
const task = schedule.scheduleJob('0 0 0 * * *', function(){
    let year = (new Date()).getFullYear();
    scraper.start(year);
});

app.listen(3001, function () {
  console.log('Scraper running on port 3001');
})