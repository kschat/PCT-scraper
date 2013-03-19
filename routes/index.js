var fs = require('fs'),
	request = require('request'),
	scraper = require('scraper');
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
			course1: 'CIT160',
		},
	}, function(err, res, body) {
		fs.writeFile(__dirname + '/../views/classes.html', body, function(err) {
			if(err) { throw err; }
			else {
				console.log('saved');
				response.render('saved', { title: 'Filed saved' });
			}
		});
	});

	scraper(r);
};