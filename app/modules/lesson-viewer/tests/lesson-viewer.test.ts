import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTestDb, seedBaseData, type TestDb } from "~/test/setup";
import * as schema from "~/db/schema";

// The module reads the app's shared `db`; point it at an in-memory one.
let db: TestDb;
vi.mock("~/db", () => ({
  get db() {
    return db;
  },
}));

const { getLessonQuiz, flattenCourseLessons } = await import("../index.server");

// The module has no writes for courses, lessons or quizzes, so rows go in
// directly. Kept in one place so a schema change touches only this block.
function addLesson(courseId: number, title: string) {
  const mod = db
    .insert(schema.modules)
    .values({ courseId, title: `${title} module`, position: 1 })
    .returning()
    .get();
  return db
    .insert(schema.lessons)
    .values({ moduleId: mod.id, title, position: 1 })
    .returning()
    .get();
}

function addQuiz(lessonId: number) {
  return db
    .insert(schema.quizzes)
    .values({ lessonId, title: "Check", passingScore: 0.5 })
    .returning()
    .get();
}

let courseId: number;

beforeEach(() => {
  db = createTestDb();
  courseId = seedBaseData(db).course.id;
});

describe("getLessonQuiz", () => {
  it("returns the quiz that belongs to the lesson", () => {
    const lesson = addLesson(courseId, "One");
    const quiz = addQuiz(lesson.id);
    expect(getLessonQuiz(quiz.id, lesson.id)?.id).toBe(quiz.id);
  });

  it("refuses a quiz from another lesson", () => {
    const lesson = addLesson(courseId, "One");
    const other = addLesson(courseId, "Two");
    const quiz = addQuiz(other.id);
    expect(getLessonQuiz(quiz.id, lesson.id)).toBeUndefined();
  });

  it("returns nothing for a quiz that does not exist", () => {
    const lesson = addLesson(courseId, "One");
    expect(getLessonQuiz(999, lesson.id)).toBeUndefined();
  });
});

describe("flattenCourseLessons", () => {
  it("lists lessons in module order with their module", () => {
    const flat = flattenCourseLessons({
      modules: [
        {
          id: 1,
          title: "Basics",
          lessons: [
            { id: 10, title: "Intro", moduleId: 1 },
            { id: 11, title: "Setup", moduleId: 1 },
          ],
        },
        {
          id: 2,
          title: "Next",
          lessons: [{ id: 20, title: "Go", moduleId: 2 }],
        },
      ],
    });
    expect(flat).toEqual([
      { id: 10, title: "Intro", moduleId: 1, moduleTitle: "Basics" },
      { id: 11, title: "Setup", moduleId: 1, moduleTitle: "Basics" },
      { id: 20, title: "Go", moduleId: 2, moduleTitle: "Next" },
    ]);
  });
});
