import { describe, it, expect } from "vitest";
import { noteDraft } from "../index";
import { MAX_NOTE_LENGTH } from "~/lib/notes";

describe("noteDraft", () => {
  it("counts the characters against the note limit", () => {
    const draft = noteDraft("hello", null);
    expect(draft.length).toBe(5);
    expect(draft.maxLength).toBe(MAX_NOTE_LENGTH);
    expect(draft.overLimit).toBe(false);
  });

  it("can save new text when there is no saved note", () => {
    expect(noteDraft("first thought", undefined)).toMatchObject({
      unsaved: true,
      canSave: true,
    });
  });

  it("has nothing unsaved in an empty box with no saved note", () => {
    expect(noteDraft("", null).unsaved).toBe(false);
  });

  it("has nothing to save when the text matches the saved note", () => {
    expect(noteDraft("same", "same")).toMatchObject({
      unsaved: false,
      canSave: false,
    });
  });

  it("can save an edit to the saved note", () => {
    expect(noteDraft("same, but more", "same")).toMatchObject({
      unsaved: true,
      canSave: true,
    });
  });

  it("cannot save a blank note", () => {
    expect(noteDraft("   ", "old")).toMatchObject({
      unsaved: true,
      canSave: false,
    });
    expect(noteDraft("", null).canSave).toBe(false);
  });

  it("allows a note at exactly the limit", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH), null);
    expect(draft.overLimit).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("cannot save a note over the limit", () => {
    const draft = noteDraft("a".repeat(MAX_NOTE_LENGTH + 1), null);
    expect(draft.overLimit).toBe(true);
    expect(draft.canSave).toBe(false);
  });
});

describe("noteDraft after a save", () => {
  it("treats surrounding whitespace the server trims as saved", () => {
    expect(noteDraft("  remember this\n", "remember this")).toMatchObject({
      unsaved: false,
      canSave: false,
    });
  });

  it("does not count trimmed whitespace against the limit", () => {
    const draft = noteDraft(`${"a".repeat(MAX_NOTE_LENGTH)}\n`, null);
    expect(draft.overLimit).toBe(false);
    expect(draft.canSave).toBe(true);
  });

  it("shows the count the server would keep, so it agrees with the limit", () => {
    const draft = noteDraft(`${"a".repeat(MAX_NOTE_LENGTH)}   `, null);
    expect(draft.length).toBe(MAX_NOTE_LENGTH);
    expect(draft.overLimit).toBe(false);
  });
});
