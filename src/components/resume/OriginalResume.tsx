import React from 'react';
import { OriginalResumeView } from './OriginalResumeView';

interface OriginalResumeProps {
  userId: string;
}

export function OriginalResume({ userId }: OriginalResumeProps) {
  return <OriginalResumeView userId={userId} />;
}