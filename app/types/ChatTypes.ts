import { Question } from './QuestionTypes';

// Define the structure of a chat message
export interface Message {
  role: 'user' | 'ai' | 'error';
  content: string;
}

// Define the action types for chat updates
export const ADD_MESSAGE = 'ADD_MESSAGE';
export const CLEAR_CHAT = 'CLEAR_CHAT';
export const UPDATE_QUESTIONS = 'UPDATE_QUESTIONS';

// Define the structure of the add message action
export interface AddMessageAction {
  type: typeof ADD_MESSAGE;
  payload: Message;
}

// Define the structure of the clear chat action
export interface ClearChatAction {
  type: typeof CLEAR_CHAT;
}

// Define the structure of the update questions action
export interface UpdateQuestionsAction {
  type: typeof UPDATE_QUESTIONS;
  payload: Question[];
}

// Union type for all chat-related actions
export type ChatActionTypes = AddMessageAction | ClearChatAction | UpdateQuestionsAction;

// Define the structure of the chat state in the Redux store
export interface ChatState {
  messages: Message[];
  questions: Question[];
}

// Define props for components that work with chat
export interface ChatProps {
  messages: Message[];
  questions: Question[];
  onSendMessage: (message: string) => void;
  onSelectQuestion: (question: Question) => void;
}

// Define the structure for chat-related API responses (Optional - if you have a chat API)
export interface ChatApiResponse {
  success: boolean;
  data?: Message;
  error?: string;
}

// Define the structure for chat completion requests (Optional - if you have a chat API)
export interface ChatCompletionRequest {
  messages: Message[];
}

// Define the structure for chat completion responses (Optional - if you have a chat API)
export interface ChatCompletionResponse {
  message: Message;
}