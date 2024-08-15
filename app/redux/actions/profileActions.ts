import { Profile, UPDATE_PROFILE, UpdateProfileAction } from '../../../app/types/ProfileTypes';

/**
 * Action creator for updating the user profile
 * @param profile Partial or full profile object to update
 * @returns An action object with the profile update payload
 */
export const updateProfile = (profile: Partial<Profile>): UpdateProfileAction => ({
  type: UPDATE_PROFILE,
  payload: profile,
});

/**
 * Async action creator for updating the profile
 * This can be used with redux-thunk for async operations
 */
export const updateProfileAsync = (profile: Partial<Profile>) => {
  return async (dispatch: any) => {
    try {
      // Here you can add any async logic, like sending the profile update to an API
      // For now, we'll just dispatch the synchronous action
      dispatch(updateProfile(profile));
    } catch (error) {
      console.error('Error updating profile:', error);
      // You can dispatch an error action here if needed
    }
  };
};

/**
 * Action creator for resetting the profile to its initial state
 * @returns An action object to reset the profile
 */
export const resetProfile = (): UpdateProfileAction => ({
  type: UPDATE_PROFILE,
  payload: {
    brand: '',
    product: '',
    goals: '',
    kpis: '',
    budget: '',
  },
});

/**
 * Action creator for updating a specific field in the profile
 * @param field The field to update
 * @param value The new value for the field
 * @returns An action object with the specific field update
 */
export const updateProfileField = (field: keyof Profile, value: string): UpdateProfileAction => ({
  type: UPDATE_PROFILE,
  payload: { [field]: value },
});

// You can add more action creators here as needed for profile-related actions