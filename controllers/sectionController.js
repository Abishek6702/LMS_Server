const Student = require("../models/Student");

const getYearSectionStats = async (req, res) => {
  try {
    const { department, academicYear } = req.query;

    const pipeline = [];

    // Optional filters
    const match = {};
    if (department) match.department = department;
    if (academicYear) match.academicYear = academicYear;

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    pipeline.push({
      $group: {
        _id: { year: "$year", section: "$section" },
        count: { $sum: 1 },
      },
    });

    const agg = await Student.aggregate(pipeline);

    const map = {};

    agg.forEach((row) => {
      const year = row._id.year;
      const section = row._id.section || "unallocated";
      const count = row.count;

      if (!map[year]) map[year] = {};
      map[year][section] = count;
    });

    const data = Object.entries(map).map(([yearLabel, sectionsObj]) => ({
      year: yearLabel,
      sections: Object.entries(sectionsObj).map(([sectionName, count]) => ({
        sectionName,
        count,
      })),
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getStudentsByDeptYearSection = async (req, res) => {
  try {
    const { department, year, section, academicYear } = req.query;

    if (!department || !year || !section || !academicYear) {
      return res.status(400).json({
        success: false,
        message: "department, year, section and academicYear are required",
      });
    }

    const filter = { department, year, section, academicYear };

    const students = await Student.find(filter)
      .select("_id registerNumber firstName lastName")
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      count: students.length,
      students,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getSectionSummaryByYearDept = async (req, res) => {
  try {
    const { department, academicYear, year } = req.query;

    if (!department || !academicYear || !year) {
      return res.status(400).json({
        success: false,
        message: "department, academicYear and year are required",
      });
    }

    const pipeline = [
      {
        $match: {
          department,
          academicYear,
          year,
        },
      },
      {
        $group: {
          _id: "$section", // section name
          count: { $sum: 1 },
        },
      },
    ];

    const agg = await Student.aggregate(pipeline);

    let total = 0;
    const sections = [];

    agg.forEach((row) => {
      const sectionName = row._id || "unallocated";
      const count = row.count;
      total += count;
      sections.push({ sectionName, count });
    });

    res.json({
      success: true,
      data: {
        department,
        academicYear,
        year,
        total,
        sections,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const changeStudentsSection = async (req, res) => {
  try {
    const { department, academicYear, year, section, studentIds } = req.body;

    if (
      !department ||
      !academicYear ||
      !year ||
      !section ||
      !Array.isArray(studentIds)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "department, academicYear, year, section and studentIds[] are required",
      });
    }

    // validate section
    const allowed = ["A", "B", "unallocated"];
    if (!allowed.includes(section)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid section" });
    }

    const result = await Student.updateMany(
      {
        _id: { $in: studentIds },
        department,
        academicYear,
        year,
      },
      { $set: { section } }
    );

    res.json({
      success: true,
      message: "Section updated for students",
      matchedCount: result.matchedCount ?? result.nMatched,
      modifiedCount: result.modifiedCount ?? result.nModified,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getYearSectionStats,
  getStudentsByDeptYearSection,
  getSectionSummaryByYearDept,
  changeStudentsSection,
};
