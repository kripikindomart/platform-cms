'use client';

import { OTPTemplate } from '@/components/templates/auth/otp-template';

export default function OTPPreviewPage() {
  return (
    <OTPTemplate
      onSubmit={(otp) => {
        console.log('OTP submitted:', otp);
        alert('This is a preview. OTP entered: ' + otp);
      }}
      onResend={() => {
        console.log('Resend OTP');
        alert('This is a preview. OTP would be resent.');
      }}
      phoneNumber="+62 812-3456-7890"
    />
  );
}
