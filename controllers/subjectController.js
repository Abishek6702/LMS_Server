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

const filterSubjects = async (req, res) => {
  try {
    const { department, regulation, paperType, semester } = req.query;

    const filter = {};

    if (department) filter.department = department;
    if (regulation) filter.regulation = regulation;
    if (paperType) filter.paperType = paperType;
    if (semester) filter.semester = Number(semester); // cast to number

    const subjects = await Subject.find(filter).sort({ subjectCode: 1 });

    res.json({
      success: true,
      count: subjects.length,
      data: subjects
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// semester allocation edit unchek not worked
// const allocateSemesterToSubjects = async (req, res) => {
//   try {
//     const { semester, subjectIds } = req.body;

//     if (!semester || !Array.isArray(subjectIds) || subjectIds.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "semester and subjectIds array are required"
//       });
//     }

//     const sem = Number(semester);

//     const result = await Subject.updateMany(
//       { _id: { $in: subjectIds } },
//       { $set: { semester: sem } }
//     );

//     res.json({
//       success: true,
//       message: "Semester allocated to subjects",
//       modifiedCount: result.modifiedCount
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

const allocateSemesterFull = async (req, res) => {
  try {
    const { semester, department, regulation, paperType, subjectIds } = req.body;

    if (!semester || !department || !regulation || !paperType) {
      return res.status(400).json({
        success: false,
        message: "semester, department, regulation and paperType are required"
      });
    }

    const sem = Number(semester);
    const ids = Array.isArray(subjectIds) ? subjectIds : [];

    // 1) Clear semester for subjects of this combo currently in this sem but NOT selected now
    await Subject.updateMany(
      {
        department,
        regulation,
        paperType,
        semester: sem,
        _id: { $nin: ids }
      },
      { $set: { semester: null } }
    );

    // 2) Set semester for all selected subjects (if any)
    if (ids.length > 0) {
      await Subject.updateMany(
        { _id: { $in: ids } },
        { $set: { semester: sem } }
      );
    }

    res.json({
      success: true,
      message: "Semester allocation updated successfully"
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addSubjectSingle,
  addSubjectsMultiple,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  filterSubjects,
  // allocateSemesterToSubjects,
  allocateSemesterFull
};
