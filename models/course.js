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

var courseSchema = new Schema({
	courseNumber: {
		type: String,
		required: true
	},
	section: {
		type: String,
		required: true
	},
	courseTitle: {
		type: String,
		required: true
	},
	instructor: {
		type: String,
		required: true
	},
	days: {
		type: [DaySchema],
		required: true
	},
	credits: {
		type: String,
		required: true
	},
	seats: {
		type: Number,
		required: true
	}
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;