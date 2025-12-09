const User = require("../models/User");
const Faculty = require('../models/Faculty');
const { createUserLogin, getRoleFromDesignation } = require('../services/userCreator');
const { parseFacultyExcel } = require('../services/excelParser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });


const addFacultySingle = async (req, res) => {
  try {
    const facultyData = req.body;
    const role = getRoleFromDesignation(facultyData.designation);

    const faculty = new Faculty(facultyData);
    await faculty.save();
console.log("working1")
    // Create login
    await createUserLogin(
      `${facultyData.firstName} ${facultyData.lastName}`,
      facultyData.email,
      role,
      faculty._id,
      'Faculty'
    );
    console.log("working2")

    res.status(201).json({
      success: true,
      message: 'Faculty added successfully with login',
      data: faculty
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addFacultyExcel = async (req, res) => {
  try {
    const faculties = parseFacultyExcel(req.file.buffer);
    
    const results = [];
    for (let facultyData of faculties) {
      try {
        const role = getRoleFromDesignation(facultyData.designation);
        
        const faculty = new Faculty(facultyData);
        await faculty.save();

        await createUserLogin(
          `${facultyData.firstName} ${facultyData.lastName}`,
          facultyData.email,
          role,
          faculty._id,
          'Faculty'
        );

        results.push({ success: true, faculty });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Excel upload completed',
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: faculties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/faculty/:id
const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.json({ success: true, data: faculty });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/faculty/:id
const updateFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // [web:160][web:166]
    );
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    res.json({ success: true, message: "Faculty updated", data: faculty });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/faculty/:id
const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id); // [web:155]
    if (!faculty) {
      return res.status(404).json({ success: false, message: "Faculty not found" });
    }
    // delete linked login
    await User.deleteOne({
      userDetailId: faculty._id,
      userDetailModel: "Faculty"
    });
    res.json({ success: true, message: "Faculty deleted & login removed" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getEligibleHodAdmins = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ success: false, message: "department is required" });
    }

    const faculties = await Faculty.find({
      department,
      designation: { $ne: "hod" }   
    }).select("firstName lastName email designation department isAllocatedAdmin");

    res.json({ success: true, data: faculties });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const allocateHodAdmin = async (req, res) => {
  try {
    const { department, facultyId } = req.body;
    if (!department || !facultyId) {
      return res.status(400).json({
        success: false,
        message: "department and facultyId are required"
      });
    }

    // 1) Reset all in this department
    await Faculty.updateMany(
      { department },
      { $set: { isAllocatedAdmin: false } }
    );

    // 2) Set true for selected faculty (must be same dept, not real HOD)
    const updated = await Faculty.findOneAndUpdate(
      {
        _id: facultyId,
        department,
        designation: { $ne: "hod" }
      },
      { $set: { isAllocatedAdmin: true } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found in this department or is actual HOD"
      });
    }

    res.json({
      success: true,
      message: "HOD access allocated to faculty",
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getCurrentHodAdmin = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) {
      return res.status(400).json({ success: false, message: "department is required" });
    }

    const faculty = await Faculty.findOne({
      department,
      isAllocatedAdmin: true
    }).select("firstName lastName email designation department isAllocatedAdmin");

    res.json({
      success: true,
      data: faculty  // null if no one allocated yet
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addFacultySingle,
  addFacultyExcel,
  getAllFaculty,
  getFacultyById,
  updateFaculty,
  deleteFaculty,
  getEligibleHodAdmins,
  allocateHodAdmin,
  getCurrentHodAdmin

};
