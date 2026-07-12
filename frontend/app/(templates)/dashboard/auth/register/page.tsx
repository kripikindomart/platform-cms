'use client';

import { RegisterTemplate } from '@/components/templates/auth/register-template';

export default function RegisterPreviewPage() {
  return (
    <RegisterTemplate
      onSubmit={(data) => {
        console.log('Register submitted:', data);
        alert('This is a preview. Form data logged to console.');
      }}
    />
  );
}
