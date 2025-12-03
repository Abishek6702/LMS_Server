const Subject = require('../models/Subject');
const { parseSubjectExcel } = require("../services/excelParser");
const addSubjectSingle = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    res.status(201).json({
      success: true,
      message: 'Subject added successfully',
      data: subject
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addSubjectsMultiple = async (req, res) => {
  try {
    console.log("Uploaded subject file:", req.file);

    const subjectsData = parseSubjectExcel(req.file.buffer);
    const results = [];

    for (let subjectData of subjectsData) {
      try {
        const subject = new Subject(subjectData);
        await subject.save();
        results.push({ success: true, subject });
      } catch (err) {
        results.push({ success: false, error: err.message });
      }
    }

    res.json({
      success: true,
      message: "Subjects added successfully from Excel",
      results
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ createdAt: -1 });
    res.json({
      success: true,
      data: subjects
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// GET /api/subjects/:id
const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, message: "Subject updated", data: subject });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }
    res.json({ success: true, message: "Subject deleted" });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  addSubjectSingle,
  addSubjectsMultiple,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject
};
