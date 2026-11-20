export type NoteDraft = {
  length: number;
  maxLength: number;
  overLimit: boolean;
  unsaved: boolean;
  canSave: boolean;
};

export function describeDraft(
  draft: string,
  savedBody: string,
  maxLength: number
): NoteDraft {
  // The server trims before it checks and stores, so compare what it would keep.
  const kept = draft.trim();
  const overLimit = kept.length > maxLength;
  const unsaved = kept !== savedBody;

  return {
    length: draft.length,
    maxLength,
    overLimit,
    unsaved,
    canSave: unsaved && !overLimit && kept.length > 0,
  };
}
