import { db } from "./db.ts";
import { HttpError } from "./errors.ts";
import { seed } from "./seed.ts";

export type Enrollment = { userId: string; classroomId: string };

// Idempotent: enrolling twice keeps the existing subscription.
export async function enrollInClassroom({ userId, classroomId }: Enrollment) {
  await seed();

  const user = await db.orm.public.User.where({ id: userId }).first();
  if (!user) throw new HttpError(404, "User not found.");

  const classroom = await db.orm.public.Classroom.where({
    id: classroomId,
  }).first();
  if (!classroom) throw new HttpError(404, "Classroom not found.");

  const existing = await db.orm.public.ClassroomSubscription.where({
    userId,
    classroomId,
  }).first();
  if (existing) return { classroomId, status: existing.status };

  const created = await db.orm.public.ClassroomSubscription.create({
    userId,
    classroomId,
  });
  return { classroomId, status: created.status };
}
