'use client';

import { useState } from 'react';
import { LoginTemplate } from '@/components/templates/auth/login-template';
import { toast } from 'sonner';

export default function LoginTemplatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: { email: string; password: string; remember: boolean }) => {
    setIsLoading(true);
    setError('');

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate error for demo
    if (data.email === 'error@test.com') {
      setError('Invalid email or password. Please try again.');
      setIsLoading(false);
      return;
    }

    toast.success('Login successful! 🎉');
    setIsLoading(false);
  };

  return <LoginTemplate onSubmit={handleSubmit} isLoading={isLoading} error={error} />;
}
