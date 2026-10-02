import { db } from "./db.ts";
import { HttpError } from "./errors.ts";
import { seed } from "./seed.ts";
import { validateSubmission } from "./validation.ts";

// Json scalars are stored wrapped as { value }.
function unwrapJsonScalar<T>(value: T): T | null {
  if (value && typeof value === "object" && "value" in value) {
    return (value as { value: T }).value ?? null;
  }

  return value ?? null;
}

export type Submission = { userId: string; lessonId: string; code: string };

// The verdict is always computed here; clients never get to say whether a submission passed.
export async function submitLesson({ userId, lessonId, code }: Submission) {
  await seed();

  const lesson = await db.orm.public.Lesson.where({ id: lessonId }).first();
  if (!lesson) throw new HttpError(404, "Lesson not found.");

  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw new HttpError(404, "User not found.");

  const siblings = await db.orm.public.Lesson.where({
    classroomId: lesson.classroomId,
  })
    .orderBy((item) => item.sortOrder.asc())
    .all();

  const progress = await db.orm.public.LessonProgress.where({
    userId,
    lessonId,
  }).first();
  // Without a saved progress row only the first lesson of a classroom is open.
  const status =
    progress?.status ?? (siblings[0]?.id === lessonId ? "current" : "locked");
  if (status === "locked") throw new HttpError(403, "Lesson is locked.");

  const validation = await db.orm.public.LessonValidation.where({
    lessonId,
  }).first();
  if (!validation)
    throw new HttpError(422, "Lesson has no validation configured.");

  const checkRows = await db.orm.public.ValidationCheck.where({
    validationId: validation.id,
  })
    .orderBy((check) => check.sortOrder.asc())
    .all();
  const checks = checkRows.map((check) => ({
    ...check,
    expected: unwrapJsonScalar(check.expected),
  }));

  const result = await validateSubmission(validation.kind, code, checks);
  const now = new Date().toISOString();
  const wasCompleted = status === "completed";

  await db.transaction(async (tx) => {
    const attempt = {
      lastAttemptAt: now,
      lastFeedbackMessage: result.message,
      // A completed lesson keeps the solution that completed it.
      ...(wasCompleted ? {} : { bestSubmissionCode: code }),
      ...(result.ok && !wasCompleted
        ? {
            status: "completed" as const,
            completedAt: now,
          }
        : {}),
    };

    if (progress) {
      await tx.orm.public.LessonProgress.where({ id: progress.id }).update(
        attempt,
      );
    } else {
      await tx.orm.public.LessonProgress.create({
        userId,
        lessonId,
        status,
        ...attempt,
      });
    }

    if (!result.ok) return;

    const siblingIds = new Set(siblings.map((item) => item.id));
    const userProgress = (
      await tx.orm.public.LessonProgress.where({ userId }).all()
    ).filter((item) => siblingIds.has(item.lessonId));
    const next = siblings.find((item) => item.sortOrder > lesson.sortOrder);
    const nextProgress =
      next && userProgress.find((item) => item.lessonId === next.id);

    if (next && !nextProgress) {
      await tx.orm.public.LessonProgress.create({
        userId,
        lessonId: next.id,
        status: "current",
      });
    } else if (nextProgress?.status === "locked") {
      await tx.orm.public.LessonProgress.where({ id: nextProgress.id }).update({
        status: "current",
      });
    }

    const allCompleted =
      userProgress.every((item) => item.status === "completed") &&
      userProgress.length === siblings.length;

    const subscriptionKey = { userId, classroomId: lesson.classroomId };
    const subscription = {
      lastLessonId: next?.id ?? lessonId,
      ...(allCompleted
        ? { status: "completed" as const, completedAt: now }
        : {}),
    };

    // Passing a lesson enrolls the user if they hadn't enrolled explicitly.
    const existing =
      await tx.orm.public.ClassroomSubscription.where(subscriptionKey).first();
    if (existing) {
      await tx.orm.public.ClassroomSubscription.where(subscriptionKey).update(
        subscription,
      );
    } else {
      await tx.orm.public.ClassroomSubscription.create({
        ...subscriptionKey,
        ...subscription,
      });
    }
  });

  return result;
}
