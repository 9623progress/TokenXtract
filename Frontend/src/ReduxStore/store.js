import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // Using localStorage
import userReducer from "./reduxSlice/userSlice"; // Import your user reducer

// Redux persist configuration
const persistConfig = {
  key: "auth_token", // The key in localStorage or sessionStorage
  version: 1,
  storage,
  whitelist: ["user"], // Persist only the user slice
};

const persistedReducer = persistReducer(persistConfig, userReducer);

const store = configureStore({
  reducer: {
    user: persistedReducer, // Persist the user slice
  },
});

const persistor = persistStore(store);

export { store, persistor };
