import { configureStore, ThunkAction, Action, combineReducers } from '@reduxjs/toolkit';
import chatReducer from 'app/reducers/chatReducer';
import profileReducer from 'app/reducers/profileReducer';

// Combine all the reducers into one root reducer
const rootReducer = combineReducers({
  chat: chatReducer,
  profile: profileReducer,
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