const express = require("express");
const {
  getStudentYearCounts,
  getDepartmentYearCounts,
  getFacultySummaryCounts,
  getDepartmentFacultyRanks
} = require("../controllers/reportController");

const router = express.Router();

router.get("/students/years", getStudentYearCounts);
router.get("/students/departments", getDepartmentYearCounts);
router.get("/faculty/summary", getFacultySummaryCounts);
router.get("/faculty/departments", getDepartmentFacultyRanks);

module.exports = router;
