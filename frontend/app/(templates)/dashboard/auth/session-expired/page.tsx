'use client';

import { SessionExpiredTemplate } from '@/components/templates/auth/session-expired-template';

export default function SessionExpiredPreviewPage() {
  return (
    <SessionExpiredTemplate
      onRelogin={() => {
        console.log('Navigate to login');
        alert('This is a preview. Would navigate to login.');
      }}
      sessionDuration="2 hours"
    />
  );
}
