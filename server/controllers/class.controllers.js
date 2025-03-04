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
      frequency: [], // frequency will be added when attendance is taken
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

const generatefrequency = () => {
  const minFreq = 1000; // 1 kHz
  const maxFreq = 8000; // 8 kHz
  const frequency = new Set();

  while (frequency.size < 3) {
    const randomFreq =
      Math.floor(Math.random() * (maxFreq - minFreq + 1)) + minFreq;
    frequency.add(randomFreq);
  }

  return Array.from(frequency);
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

    // Generate new frequency
    const frequency = generatefrequency();
    console.log("✅ Generated frequency:", frequency);

    // Find class and update frequency
    const classData = await Class.findById(classId);
    if (!classData) {
      console.log("❌ Error: Class not found");
      return next(new AppError("Class not found", 404));
    }

    // Update class with new frequency
    classData.frequency = frequency;
    classData.teacherId = teacherId;

    // Add frequency to students' attendance data
    classData.studentList.forEach((student) => {
      classData.attendance.push({
        studentId: student,
        detectedfrequency: [],
      });
    });

    await classData.save();

    setTimeout(async () => {
      await Class.findByIdAndUpdate(classId, { frequency: [] });
      console.log(`⚠️ frequency removed for class ${classId}`);
    }, 3 * 60 * 1000);

    res.status(200).json({
      success: true,
      message: "frequency generated and stored successfully!",
      frequency,
    });
  } catch (error) {
    console.log("❌ Backend Error:", error);
    next(new AppError("Internal server error", 500));
  }
};




export const getClassfrequency = async (req, res, next) => {
  try {
    const { classId } = req.params;

    const classDetails = await Class.findById(classId);
    
    if (!classDetails) {
      return next(new AppError("Class not found", 404));
    }

    // Return the frequency stored in the class document
    res.status(200).json({
      success: true,
      frequency: classDetails.frequency || []
    });

  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};