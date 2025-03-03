import AppError from "../utils/error.utils.js";
import Class from "../models/class.model.js";
import User from "../models/user.model.js";

// Create a class by a teacher
export const registerClass = async (req, res, next) => {
  try {
    const { teacherId, className, time } = req.body;

    // Validate required fields
    if (!teacherId || !className) {
      return next(new AppError("Teacher ID and Class Name are required", 400));
    }

    // Verify if the teacher exists and has a valid role
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== "teacher") {
      return next(
        new AppError("Invalid Teacher ID or user is not a teacher", 400)
      );
    }

    // Create a new class
    const newClass = await Class.create({
      teacherId,
      className,
      studentList: [], // Students will join later
      frequency: [], // Frequencies will be added when attendance is taken
      time: time || new Date(), // Default to current time
      attendance: [], // Attendance records will be added later
    });

    res.status(201).json({
      success: true,
      message: "Class registered successfully",
      data: newClass,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

const generateFrequencies = () => {
  const minFreq = 1000; // 1 kHz
  const maxFreq = 8000; // 8 kHz
  const frequencies = new Set();

  while (frequencies.size < 3) {
    const randomFreq =
      Math.floor(Math.random() * (maxFreq - minFreq + 1)) + minFreq;
    frequencies.add(randomFreq);
  }

  return Array.from(frequencies);
};

export const generateAttendance = async (req, res, next) => {
  try {
    console.log("Received Request:", req.body); // 👈 Debug input

    const { classId, teacherId } = req.body;

    if (!classId) {
      console.log("❌ Error: Class ID is missing");
      return next(new AppError("Class ID is required", 400));
    }

    const teacherData = await User.findById(teacherId);
    if (!teacherData) {
      console.log("❌ Error: Teacher not found");
      return next(new AppError("Teacher ID is not valid", 400));
    }

    // Generate new frequencies
    const frequencies = generateFrequencies();
    console.log("✅ Generated Frequencies:", frequencies);

    // Find class and update frequency
    const classData = await Class.findById(classId);
    if (!classData) {
      console.log("❌ Error: Class not found");
      return next(new AppError("Class not found", 404));
    }

    // Update class with new frequencies
    classData.frequency = frequencies;
    classData.teacherId = teacherId;

    // Add frequencies to students' attendance data
    classData.studentList.forEach((student) => {
      classData.attendance.push({
        studentId: student,
        detectedFrequencies: [],
      });
    });

    await classData.save();

    setTimeout(async () => {
      await Class.findByIdAndUpdate(classId, { frequency: [] });
      console.log(`⚠️ Frequencies removed for class ${classId}`);
    }, 3 * 60 * 1000);

    res.status(200).json({
      success: true,
      message: "Frequencies generated and stored successfully!",
      frequencies,
    });
  } catch (error) {
    console.log("❌ Backend Error:", error);
    next(new AppError("Internal server error", 500));
  }
};



