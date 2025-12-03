const Student = require('../models/Student');
const User = require("../models/User");

const { createUserLogin } = require('../services/userCreator');
const { parseStudentExcel, allocateStudentSections } = require('../services/excelParser');

const addStudentSingle = async (req, res) => {
  try {
    const studentData = req.body;

    const student = new Student(studentData);
    await student.save();

    // Create login
    await createUserLogin(
      `${studentData.firstName} ${studentData.lastName}`,
      studentData.email,
      'student',
      student._id,
      'Student'
    );

    res.status(201).json({
      success: true,
      message: 'Student added successfully with login',
      data: student
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addStudentExcel = async (req, res) => {
  try {
    const students = parseStudentExcel(req.file.buffer);
    
    const results = [];
    for (let studentData of students) {
      try {
        const student = new Student(studentData);
        await student.save();

        await createUserLogin(
          `${studentData.firstName} ${studentData.lastName}`,
          studentData.email,
          'student',
          student._id,
          'Student'
        );

        results.push({ success: true, student });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    // only successful students
    let successfulStudents = results
      .filter(r => r.success)
      .map(r => r.student);

    // sort by name alphabetically (firstName + lastName)
    successfulStudents.sort((a, b) => {
      const nameA = (a.firstName + " " + a.lastName).toLowerCase();
      const nameB = (b.firstName + " " + b.lastName).toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    // allocate sections on sorted list
    await allocateStudentSections(successfulStudents);
    
    res.json({
      success: true,
      message: 'Excel upload completed with section allocation',
      results,
      sectionStats: {
        A: results.filter(r => r.success && r.student.section === 'A').length,
        B: results.filter(r => r.success && r.student.section === 'B').length,
        unallocated: results.filter(r => r.success && r.student.section === 'unallocated').length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: students
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
// GET /api/students/:id
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.json({ success: true, message: "Student updated", data: student });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    await User.deleteOne({
      userDetailId: student._id,
      userDetailModel: "Student"
    });
    res.json({ success: true, message: "Student deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};



module.exports = {
  addStudentSingle,
  addStudentExcel,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent
};
