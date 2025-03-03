import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5014/api/v1/"; // Change this to your backend URL

// Async thunk to fetch attendance frequencies
export const fetchAttendanceFrequencies = createAsyncThunk(
  "attendance/fetchFrequencies",
  async (classId, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${API_URL}/get-attendance-frequencies`,
        {
          params: { classId },
        }
      );
      return response.data.frequencies; // Return fetched frequencies
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to fetch frequencies"
      );
    }
  }
);

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    frequencies: [],
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendanceFrequencies.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchAttendanceFrequencies.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.frequencies = action.payload;
      })
      .addCase(fetchAttendanceFrequencies.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

export default attendanceSlice.reducer;
