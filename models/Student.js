const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  registerNumber: { type: String, required: true, unique: true },
  rollNumber: { type: String, unique: true },
  department: { type: String, required: true },
  year: { 
    type: String, 
    required: true, 
    enum: ["First Year", "Second Year", "Third Year", "Fourth Year"] 
  },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  section: { 
    type: String, 
    enum: ['A', 'B', 'unallocated'],
    default: 'unallocated'
  }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
