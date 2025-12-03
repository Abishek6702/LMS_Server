const XLSX = require('xlsx');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');

const parseFacultyExcel = (buffer) => {
  if (!buffer) {
    throw new Error('No file buffer received in parseFacultyExcel');
  }

  const workbook = XLSX.read(buffer, { type: 'buffer' });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No sheets found in uploaded Excel file');
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  if (!worksheet) {
    throw new Error('Worksheet not found in Excel file');
  }

  return XLSX.utils.sheet_to_json(worksheet);
};

const parseStudentExcel = (buffer) => {
  if (!buffer) {
    throw new Error('No file buffer received in parseStudentExcel');
  }

  const workbook = XLSX.read(buffer, { type: 'buffer' });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error('No sheets found in uploaded Excel file');
  }
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error('Worksheet not found in Excel file');
  }
  return XLSX.utils.sheet_to_json(worksheet);
};

const parseSubjectExcel = (buffer) => {
  if (!buffer) {
    throw new Error("No file buffer received in parseSubjectExcel");
  }

  const workbook = XLSX.read(buffer, { type: "buffer" });
  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("No sheets found in uploaded Excel file");
  }

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    throw new Error("Worksheet not found in Excel file");
  }

  // Each row must have: subjectCode, name, regulation, department, creditPoint
  return XLSX.utils.sheet_to_json(worksheet);
};

const allocateStudentSections = async (students) => {
  const SECTION_SIZE = 65;
  let sectionACount = 0;
  let sectionBCount = 0;

  for (let student of students) {
    if (sectionACount < SECTION_SIZE) {
      student.section = 'A';
      sectionACount++;
    } else if (sectionBCount < SECTION_SIZE) {
      student.section = 'B';
      sectionBCount++;
    } else {
      student.section = 'unallocated';
    }
    
    await Student.findByIdAndUpdate(student._id, { section: student.section });
  }
};

module.exports = { parseFacultyExcel, parseStudentExcel, allocateStudentSections,parseSubjectExcel };
