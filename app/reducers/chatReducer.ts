import { ChatState, ChatActionTypes, ADD_MESSAGE, CLEAR_CHAT, UPDATE_QUESTIONS } from '../../app/types/ChatTypes';

const initialState: ChatState = {
  messages: [],
  questions: [],
};

const chatReducer = (state = initialState, action: ChatActionTypes): ChatState => {
  switch (action.type) {
    case ADD_MESSAGE:
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case CLEAR_CHAT:
      return {
        ...state,
        messages: [],
        questions: [], // Also clear questions when clearing chat
      };
    case UPDATE_QUESTIONS:
      return {
        ...state,
        questions: action.payload,
      };
    default:
      return state;
  }
};

export default chatReducer;