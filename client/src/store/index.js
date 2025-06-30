import { combineReducers, configureStore, createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { isLoggedIn: false },
  reducers: {
    login(state) {
      console.log("updating");
      state.isLoggedIn = true;
    },
    logout(state) {
      localStorage.removeItem("userId");
      state.isLoggedIn = false;
    },
  },
});

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    isDarkmode: false,
  },
  reducers: {
    setDarkmode: (state, action) => {
      state.isDarkmode = action.payload;
    },
  },
});

const searchSlice = createSlice({
  name: "search",
  initialState: {
    searchTerm: "",
  },
  reducers: {
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
  },
});

export const authActions = authSlice.actions;
export const { setDarkmode } = themeSlice.actions;
export const searchActions = searchSlice.actions;

const rootReducer = combineReducers({
  auth: authSlice.reducer,
  theme: themeSlice.reducer,
  search: searchSlice.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
});
