const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    regulation: { type: String, required: true },
    department: { type: String, required: true },
    creditPoint: { type: Number, required: true, min: 0 },
    paperType: {
      type: String,
      required: true,
      enum: ["lab", "theory"],
    },
    semester: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subject", subjectSchema);
