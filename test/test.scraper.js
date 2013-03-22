var should = require('should'),
	scraper = require('scraper'),
	request = require('request'),
	$ = require('jquery');

var $row,
	req = {
	uri: 'http://localhost:3000'
};

describe('Course scraper', function() {
	before(function(done) {
		scraper(req, function(err, $) {
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

			//Then find the 3rd child in the table, since that's the first class
			$row = $($row).find('tr').eq(2);
			done();
		});
	});

	describe('Grabing course number', function() {
		it('should equal CIT160', function() {
			var linkText = $($row).find('td').first().text().trim();
			linkText = linkText.split(' ')[0];

			linkText.should.equal('CIT160', 'actually equals ' + linkText);
		});
	});

	describe('Grabing section number', function() {
		it('should equal 01', function() {
			var linkText = $($row).find('td').first().text().trim();
			linkText = linkText.split(' ')[1];

			linkText.should.equal('01', 'actually equals ' + linkText);
		});
	});

	describe('Grabing class title', function() {
		it('should equal Introduction to Programming', function() {
			var linkText = $($row).find('td').eq(1).text().trim();

			linkText.should.equal('Introduction to Programming', 'actually equals ' + linkText);
		});
	});

	describe('Grabing credit amount', function() {
		it('should equal 3.00', function() {
			var linkText = $($row).find('td').eq(2).text().trim();

			linkText.should.equal('3.00', 'actually equals ' + linkText);
		});
	});

	describe('Grabing days', function() {
		it('should equal Tue,Thr', function() {
			var linkText = $($row).find('td').eq(3).text().trim();

			linkText.should.equal('Tue,Thr', 'actually equals ' + linkText);
		});
	});

	describe('Grabing times', function() {
		it('should equal 2:00P.M. - 3:30P.M.', function() {
			var linkText = $($row).find('td').eq(4).text().trim();

			linkText.should.equal('2:00P.M. - 3:30P.M.', 'actually equals ' + linkText);
		});
	});

	describe('Grabing location', function() {
		it('should equal ATHS/E246', function() {
			var linkText = $($row).find('td').eq(5).text().trim();

			linkText.should.equal('ATHS/E246', 'actually equals ' + linkText);
		});
	});

	describe('Grabing instructor', function() {
		it('should equal LEETE, D', function() {
			var linkText = $($row).find('td').eq(6).text().trim();

			linkText.should.equal('LEETE, D', 'actually equals ' + linkText);
		});
	});

	describe('Grabing number of seats', function() {
		it('should equal 22', function() {
			var linkText = $($row).find('td').eq(7).text().trim();

			linkText.should.equal('22', 'actually equals ' + linkText);
		});
	});

	describe('Putting times into an array', function() {
		it('should contain 2 elements', function() {
			var linkText = $($row).find('td').eq(4).text().trim(),
				times = linkText.split('-');

			times.should.have.length(2);
		});

		it('should equal 2:00P.M. in the first element', function() {
			var linkText = $($row).find('td').eq(4).text().trim(),
				times = linkText.split(' - ');

			times[0].should.equal('2:00P.M.');
		});

		it('should equal 3:30P.M. in the second element', function() {
			var linkText = $($row).find('td').eq(4).text().trim(),
				times = linkText.split(' - ');

			times[1].should.equal('3:30P.M.');
		});
	});
});