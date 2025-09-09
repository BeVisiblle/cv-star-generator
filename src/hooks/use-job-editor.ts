import { useState, useEffect } from 'react';
import { Job, JobEditorState } from '@/lib/types';

export function useJobEditor(job: Job) {
  const [currentRemote, setCurrentRemote] = useState(job.remote);
  const [isDirty, setIsDirty] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const originalRemote = job.remote;
  const canEditLocation = originalRemote === true && currentRemote !== originalRemote;
  const titleDisabled = true; // Always disabled
  const locationDisabled = !canEditLocation;

  const state: JobEditorState = {
    originalRemote,
    currentRemote,
    canEditLocation,
    titleDisabled,
    locationDisabled,
    isDirty,
    hasChanges
  };

  const updateRemote = (newRemote: boolean) => {
    setCurrentRemote(newRemote);
    setIsDirty(true);
    setHasChanges(true);
  };

  const markAsDirty = () => {
    setIsDirty(true);
    setHasChanges(true);
  };

  const resetDirty = () => {
    setIsDirty(false);
    setHasChanges(false);
  };

  const resetToOriginal = () => {
    setCurrentRemote(originalRemote);
    setIsDirty(false);
    setHasChanges(false);
  };

  return {
    state,
    updateRemote,
    markAsDirty,
    resetDirty,
    resetToOriginal
  };
}
