// src/config/env.ts

export const ENV = {
    REACT_APP_OPENAI_API_KEY: process.env['REACT_APP_OPENAI_API_KEY'] || '',
    // Add other environment variables here
  } as const;
  
  // Type assertion to ensure type safety when accessing ENV properties
  export type ENV_TYPE = typeof ENV;