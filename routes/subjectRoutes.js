const express = require('express');
const { superAdminAuth } = require('../middleware/auth');
const {
  addSubjectSingle,
  addSubjectsMultiple,
  getAllSubjects, getSubjectById,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectController');
const { parseSubjectExcel } = require("../services/excelParser");
const multer = require("multer");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/single', addSubjectSingle);
router.post("/excel-upload", upload.single("excel"), addSubjectsMultiple);
router.get('/', getAllSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
