import "./App.css";

import { Route, Routes } from "react-router-dom";

import Login from "./pages/login.jsx";
import Signup from "./pages/signUp.jsx";
import Student from "./pages/student.jsx";
import Teacher from "./pages/teacher.jsx";

function App() {
  return (
    <>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/teacher" element={<Teacher />} />
        <Route path="/student" element={<Student />} />
      </Routes>
    </>
  );
}

export default App;
