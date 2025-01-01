import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Using localStorage
import userReducer from "./reduxSlice/userSlice"; // Import your user reducer
import departmentReducer from "./reduxSlice/department.js";

// Redux persist configuration
const persistConfig = {
  key: "auth_token", // The key in localStorage or sessionStorage
  version: 1,
  storage,
  whitelist: ["user"], // Persist only the user slice
};

const departmentPersistConfig = {
  key: "departments",
  version: 1,
  storage,
  whitelist: ["departments"],
};

const persistedReducer = persistReducer(persistConfig, userReducer);
const departmentPersistentReducer = persistReducer(
  departmentPersistConfig,
  departmentReducer
);

const store = configureStore({
  reducer: {
    user: persistedReducer, // Persist the user slice
    departments: departmentPersistentReducer,
  },
});

const persistor = persistStore(store);

export { store, persistor };
