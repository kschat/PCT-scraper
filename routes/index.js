var fs = require('fs'),
	request = require('request'),
	scraper = require('scraper'),
	$ = require('jquery'),
	mongoose = require('mongoose'),
	Course = require('../models/course');

mongoose.connect('mongodb://localhost/scheduler');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function callback () {
  console.log('open');
});
/*
 * GET home page.
 */

//Adds a endsWith function to the String prototype if one doesn't already exist.
if(typeof String.prototype.endsWith !== 'function') {
	String.prototype.endsWith = function(suffix) {
		return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
}

exports.index = function(req, res){
	res.render('classes');
};

exports.pullClasses = function(req, response) {
	var courseSelection = req.query.course ||  '',
	r = request({
		uri: 'https://as400sec.pct.edu/MSsearch/ais',
		method: 'POST',
		form: {
			process: 'search',
			year: '2013',
			semester: 'FALL',
			oca: 'OPEN',
			fmsbm: 'Submit',
			course1: courseSelection
		},
	}, function(err, res, body) {
		fs.writeFile(__dirname + '/../views/classes.html', body, function(err) {
			if(err) { throw err; }
			else {
				scraper('http://localhost:3000', function(err, $) {
					if(err) { throw err; }
					/*
					* Find the correct fucking table by, NOT checking its id attribute 
					* (thanks to the developer not using any), but by checking its fucking
					* cellpadding value. It turns out that the table I need is the only one
					* with a cellpadding of 3... 
					*/
					$('table').each(function() {
						if($(this).attr('cellpadding') === '3') {
							$row = $(this);
						}
					});
					
					//Get the first rows "altcol" class value
					var colClass = $($row).find('tr').eq(2).attr('class'),
						model = {
								courseNumber: '',
								section: '',
								courseTitle: '',
								credits: '',
								days: [],
								instructor: '',
								seats: 0
							};

					$($row).find('tr').each(function(index) {
						//We only want rows 3 and up
						if(index < 2) { return true; }
						
						//Cache the array of cells
						var td = $(this).find('td'),
							timeRegex = /^[0-9]+:[0-5][0-9](?:A.M.|P.M.|Noon)\s*-\s*[0-9]+:[0-5][0-9](?:A.M.|P.M.|Noon)$/,
							dayRegex = /^(?:[a-zA-Z]{3},?)+$/,
							colspan = td.first().attr('colspan'),
							times = [],
							days = [];

						//If the "altcol" class isn't the same we're not scraping the same class from the previous row
						if(colClass !== $(this).attr('class')) {
							var course = new Course(model);
							course.save(function(err, c) {
								if(err) { console.log(err); }
							});

							colClass = colClass.endsWith('1') 
								? colClass.substring(0, colClass.length-1) + '2' 
								: colClass.substring(0, colClass.length-1) + '1';

							model = {
								courseNumber: '',
								section: '',
								courseTitle: '',
								credits: '',
								days: [],
								instructor: '',
								seats: 0
							};
						}

						//If the colspan is 8 then we're at the footer
						if(colspan === '8') {
							//return false;
						}
						//If the colspan is 4 then the time is for the same day
						else if(colspan === '4') {
							if(times = timeRegex.exec(td.eq(1).text().trim())) {
								model.days[days.length-1].times.push(times[0].replace(/[ \s]+/g, ' '));
								model.days[days.length-1].location = td.eq(3).text().trim();
							}
						}
						//If the colspan is 3 then the time is for a different day
						else if(colspan === '3') {
							days = dayRegex.exec(td.eq(1).text().trim());
							times = timeRegex.exec(td.eq(2).text().trim());

							if(days && times) {
								model.days.push({
									days: days[0],
									location: td.eq(3).text().trim(),
									times: [
										times[0].replace(/[ \s]+/g, ' ')
									]
								});
							}
						}
						//Otherwise we're on the first "row" of the class and can grab the constant data
						else {
							model.courseNumber = td.first().text().trim().split(' ')[0];
							model.section = td.first().text().trim().split(' ')[1];
							model.courseTitle = td.eq(1).text().trim();
							model.credits = td.eq(2).text().trim();
							model.instructor = td.eq(6).text().trim();
							model.seats = td.eq(7).text().trim();

							model.days.push({
								days: td.eq(3).text().trim(),
								location: td.eq(5).text().trim(),
								times: [
									td.eq(4).text().trim().replace(/[ \s]+/g, ' ')
								]
							});
						}
					});

					console.log('saved');
					response.render('saved', { title: 'File saved' });
				});
			}
		});
	});
};