import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://localhost:5014/api/v1/class";

export const generateFrequencies = createAsyncThunk(
  "class/generateFrequencies",
  async ({ classId, teacherId }, { rejectWithValue }) => {
    try {
      console.log("📡 Sending Request:", { classId, teacherId });

      const response = await axios.post(
        `${API_URL}/generate-attendance`,
        { classId, teacherId },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("✅ API Response:", response.data);
      return response.data.frequencies;
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      return rejectWithValue(
        error.response?.data?.message || "Failed to generate frequencies"
      );
    }
  }
);


const classSlice = createSlice({
  name: "class",
  initialState: {
    frequencies: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(generateFrequencies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateFrequencies.fulfilled, (state, action) => {
        state.loading = false;
        state.frequencies = action.payload;
      })
      .addCase(generateFrequencies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default classSlice.reducer;
