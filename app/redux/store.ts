import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import authReducer from 'app/redux/slices/authSlice';

// Combine all the reducers into one root reducer
const rootReducer = combineReducers({
  auth: authReducer,
  // Add other reducers here if needed
});

export const store = configureStore({
  reducer: rootReducer,
  // Add any middleware or enhancers here if needed
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

export default store;