'use client';

import { ForgotPasswordTemplate } from '@/components/templates/auth/forgot-password-template';

export default function ForgotPasswordPreviewPage() {
  return (
    <ForgotPasswordTemplate
      onSubmit={(email) => {
        console.log('Forgot password submitted:', email);
        alert('This is a preview. Email would be sent to: ' + email);
      }}
    />
  );
}
