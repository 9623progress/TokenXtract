import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  departments: [],
};

const departmentSlice = createSlice({
  name: "departments",
  initialState,
  reducers: {
    setDepartments(state, action) {
      state.departments = action.payload;
    },
  },
});

export const { setDepartments } = departmentSlice.actions;

export default departmentSlice.reducer;
