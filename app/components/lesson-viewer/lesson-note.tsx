import { useState } from "react";
import { useFetcher } from "react-router";
import { noteDraft, type NoteDraft } from "~/modules/lesson-notes";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { NotebookPen } from "lucide-react";
import { cn, formatRelativeTime } from "~/lib/utils";
import type { LessonLoaderData } from "./types";

type Note = LessonLoaderData["note"];

export function LessonNote({ note }: { note: Note }) {
  const fetcher = useFetcher<{ ok: boolean; error?: string }>();
  const [body, setBody] = useState(note?.body ?? "");
  const isSaving = fetcher.state !== "idle";
  const draft = noteDraft(body, note?.body);

  return (
    <Card className="mb-8">
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <NotebookPen className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">Your notes</h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Private to you. Jot down what you want to remember from this lesson.
          </p>
        </div>

        <fetcher.Form method="post" className="space-y-2">
          <input type="hidden" name="intent" value="save-note" />
          <Textarea
            name="body"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="Write a note..."
            aria-label="Your notes"
          />
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !draft.canSave}
            >
              {isSaving ? "Saving..." : "Save note"}
            </Button>
            <NoteStatus note={note} draft={draft} error={fetcher.data?.error} />
          </div>
        </fetcher.Form>
      </CardContent>
    </Card>
  );
}

function NoteStatus({
  note,
  draft,
  error,
}: {
  note: Note;
  draft: NoteDraft;
  error: string | undefined;
}) {
  return (
    <>
      {error ? (
        <span className="text-sm text-destructive">{error}</span>
      ) : draft.unsaved ? (
        <span className="text-xs text-muted-foreground">Unsaved changes</span>
      ) : (
        note && (
          <span
            suppressHydrationWarning
            className="text-xs text-muted-foreground"
          >
            Saved · last edited {formatRelativeTime(note.updatedAt)}
          </span>
        )
      )}
      <span
        className={cn(
          "ml-auto text-xs",
          draft.overLimit ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {draft.length} / {draft.maxLength}
      </span>
    </>
  );
}
