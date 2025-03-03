import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { playSound } from "../helpers/playSound";
import { generateFrequencies } from "../redux/slices/classSlice";

const Teacher = () => {
  const dispatch = useDispatch();
  const [classId, setClassId] = useState("67c6202b033e6402a14f807b"); // Teacher should enter Class ID
  const { frequencies, loading, error } = useSelector((state) => state.class);

  const handleGenerateFrequencies = () => {
    if (!classId) {
      alert("Please enter a class ID");
      return;
    }
    dispatch(
      generateFrequencies({ classId, teacherId: "67c61a646bc06ce3fe558d7a" })
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, Teacher!</h1>
      <p>
        This is your dashboard where you can manage your classes and attendance.
      </p>

      <input
        type="text"
        placeholder="Enter Class ID"
        value={classId}
        onChange={(e) => setClassId(e.target.value)}
        className="border p-2 mt-4"
      />

      <button
        onClick={handleGenerateFrequencies}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Frequencies"}
      </button>

      <button
        onClick={() => playSound(frequencies)}
        className="bg-green-500 text-white px-4 py-2 rounded mt-4"
        disabled={frequencies.length === 0}
      >
        Play Sound
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}
      {frequencies.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold">Generated Frequencies:</h2>
          <p>{frequencies.join(", ")} Hz</p>
        </div>
      )}
    </div>
  );
};

export default Teacher;
