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

exports.index = function(req, res){
	res.render('classes');
};

exports.pullClasses = function(req, response) {
	var r = request({
		uri: 'https://as400sec.pct.edu/MSsearch/ais',
		method: 'POST',
		form: {
			process: 'search',
			year: '2013',
			semester: 'FALL',
			oca: 'OPEN',
			fmsbm: 'Submit',
			course1: 'MTH',
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
								times: [],
								location: '',
								instructor: '',
								seats: 0,
							};

					$($row).find('tr').each(function(index) {
						//We only want rows 3 and up
						if(index < 2) { return true; }
						
						//Cache the array of cells
						var td = $(this).find('td');

						//If the "altcol" class is the same, we're still scraping the same class from the previous row
						if(colClass === $(this).attr('class')) {
							var timeRegex = /^[0-9]+:[0-5][0-9](?:A.M.|P.M.|Noon)\s*-\s*[0-9]+:[0-5][0-9](?:A.M.|P.M.|Noon)$/,
								dayRegex = /^(?:[a-zA-Z]{3},?)+$/,
								times = [],
								days = [];

							//If the colspan is 4 then the time is for the same day
							if(td.first().attr('colspan') === '4') {
								if(times = timeRegex.exec(td.eq(1).text().trim())) {
									model.times.push(times[0]);
								}
							}
							//If the colspan is 3 then the time is for a different day
							else if(td.first().attr('colspan') === '3') {
								if(days = dayRegex.exec(td.eq(1).text().trim())) {
									model.days.push(days[0]);
								}
								if(times = timeRegex.exec(td.eq(2).text().trim())) {
									model.times.push(times[0]);
								}
							}
							//Otherwise we're on the first "row" of the class and can grab the constant data
							else {
								model.courseNumber = td.first().text().trim().split(' ')[0];
								model.section = td.first().text().trim().split(' ')[1];
								model.courseTitle = td.eq(1).text().trim();
								model.credits = td.eq(2).text().trim();
								model.days.push(td.eq(3).text().trim());
								model.times.push(td.eq(4).text().trim());
								model.location = td.eq(5).text().trim();
								model.instructor = td.eq(6).text().trim();
								model.seats = td.eq(7).text().trim();
							}
						}
						//Otherwise we have all the information for the current class and can save it.
						else {
							var course = new Course(model);
							course.save(function(err, c) {
								if(err) { console.log(err); }
								console.log(c);
							});

							model = {
								courseNumber: '',
								section: '',
								courseTitle: '',
								credits: '',
								days: [],
								times: [],
								location: '',
								instructor: '',
								seats: 0,
							};
						}
					});

					console.log('saved');
					response.render('saved', { title: 'Filed saved' });
				});
			}
		});
	});
};