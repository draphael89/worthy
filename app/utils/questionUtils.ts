import { Question } from '../../app/types/QuestionTypes';
import { Profile } from '../../app/types/ProfileTypes';
import { Message } from '../../app/types/ChatTypes';
import { openai } from './openai';

export const getInitialQuestions = async (): Promise<Question[]> => {
  return [
    { id: '1', text: "What's your brand name?", isAIGenerated: false },
    { id: '2', text: "What product or service do you offer?", isAIGenerated: false },
    { id: '3', text: "What are your main business goals?", isAIGenerated: false },
  ];
};

export const generateNextQuestion = async (messages: Message[], profile: Profile): Promise<Question> => {
  const prompt = `Based on the following conversation and profile, generate the next most relevant question to ask:

Conversation:
${messages.map(m => `${m.role}: ${m.content}`).join('\n')}

Profile:
${Object.entries(profile).map(([key, value]) => `${key}: ${value}`).join('\n')}

Generate a single, concise question that will help complete the user's profile or provide valuable insights for their Facebook ad campaign.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 50,
      temperature: 0.7,
    });

    const generatedQuestion = response.choices[0]?.message?.content?.trim() || "What else can you tell me about your business?";

    return {
      id: Date.now().toString(),
      text: generatedQuestion,
      isAIGenerated: true,
    };
  } catch (error) {
    console.error('Error generating question:', error);
    return {
      id: Date.now().toString(),
      text: "What else can you tell me about your business?",
      isAIGenerated: true,
    };
  }
};

const questionUtils = {
  getInitialQuestions,
  generateNextQuestion,
};

export default questionUtils;