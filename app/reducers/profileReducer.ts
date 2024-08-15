import { ProfileState, ProfileActionTypes, UPDATE_PROFILE } from '../../app/types/ProfileTypes';

const initialState: ProfileState = {
  brand: '',
  product: '',
  goals: '',
  kpis: '',
  budget: '',
  lastUpdated: null,
};

const profileReducer = (state = initialState, action: ProfileActionTypes): ProfileState => {
  switch (action.type) {
    case UPDATE_PROFILE:
      return {
        ...state,
        ...action.payload,
        lastUpdated: Date.now(),
      };
    default:
      return state;
  }
};

export default profileReducer;