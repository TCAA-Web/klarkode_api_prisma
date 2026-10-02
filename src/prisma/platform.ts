import { db } from "./db.ts";
import { seed } from "./seed.ts";

export async function getPlatformSnapshot(userId = "ada-lovelace") {
  await seed();

  const [
    users,
    projects,
    courses,
    classrooms,
    lessons,
    subscriptions,
    progressRecords,
    projectProgressRecords,
  ] = await Promise.all([
    db.orm.public.User.select(
      "id",
      "email",
      "username",
      "name",
      "createdAt",
      "updatedAt",
    ).all(),
    db.orm.public.Project.select(
      "id",
      "number",
      "numberVariant",
      "title",
      "description",
    ).all(),
    db.orm.public.Course.select(
      "id",
      "title",
      "description",
      "artVariant",
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
    db.orm.public.ClassroomSubscription.where({ userId })
      .select(
        "id",
        "userId",
        "classroomId",
        "status",
        "startedAt",
        "completedAt",
        "lastLessonId",
      )
      .all(),
    db.orm.public.LessonProgress.where({ userId })
      .select(
        "id",
        "userId",
        "lessonId",
        "status",
        "bestSubmissionCode",
        "lastFeedbackMessage",
        "lastAttemptAt",
        "completedAt",
      )
      .all(),
    db.orm.public.ProjectProgress.where({ userId })
      .select("id", "userId", "projectId", "status", "progressPercent")
      .all(),
  ]);

  const user = users.find((candidate) => candidate.id === userId) ?? null;

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

  const classroomsWithLessons = classrooms.map((classroom) => {
    const classroomLessons = lessons.filter(
      (lesson) => lesson.classroomId === classroom.id,
    );
    const completed = classroomLessons.filter(
      (lesson) => progressByLessonId.get(lesson.id)?.status === "completed",
    ).length;
    const total = classroomLessons.length;

    return {
      ...classroom,
      subscription: subscriptionsByClassroomId.get(classroom.id) ?? null,
      lessons: lessonsByClassroomId.get(classroom.id) ?? [],
      progress: {
        completed,
        total,
        percent: total === 0 ? 0 : Math.round((completed / total) * 100),
      },
    };
  });

  const classroomsById = new Map(
    classroomsWithLessons.map((classroom) => [classroom.id, classroom]),
  );

  const coursesWithClassrooms = courses.map((course) => ({
    ...course,
    classroom: course.classroomId
      ? (classroomsById.get(course.classroomId) ?? null)
      : null,
  }));

  const projectProgressById = new Map(
    projectProgressRecords.map((progress) => [progress.projectId, progress]),
  );
  const projectsWithProgress = projects.map((project) => ({
    ...project,
    progress: projectProgressById.get(project.id) ?? null,
  }));

  return {
    user,
    users,
    projects: projectsWithProgress,
    subscriptions,
    lessonProgress: progressRecords,
    classrooms: classroomsWithLessons,
    courses: coursesWithClassrooms,
  };
}
