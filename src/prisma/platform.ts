import { db } from "./db.ts";
import { seed } from "./seed.ts";

function unwrapJsonScalar<T>(value: T): T | null {
  if (value && typeof value === "object" && "value" in value) {
    return (value as { value: T }).value ?? null;
  }

  return value ?? null;
}

export async function getPlatformSnapshot(userId = "ada-lovelace") {
  await seed();

  const [
    users,
    topics,
    projects,
    routeSectionLabels,
    courses,
    classrooms,
    lessons,
    validations,
    validationChecks,
    subscriptions,
    progressRecords,
  ] = await Promise.all([
    db.orm.public.User.select(
      "id",
      "email",
      "username",
      "name",
      "createdAt",
      "updatedAt",
    ).all(),
    db.orm.public.Topic.select("id", "label", "percent", "color").all(),
    db.orm.public.Project.select(
      "id",
      "number",
      "numberVariant",
      "tagLabel",
      "tagVariant",
      "title",
      "description",
      "progressPercent",
      "statusLabel",
    ).all(),
    db.orm.public.RouteSectionLabel.select("routePath", "label").all(),
    db.orm.public.Course.select(
      "id",
      "title",
      "description",
      "badgeLabel",
      "badgeVariant",
      "artVariant",
      "metaPrimary",
      "metaSecondary",
      "featured",
      "classroomId",
    ).all(),
    db.orm.public.Classroom.select("id", "topicLabel", "artVariant").all(),
    db.orm.public.Lesson.select(
      "id",
      "classroomId",
      "sortOrder",
      "topicTag",
      "title",
      "stepLabel",
      "stepTitle",
      "instructions",
      "hintTitle",
      "hintBody",
      "taskTitle",
      "completedText",
      "taskDescription",
      "starterCode",
      "difficulty",
      "estimatedMinutes",
      "tags",
      "objective",
      "successCriteria",
    ).all(),
    db.orm.public.LessonValidation.select("id", "lessonId", "kind").all(),
    db.orm.public.ValidationCheck.select(
      "id",
      "validationId",
      "sortOrder",
      "type",
      "selector",
      "property",
      "value",
      "parent",
      "child",
      "count",
      "attribute",
      "text",
      "expectedTag",
      "name",
      "args",
      "expected",
      "message",
    ).all(),
    db.orm.public.ClassroomSubscription.where({ userId })
      .select(
        "id",
        "userId",
        "classroomId",
        "status",
        "startedAt",
        "completedAt",
        "lastLessonId",
        "overallProgressPct",
      )
      .all(),
    db.orm.public.LessonProgress.where({ userId })
      .select(
        "id",
        "userId",
        "lessonId",
        "status",
        "progressPercent",
        "bestSubmissionCode",
        "lastFeedbackMessage",
        "lastAttemptAt",
        "completedAt",
      )
      .all(),
  ]);

  const user = users.find((candidate) => candidate.id === userId) ?? null;

  const sortedChecks = [...validationChecks].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  );
  const checksByValidationId = new Map<
    string,
    (typeof sortedChecks)[number][]
  >();

  for (const check of sortedChecks) {
    const existing = checksByValidationId.get(check.validationId) ?? [];
    existing.push({
      ...check,
      expected: unwrapJsonScalar(check.expected),
    });
    checksByValidationId.set(check.validationId, existing);
  }

  const validationsByLessonId = new Map(
    validations.map((validation) => [
      validation.lessonId,
      {
        ...validation,
        checks: checksByValidationId.get(validation.id) ?? [],
      },
    ]),
  );

  const progressByLessonId = new Map(
    progressRecords.map((progress) => [progress.lessonId, progress]),
  );

  const lessonsByClassroomId = new Map<string, unknown[]>();

  for (const lesson of [...lessons].sort(
    (left, right) => left.sortOrder - right.sortOrder,
  )) {
    const existing = lessonsByClassroomId.get(lesson.classroomId) ?? [];
    existing.push({
      ...lesson,
      validation: validationsByLessonId.get(lesson.id) ?? null,
      progress: progressByLessonId.get(lesson.id) ?? null,
    });
    lessonsByClassroomId.set(lesson.classroomId, existing);
  }

  const subscriptionsByClassroomId = new Map(
    subscriptions.map((subscription) => [
      subscription.classroomId,
      subscription,
    ]),
  );

  const classroomsWithLessons = classrooms.map((classroom) => ({
    ...classroom,
    subscription: subscriptionsByClassroomId.get(classroom.id) ?? null,
    lessons: lessonsByClassroomId.get(classroom.id) ?? [],
  }));

  const classroomsById = new Map(
    classroomsWithLessons.map((classroom) => [classroom.id, classroom]),
  );

  const coursesWithClassrooms = courses.map((course) => ({
    ...course,
    classroom: course.classroomId
      ? (classroomsById.get(course.classroomId) ?? null)
      : null,
  }));

  return {
    user,
    users,
    topics,
    projects,
    sectionLabels: routeSectionLabels,
    subscriptions,
    lessonProgress: progressRecords,
    classrooms: classroomsWithLessons,
    courses: coursesWithClassrooms,
  };
}
