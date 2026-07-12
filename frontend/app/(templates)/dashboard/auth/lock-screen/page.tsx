'use client';

import { LockScreenTemplate } from '@/components/templates/auth/lock-screen-template';

export default function LockScreenPreviewPage() {
  return (
    <LockScreenTemplate
      onUnlock={(password) => {
        console.log('Unlock attempted');
        alert('This is a preview. Screen would be unlocked.');
      }}
      user={{
        name: 'John Doe',
        email: 'john@company.com',
        avatar: 'JD',
      }}
    />
  );
}
