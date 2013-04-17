var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var DaySchema = new Schema({
	days: {
		type: String,
		required: true
	},
	times: {
		type: String,
		required: true
	},
	location: {
		type: String,
		required: true
	}
});

var Day = mongoose.model('Day', DaySchema);

module.exports = Day;