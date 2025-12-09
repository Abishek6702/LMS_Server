const express = require("express");
const {
  getYearSectionStats,
  getStudentsByDeptYearSection,
  getSectionSummaryByYearDept,
  changeStudentsSection,
} = require("../controllers/sectionController");

const router = express.Router();

router.get("/years", getYearSectionStats);
router.get("/students", getStudentsByDeptYearSection);
router.get("/summary", getSectionSummaryByYearDept);
router.post("/change", changeStudentsSection);

module.exports = router;
