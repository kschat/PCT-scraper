var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var courseSchema = new Schema({
	courseNumber: {
		type: String,
		required: true,
	},
	section: {
		type: String,
		required: true,
	},
	courseTitle: {
		type: String,
		required: true,
	},
	instructor: {
		type: String,
		required: true,
	},
	days: {
		type: [],
		required: true,
	},
	times: {
		type: [],
		required: true,
	},
	location: {
		type: String,
		required: true,
	},
	credits: {
		type: String,
		required: true,
	},
	seats: {
		type: Number,
		required: true,
	},
});

var Course = mongoose.model('Course', courseSchema);

module.exports = Course;