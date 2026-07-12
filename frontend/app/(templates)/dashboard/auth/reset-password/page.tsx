'use client';

import { ResetPasswordTemplate } from '@/components/templates/auth/reset-password-template';

export default function ResetPasswordPreviewPage() {
  return (
    <ResetPasswordTemplate
      onSubmit={(password) => {
        console.log('Reset password submitted');
        alert('This is a preview. Password would be reset.');
      }}
    />
  );
}
