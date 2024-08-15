'use server'

import { z } from 'zod';
import { FirebaseAuthService } from '../../services/FirebaseAuthService';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormState = {
  message: string | null;
  success: boolean;
};

export async function signUpWithEmailAndPassword(prevState: FormState, formData: FormData): Promise<FormState> {
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors[0].message,
      success: false,
    };
  }

  const { email, password } = validatedFields.data;

  try {
    await FirebaseAuthService.signUpWithEmailAndPassword(email, password);
    return {
      message: 'Sign up successful',
      success: true,
    };
  } catch (error) {
    console.error('Error signing up:', error);
    return {
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      success: false,
    };
  }
}