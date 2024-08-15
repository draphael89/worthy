// Define the structure of a question
export interface Question {
    id: string;
    text: string;
    isAIGenerated: boolean;
  }
  
  // Define props for components that work with questions
  export interface QuestionProps {
    questions: Question[];
    onSelectQuestion: (question: Question) => void;
  }
  
  // Define the structure for question generation requests
  export interface QuestionGenerationRequest {
    messages: Array<{ role: string; content: string }>;
    profile: {
      brand: string;
      product: string;
      goals: string;
      kpis: string;
      budget: string;
    };
  }
  
  // Define the structure for question generation responses
  export interface QuestionGenerationResponse {
    question: Question;
  }
  
  // Define the action types for question updates
  export const ADD_QUESTION = 'ADD_QUESTION';
  export const REMOVE_QUESTION = 'REMOVE_QUESTION';
  export const UPDATE_QUESTIONS = 'UPDATE_QUESTIONS';
  
  // Define the structure of the add question action
  export interface AddQuestionAction {
    type: typeof ADD_QUESTION;
    payload: Question;
  }
  
  // Define the structure of the remove question action
  export interface RemoveQuestionAction {
    type: typeof REMOVE_QUESTION;
    payload: string; // question id
  }
  
  // Define the structure of the update questions action
  export interface UpdateQuestionsAction {
    type: typeof UPDATE_QUESTIONS;
    payload: Question[];
  }
  
  // Union type for all question-related actions
  export type QuestionActionTypes = AddQuestionAction | RemoveQuestionAction | UpdateQuestionsAction;
  
  // Define the structure of the question state in the Redux store
  export interface QuestionState {
    questions: Question[];
  }