/**
 * Gender Verification Page
 * 
 * This page handles the AI-based gender verification flow.
 * Users must complete verification before accessing the matching feature.
 * 
 * Privacy:
 * - Camera capture only (no gallery uploads)
 * - All processing happens in-browser
 * - Only the result (male/female) is stored
 * - Image is never uploaded or saved
 */

import { useRouter } from 'next/router';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getUserData } from 'utils/deviceId';
import { isUserVerified } from 'modules/verification';

// Dynamic import to avoid SSR issues with face-api
const VerificationFlow = dynamic(
  () => import('modules/verification/components/VerificationFlow'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-grey-200 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-grey-500">Loading verification module...</p>
        </div>
      </div>
    )
  }
);

export default function VerifyPage() {
  const router = useRouter();

  // Check if user has completed onboarding
  useEffect(() => {
    const userData = getUserData();
    if (!userData || !userData.nickname) {
      router.push('/');
      return;
    }

    // If already verified, go to match
    if (isUserVerified()) {
      router.push('/match');
    }
  }, [router]);

  // Handle verification complete
  const handleComplete = (result) => {
    console.log('Verification complete:', result);
    router.push('/match');
  };

  // Handle skip (limited functionality)
  const handleSkip = () => {
    router.push('/match');
  };

  return (
    <VerificationFlow
      onComplete={handleComplete}
      onSkip={handleSkip}
    />
  );
}
