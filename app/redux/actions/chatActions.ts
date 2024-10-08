import { 
    Message, 
    ADD_MESSAGE, 
    CLEAR_CHAT, 
    UPDATE_QUESTIONS,
    AddMessageAction, 
    ClearChatAction,
    UpdateQuestionsAction
  } from '../../../app/types/ChatTypes';
  import { Question } from '../../../app/types/QuestionTypes';
  import { AppThunk } from '../store';
  import { updateProfile } from './profileActions';
  import profileUtils from 'app/utils/profileUtils';
  import questionUtils from 'app/utils/questionUtils';
  import { AIContextType } from 'app/contexts/AIContext';
  
  // Import the RootState type
  import { RootState } from '../store';
  
  // Define an extended RootState type that includes chat and profile
  interface ExtendedRootState extends RootState {
    chat: {
      messages: Message[];
    };
    profile: {
      profile: any; // Replace 'any' with the actual type of your profile
    };
  }
  
  export const addMessage = (message: Message): AddMessageAction => ({
    type: ADD_MESSAGE,
    payload: message,
  });
  
  export const clearChat = (): ClearChatAction => ({
    type: CLEAR_CHAT,
  });
  
  export const updateQuestions = (questions: Question[]): UpdateQuestionsAction => ({
    type: UPDATE_QUESTIONS,
    payload: questions,
  });
  
  export const sendMessage = (content: string, aiContext: AIContextType): AppThunk<Promise<void>> => {
    return async (dispatch, getState) => {
      try {
        dispatch(addMessage({ role: 'user', content }));
  
        const aiResponse = await aiContext.askQuestion(content);
        dispatch(addMessage({ role: 'ai', content: aiResponse }));
  
        const state = getState() as ExtendedRootState;
        const { chat, profile: currentProfile } = state;
        const updatedProfile = await profileUtils.summarizeProfile(
          [...chat.messages, { role: 'user', content }, { role: 'ai', content: aiResponse }],
          aiResponse,
          aiContext
        );
        
        const mergedProfile = profileUtils.mergeProfiles(currentProfile.profile, updatedProfile);
        dispatch(updateProfile(mergedProfile));
  
        const nextQuestion = await questionUtils.generateNextQuestion(chat.messages, mergedProfile);
        dispatch(updateQuestions([nextQuestion]));
      } catch (error) {
        console.error('Error sending message:', error);
        dispatch(addMessage({ role: 'error', content: 'An error occurred. Please try again.' }));
      }
    };
  };
  
  export const generateNextQuestion = (): AppThunk<Promise<Question>> => {
    return async (dispatch, getState) => {
      const state = getState() as ExtendedRootState;
      const { chat, profile } = state;
      const nextQuestion = await questionUtils.generateNextQuestion(chat.messages, profile.profile);
      dispatch(updateQuestions([nextQuestion]));
      return nextQuestion;
    };
  };
  
  export const initializeQuestions = (): AppThunk<Promise<void>> => {
    return async (dispatch) => {
      try {
        const initialQuestions = await questionUtils.getInitialQuestions();
        const randomQuestion = initialQuestions[Math.floor(Math.random() * initialQuestions.length)];
        if (randomQuestion) {
          dispatch(updateQuestions([randomQuestion]));
        } else {
          console.error('No initial questions available');
        }
      } catch (error) {
        console.error('Error initializing questions:', error);
      }
    };
  };