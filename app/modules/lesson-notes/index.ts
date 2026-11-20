import { describeDraft, type NoteDraft } from "./lib/draft";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

export type { NoteDraft };

/**
 * What the note editor on a lesson shows for the text in its box: the
 * character count, whether it differs from the saved note, and whether
 * Save is worth pressing.
 */
export function noteDraft(
  draft: string,
  savedBody: string | null | undefined
): NoteDraft {
  return describeDraft(draft, savedBody ?? "", MAX_NOTE_LENGTH);
}
