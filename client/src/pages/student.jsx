import { useState } from "react";

import detectSound from "../helpers/detectSound";

const Student = () => {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("Waiting for permission...");

  const handleStartListening = async () => {
    setStatus("Requesting microphone access...");
    const success = await detectSound(setStatus);
    setListening(success);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Welcome, Student!</h1>
      <p>
        This is your dashboard where you can manage your classes and attendance.
      </p>

      {/* Status Indicator */}
      <div className="mt-4 p-2 border rounded bg-gray-100">
        <p className="font-semibold">{status}</p>
      </div>

      {/* Start Listening Button */}
      <button
        onClick={handleStartListening}
        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        disabled={listening}
      >
        {listening ? "Listening..." : "Mark Attendance"}
      </button>

      {/* Canvas for Frequency Visualization */}
      <canvas id="frequencyData" className="mt-4 border"></canvas>
    </div>
  );
};

export default Student;
