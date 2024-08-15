import OpenAI from 'openai';
import { ENV } from '../config/env';

const apiKey = ENV['REACT_APP_OPENAI_API_KEY'];

if (!apiKey) {
  throw new Error('OpenAI API key is not set in environment variables');
}

export const openai = new OpenAI({ apiKey });