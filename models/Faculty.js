const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  salutation: String,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: String,
  dateOfBirth: Date,
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  qualification: String,
  workType: String,
  employeeId: { type: String, required: true, unique: true },
  joiningDate: Date,
  jobTitle: String,
  designation: { 
    type: String, 
    required: true,
    enum: ['hod', 'professor', 'assistant professor', 'associate professor', 'dean']
  },
  reportingManager: String,
  department: String,
  noticePeriod: String
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
