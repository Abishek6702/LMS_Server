const Student = require("../models/Student");
const Faculty = require("../models/Faculty");

// 1) total students + 1st/2nd/3rd/4th year
const getStudentYearCounts = async (req, res) => {
  try {
    const [total, first, second, third, fourth] = await Promise.all([
      Student.countDocuments({}),
      Student.countDocuments({ year: "First Year" }),
      Student.countDocuments({ year: "Second Year" }),
      Student.countDocuments({ year: "Third Year" }),
      Student.countDocuments({ year: "Fourth Year" })
    ]);

    res.json({
      success: true,
      data: { total, first, second, third, fourth }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// 2) department-wise 1st/2nd/3rd/4th year
const getDepartmentYearCounts = async (req, res) => {
  try {
    const { search } = req.query;

    const matchStage = {};

    // Apply department filter if search query exists
    if (search) {
      matchStage.department = { $regex: search, $options: "i" };
    }

    const agg = await Student.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { department: "$department", year: "$year" },
          count: { $sum: 1 }
        }
      }
    ]);

    // reshape to { [dept]: { first, second, third, fourth } }
    const result = {};

    agg.forEach(row => {
      const dept = row._id.department;
      const year = row._id.year;

      if (!result[dept]) {
        result[dept] = {
          first: 0,
          second: 0,
          third: 0,
          fourth: 0
        };
      }

      if (year === "First Year") result[dept].first = row.count;
      if (year === "Second Year") result[dept].second = row.count;
      if (year === "Third Year") result[dept].third = row.count;
      if (year === "Fourth Year") result[dept].fourth = row.count;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 3) faculty summary counts
const getFacultySummaryCounts = async (req, res) => {
  try {
    const [
      totalFaculty,
      deanHod,
      professors,
      assocAsst
    ] = await Promise.all([
      Faculty.countDocuments({}),
      Faculty.countDocuments({ designation: { $in: ["hod", "dean"] } }),
      Faculty.countDocuments({ designation: "professor" }),
      Faculty.countDocuments({
        designation: { $in: ["assistant professor", "associate professor"] }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalFaculty,
        deanAndHod: deanHod,
        professor: professors,
        associateAndAssistant: assocAsst
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDepartmentFacultyRanks = async (req, res) => {
  try {
    const { search } = req.query; // get ?search= from frontend

    const matchStage = {
      designation: {
        $in: ["professor", "assistant professor", "associate professor","dean","hod"]
      }
    };

    // If search query exists, apply case-insensitive department filter
    if (search) {
      matchStage.department = { $regex: search, $options: "i" };
    }

    const agg = await Faculty.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { department: "$department", designation: "$designation" },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {};

    agg.forEach(row => {
      const dept = row._id.department;
      const desig = row._id.designation;

      if (!result[dept]) {
        result[dept] = {
          professor: 0,
          associateProfessor: 0,
          assistantProfessor: 0
        };
      }

      if (desig === "professor") result[dept].professor = row.count;
      if (desig === "associate professor") result[dept].associateProfessor = row.count;
      if (desig === "assistant professor") result[dept].assistantProfessor = row.count;
    });

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStudentYearCounts,
  getDepartmentYearCounts,
  getFacultySummaryCounts,
  getDepartmentFacultyRanks
};
