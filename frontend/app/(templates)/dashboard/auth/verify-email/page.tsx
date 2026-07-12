'use client';

import { VerifyEmailTemplate } from '@/components/templates/auth/verify-email-template';

export default function VerifyEmailPreviewPage() {
  return (
    <VerifyEmailTemplate
      onResend={() => {
        console.log('Resend email');
        alert('This is a preview. Verification email would be resent.');
      }}
      email="demo@example.com"
    />
  );
}
