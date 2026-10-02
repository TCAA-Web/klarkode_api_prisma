import { connectDatabase, db } from "./db.ts";

function encodeJsonScalar(value: string | number | boolean | null) {
  return { value };
}

const courses = [
  {
    id: "frontend-fundament",
    title: "Frontend fundament",
    description:
      "HTML, CSS og JavaScript fra første tag til interaktiv oplevelse.",
    artVariant: "coral",
    featured: true,
    classroomId: "HTML_CLASSROOM",
  },
  {
    id: "ux-i-praksis",
    title: "UX i praksis",
    description:
      "Design flows, prototyper og løsninger, mennesker faktisk kan bruge.",
    artVariant: "yellow",
    featured: false,
    classroomId: "FLEX_CLASSROOM",
  },
  {
    id: "javascript-logik",
    title: "JavaScript logik",
    description:
      "Arbejd med funktioner, betingelser og datastrukturer, der gør din UI interaktiv.",
    artVariant: "lilac",
    featured: false,
    classroomId: "JS_CLASSROOM",
  },
];

const classrooms = [
  { id: "HTML_CLASSROOM", topicLabel: "HTML", artVariant: "lilac" },
  { id: "FLEX_CLASSROOM", topicLabel: "CSS", artVariant: "coral" },
  { id: "JS_CLASSROOM", topicLabel: "JavaScript", artVariant: "yellow" },
];

const lessons = [
  {
    id: "html-container-grouping",
    classroomId: "HTML_CLASSROOM",
    sortOrder: 1,
    topicTag: "HTML · ØVELSE 01",
    title: "HTML: Pak indhold i en container",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Brug et container-element",
    instructions:
      "Pak de tre kort ind i en container, så de bliver behandlet som én gruppe i layoutet.",
    hintTitle: "Et lille hint",
    hintBody:
      "Sørg for at alle tre elementer ligger inde i samme parent-element.",
    taskTitle: "Din opgave",
    completedText:
      "En container samler flere elementer i én gruppe og gør det muligt at style dem samlet.",
    taskDescription:
      "Pak alle tre kort ind i en div, så de hænger sammen som én sektion.",
    starterCode: `<style>
  .cards { display: flex; gap: 8px; }
  .card { padding: 20px; background: #ff7058; color: white; }
</style>
  <div class="card">01</div>
  <div class="card">02</div>
  <div class="card">03</div> `,
    difficulty: "beginner",
    estimatedMinutes: 10,
    tags: ["HTML", "structure", "container", "nesting"],
    objective: "Lær at gruppere relateret indhold i én container.",
    successCriteria: [
      "Alle elementer er placeret inde i samme parent-element",
      "HTML-strukturen er tydelig og læsbar",
      "Der er en klar semantisk gruppe omkring indholdet",
    ],
  },
  {
    id: "html-class-attribute",
    classroomId: "HTML_CLASSROOM",
    sortOrder: 2,
    topicTag: "HTML · ØVELSE 02",
    title: "HTML: Tilføj en CSS-klasse",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Gør elementet stilbart",
    instructions:
      "Sæt den rigtige class på din container, så du kan style den med CSS.",
    hintTitle: "Et lille hint",
    hintBody:
      "Din wrapper skal have classen .cards, så den matcher CSS-reglen.",
    taskTitle: "Din opgave",
    completedText:
      "Class-attributten gør det muligt at målrette flere elementer med samme styling.",
    taskDescription:
      'Tilføj class=".cards" til containeren, så den kan styles.',
    starterCode: `<style>
  .cards { display: flex; gap: 8px; }
  .card { padding: 20px; background: #ff7058; color: white; }
</style>
<div>
  <div class="card">01</div>
  <div class="card">02</div>
  <div class="card">03</div> 
</div>`,
    difficulty: "beginner",
    estimatedMinutes: 12,
    tags: ["HTML", "class", "css", "selectors"],
    objective: "Forstå hvordan class-attributten kobler HTML til styling.",
    successCriteria: [
      "Containeren har en class-attribut",
      "Classnavnet matcher CSS-reglen",
      "Elementerne kan styles samlet",
    ],
  },
  {
    id: "html-semantic-structure",
    classroomId: "HTML_CLASSROOM",
    sortOrder: 3,
    topicTag: "HTML · ØVELSE 03",
    title: "HTML: Giv din side mening",
    stepLabel: "BYG",
    stepTitle: "Brug semantiske elementer",
    instructions:
      "Erstat de generiske div-elementer med semantiske tags, som header, main og section, så din struktur får mening.",
    hintTitle: "Et lille hint",
    hintBody:
      "Tænk på hvad der er overskrift, hovedindhold og indholdsområde på siden.",
    taskTitle: "Din opgave",
    completedText:
      "Semantiske HTML-elementer gør koden mere forståelig og hjælper både brugere og søgemaskiner med at forstå indholdet.",
    taskDescription:
      "Giv siden en bedre struktur ved at bruge overskrifter og meningsfulde semantiske blokke.",
    starterCode: `<main>
  <div>
    <h1>Velkommen</h1>
    <p>Dette er en introduktion til vores kursus.</p>
  </div>
  <div>
    <h2>Fokusområder</h2>
    <p>HTML, CSS og accessibility.</p>
  </div>
</main>`,
    difficulty: "intermediate",
    estimatedMinutes: 18,
    tags: ["HTML", "semantics", "accessibility", "structure"],
    objective: "Lær at skrive HTML, der beskriver indholdet tydeligt.",
    successCriteria: [
      "Der bruges semantiske elementer i stedet for generiske divs",
      "Siden har en tydelig hovedstruktur",
      "Indholdet er nemt at forstå og læse i koden",
    ],
  },
  {
    id: "flexbox-layout-row",
    classroomId: "FLEX_CLASSROOM",
    sortOrder: 1,
    topicTag: "CSS · ØVELSE 01",
    title: "Flexbox: Læg kortene i række",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Gør et layout fleksibelt",
    instructions:
      "Tre kort ligger oven i hinanden. Brug flexbox, så de vises på en vandret række med lige meget afstand imellem.",
    hintTitle: "Et lille hint",
    hintBody:
      "Sæt display: flex; på containeren og brug gap for at skabe spacing.",
    taskTitle: "Din opgave",
    completedText:
      "Flexbox gør det nemt at placere elementer i en række eller kolonne. gap skaber ensartet afstand mellem børnene.",
    taskDescription:
      "Få alle tre kort til at stå på en lige række med afstand.",
    starterCode: `<style>
  .cards { display: block; }
  .card { padding: 20px; background: #ff7058; color: white; }
</style>
<div class="cards">
  <div class="card">01</div>
  <div class="card">02</div>
  <div class="card">03</div>
</div>`,
    difficulty: "beginner",
    estimatedMinutes: 12,
    tags: ["CSS", "Flexbox", "layout", "spacing"],
    objective: "Lær at gøre flere elementer til en fleksibel række.",
    successCriteria: [
      "Containeren bruger display: flex",
      "Elementerne står på en vandret række",
      "Der er tydelig afstand mellem kortene",
    ],
  },
  {
    id: "flexbox-direction-flow",
    classroomId: "FLEX_CLASSROOM",
    sortOrder: 2,
    topicTag: "CSS · ØVELSE 02",
    title: "Flexbox: Skab struktur og retning",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Vælg retning og flow",
    instructions:
      "Brug flex-direction til at styre, om dine elementer skal stå i en række eller en kolonne.",
    hintTitle: "Et lille hint",
    hintBody: "Prøv row for vandret layout og column for lodret layout.",
    taskTitle: "Din opgave",
    completedText:
      "flex-direction afgør, om flex-children flyder vandret eller lodret. Det er en af de vigtigste værktøjer i flexbox.",
    taskDescription:
      "Få hvert kort til at blive en lodret kolonne med ensartet spacing.",
    starterCode: `<style>
  .cards { display: flex; gap: 8px; }
  .card { padding: 20px; background: #ff7058; color: white; }
</style>
<div class="cards">
  <div class="card">01</div>
  <div class="card">02</div>
  <div class="card">03</div>
</div>`,
    difficulty: "beginner",
    estimatedMinutes: 15,
    tags: ["CSS", "Flexbox", "alignment", "direction"],
    objective: "Forstå hvordan retningen i et flex-layout påvirker struktur.",
    successCriteria: [
      "Containeren bruger flex-direction",
      "Elementerne står lodret eller vandret som ønsket",
      "Layoutet er konsistent og læsbart",
    ],
  },
  {
    id: "flexbox-justify-content",
    classroomId: "FLEX_CLASSROOM",
    sortOrder: 3,
    topicTag: "CSS · ØVELSE 03",
    title: "Flexbox: Fordel elementer pænt",
    stepLabel: "BYG",
    stepTitle: "Justér indholdet fra start til slut",
    instructions:
      "Brug flexbox til at gøre menupunkter jævnt fordelt på bredden, så det sidste element flytter sig til højre.",
    hintTitle: "Et lille hint",
    hintBody:
      "Prøv justify-content: space-between; eller flex-end; på containeren.",
    taskTitle: "Din opgave",
    completedText:
      "justify-content styrer, hvordan børnene fordeles i containeren. Det er det værktøj du bruger, når du vil skabe balance i layoutet.",
    taskDescription:
      "Få menuen til at være pænt fordelt og skabe en mere professionel layoutbalance.",
    starterCode: `<style>
  .menu { display: flex; }
  .item { padding: 12px 18px; background: #ff7058; color: white; }
</style>
<nav class="menu">
  <span class="item">Hjem</span>
  <span class="item">Kurser</span>
  <span class="item">Profil</span>
</nav>`,
    difficulty: "intermediate",
    estimatedMinutes: 18,
    tags: ["CSS", "Flexbox", "alignment", "spacing"],
    objective: "Lær at styre distributionen af elementer i en flex-container.",
    successCriteria: [
      "Containeren bruger justify-content",
      "Elementerne fordeles med tydelig balance",
      "Det sidste element flytter sig ud mod slutningen af menuen",
    ],
  },
  {
    id: "javascript-greet-user",
    classroomId: "JS_CLASSROOM",
    sortOrder: 1,
    topicTag: "JAVASCRIPT · ØVELSE 01",
    title: "JavaScript: Skriv din første funktion",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Returnér en personlig hilsen",
    instructions:
      "Lav funktionen createGreeting, så den tager et navn og returnerer en hilsen i formatet Hej, Navn!.",
    hintTitle: "Et lille hint",
    hintBody:
      "Brug en parameter i funktionen og returnér en template string med navnet sat ind.",
    taskTitle: "Din opgave",
    completedText:
      "En funktion samler logik ét sted og kan bruges igen med forskellige inputværdier.",
    taskDescription:
      "Få createGreeting til at returnere en personlig tekst baseret på det navn, funktionen modtager.",
    starterCode: `function createGreeting(name) {
  return "Hej";
}`,
    difficulty: "beginner",
    estimatedMinutes: 12,
    tags: ["JavaScript", "functions", "parameters", "return"],
    objective: "Lær at skrive en funktion med input og output.",
    successCriteria: [
      "Funktionen createGreeting er defineret",
      "Funktionen modtager et navn som parameter",
      "Funktionen returnerer Hej, Navn! med det rigtige navn",
    ],
  },
  {
    id: "javascript-conditional-status",
    classroomId: "JS_CLASSROOM",
    sortOrder: 2,
    topicTag: "JAVASCRIPT · ØVELSE 02",
    title: "JavaScript: Arbejd med betingelser",
    stepLabel: "GRUNDLÆGGENDE",
    stepTitle: "Returnér den rigtige status",
    instructions:
      "Lav funktionen getCourseStatus, så den returnerer Aktiv når input er true og Ikke aktiv når input er false.",
    hintTitle: "Et lille hint",
    hintBody:
      "Brug if/else eller en ternary til at vælge mellem de to tekster.",
    taskTitle: "Din opgave",
    completedText:
      "Betingelser gør det muligt at ændre resultatet afhængigt af data eller brugerhandlinger.",
    taskDescription:
      "Få funktionen til at returnere forskellig tekst afhængigt af om kurset er aktivt eller ej.",
    starterCode: `function getCourseStatus(isActive) {
  return "Ukendt";
}`,
    difficulty: "beginner",
    estimatedMinutes: 14,
    tags: ["JavaScript", "conditions", "booleans", "logic"],
    objective: "Lær at styre output med simple betingelser.",
    successCriteria: [
      "Funktionen getCourseStatus er defineret",
      "true returnerer Aktiv",
      "false returnerer Ikke aktiv",
    ],
  },
  {
    id: "javascript-array-join",
    classroomId: "JS_CLASSROOM",
    sortOrder: 3,
    topicTag: "JAVASCRIPT · ØVELSE 03",
    title: "JavaScript: Formater en liste",
    stepLabel: "BYG",
    stepTitle: "Saml flere værdier til én tekst",
    instructions:
      'Lav funktionen formatTopics, så den tager en liste af emner og returnerer teksten HTML, CSS og JavaScript for listen ["HTML", "CSS", "JavaScript"].',
    hintTitle: "Et lille hint",
    hintBody:
      "Del listen op i de første elementer og det sidste element, så teksten får et naturligt dansk 'og'.",
    taskTitle: "Din opgave",
    completedText:
      "Når du kombinerer arrays og string-metoder, kan du bygge mere menneskelige og læsbare tekster.",
    taskDescription:
      "Formatér en liste af emner til én samlet sætning, der kan vises i interfacet.",
    starterCode: `function formatTopics(topics) {
  return topics.join(", ");
}`,
    difficulty: "intermediate",
    estimatedMinutes: 20,
    tags: ["JavaScript", "arrays", "strings", "formatting"],
    objective: "Lær at omdanne en liste af værdier til en mere læsbar tekst.",
    successCriteria: [
      "Funktionen formatTopics er defineret",
      "Listen samles til en enkelt tekststreng",
      "Det sidste element forbindes med ordet og",
    ],
  },
];

const validations = [
  {
    id: "validation-html-container-grouping",
    lessonId: "html-container-grouping",
    kind: "html",
  },
  {
    id: "validation-html-class-attribute",
    lessonId: "html-class-attribute",
    kind: "html",
  },
  {
    id: "validation-html-semantic-structure",
    lessonId: "html-semantic-structure",
    kind: "html",
  },
  {
    id: "validation-flexbox-layout-row",
    lessonId: "flexbox-layout-row",
    kind: "css",
  },
  {
    id: "validation-flexbox-direction-flow",
    lessonId: "flexbox-direction-flow",
    kind: "css",
  },
  {
    id: "validation-flexbox-justify-content",
    lessonId: "flexbox-justify-content",
    kind: "css",
  },
  {
    id: "validation-javascript-greet-user",
    lessonId: "javascript-greet-user",
    kind: "javascript",
  },
  {
    id: "validation-javascript-conditional-status",
    lessonId: "javascript-conditional-status",
    kind: "javascript",
  },
  {
    id: "validation-javascript-array-join",
    lessonId: "javascript-array-join",
    kind: "javascript",
  },
];

const validationChecks = [
  {
    id: "check-html-container-grouping-1",
    validationId: "validation-html-container-grouping",
    sortOrder: 1,
    type: "hasElement",
    selector: ".cards",
    message: "Du mangler en container med class cards.",
  },
  {
    id: "check-html-container-grouping-2",
    validationId: "validation-html-container-grouping",
    sortOrder: 2,
    type: "hasChild",
    parent: ".cards",
    child: ".card",
    message: "Kortene skal ligge inde i .cards-containeren.",
  },
  {
    id: "check-html-container-grouping-3",
    validationId: "validation-html-container-grouping",
    sortOrder: 3,
    type: "hasChildrenCount",
    parent: ".cards",
    child: ".card",
    count: 3,
    message: "Alle tre kort skal være samlet inde i containeren.",
  },
  {
    id: "check-html-class-attribute-1",
    validationId: "validation-html-class-attribute",
    sortOrder: 1,
    type: "hasElement",
    selector: "div",
    message: "Du mangler stadig en wrapper omkring kortene.",
  },
  {
    id: "check-html-class-attribute-2",
    validationId: "validation-html-class-attribute",
    sortOrder: 2,
    type: "hasAttribute",
    selector: ".cards",
    attribute: "class",
    value: "cards",
    message: 'Containeren skal have class="cards".',
  },
  {
    id: "check-html-class-attribute-3",
    validationId: "validation-html-class-attribute",
    sortOrder: 3,
    type: "hasChild",
    parent: ".cards",
    child: ".card",
    message: "Kortene skal stadig ligge inde i .cards-containeren.",
  },
  {
    id: "check-html-class-attribute-4",
    validationId: "validation-html-class-attribute",
    sortOrder: 4,
    type: "hasChildrenCount",
    parent: ".cards",
    child: ".card",
    count: 3,
    message: "Containeren skal indeholde alle tre kort.",
  },
  {
    id: "check-html-semantic-structure-1",
    validationId: "validation-html-semantic-structure",
    sortOrder: 1,
    type: "hasElement",
    selector: "main",
    message: "Siden skal stadig have et main-element.",
  },
  {
    id: "check-html-semantic-structure-2",
    validationId: "validation-html-semantic-structure",
    sortOrder: 2,
    type: "semanticTag",
    selector: "main",
    expectedTag: "main",
    message: "Brug et main-element til hovedindholdet.",
  },
  {
    id: "check-html-semantic-structure-3",
    validationId: "validation-html-semantic-structure",
    sortOrder: 3,
    type: "hasElement",
    selector: "header",
    message: "Brug et header-element til sidens introduktion.",
  },
  {
    id: "check-html-semantic-structure-4",
    validationId: "validation-html-semantic-structure",
    sortOrder: 4,
    type: "hasElement",
    selector: "section",
    message: "Brug mindst ét section-element til at opdele indholdet.",
  },
  {
    id: "check-html-semantic-structure-5",
    validationId: "validation-html-semantic-structure",
    sortOrder: 5,
    type: "hasElement",
    selector: "h1",
    message: "Siden skal have en tydelig hovedoverskrift.",
  },
  {
    id: "check-flexbox-layout-row-1",
    validationId: "validation-flexbox-layout-row",
    sortOrder: 1,
    type: "hasDeclaration",
    selector: ".cards",
    property: "display",
    value: "flex",
    message: "Containeren skal bruge display: flex.",
  },
  {
    id: "check-flexbox-layout-row-2",
    validationId: "validation-flexbox-layout-row",
    sortOrder: 2,
    type: "hasDeclaration",
    selector: ".cards",
    property: "gap",
    message: "Tilføj gap på .cards for at skabe afstand mellem kortene.",
  },
  {
    id: "check-flexbox-direction-flow-1",
    validationId: "validation-flexbox-direction-flow",
    sortOrder: 1,
    type: "hasDeclaration",
    selector: ".cards",
    property: "display",
    value: "flex",
    message: "Containeren skal stadig bruge display: flex.",
  },
  {
    id: "check-flexbox-direction-flow-2",
    validationId: "validation-flexbox-direction-flow",
    sortOrder: 2,
    type: "hasDeclaration",
    selector: ".cards",
    property: "flex-direction",
    value: "column",
    message: "Brug flex-direction: column på .cards.",
  },
  {
    id: "check-flexbox-direction-flow-3",
    validationId: "validation-flexbox-direction-flow",
    sortOrder: 3,
    type: "hasDeclaration",
    selector: ".cards",
    property: "gap",
    message: "Behold eller tilføj gap mellem kortene.",
  },
  {
    id: "check-flexbox-justify-content-1",
    validationId: "validation-flexbox-justify-content",
    sortOrder: 1,
    type: "hasDeclaration",
    selector: ".menu",
    property: "display",
    value: "flex",
    message: "Menuen skal bruge display: flex.",
  },
  {
    id: "check-flexbox-justify-content-2",
    validationId: "validation-flexbox-justify-content",
    sortOrder: 2,
    type: "hasDeclaration",
    selector: ".menu",
    property: "justify-content",
    value: "space-between",
    message:
      "Brug justify-content: space-between for at fordele menupunkterne.",
  },
  {
    id: "check-javascript-greet-user-1",
    validationId: "validation-javascript-greet-user",
    sortOrder: 1,
    type: "definesFunction",
    name: "createGreeting",
    message: "Du skal definere funktionen createGreeting.",
  },
  {
    id: "check-javascript-greet-user-2",
    validationId: "validation-javascript-greet-user",
    sortOrder: 2,
    type: "returnsExpected",
    name: "createGreeting",
    args: ["Ada"],
    expected: encodeJsonScalar("Hej, Ada!"),
    message:
      "createGreeting skal returnere teksten Hej, Ada! når funktionen får navnet Ada.",
  },
  {
    id: "check-javascript-conditional-status-1",
    validationId: "validation-javascript-conditional-status",
    sortOrder: 1,
    type: "definesFunction",
    name: "getCourseStatus",
    message: "Du skal definere funktionen getCourseStatus.",
  },
  {
    id: "check-javascript-conditional-status-2",
    validationId: "validation-javascript-conditional-status",
    sortOrder: 2,
    type: "returnsExpected",
    name: "getCourseStatus",
    args: [true],
    expected: encodeJsonScalar("Aktiv"),
    message: "getCourseStatus(true) skal returnere Aktiv.",
  },
  {
    id: "check-javascript-conditional-status-3",
    validationId: "validation-javascript-conditional-status",
    sortOrder: 3,
    type: "returnsExpected",
    name: "getCourseStatus",
    args: [false],
    expected: encodeJsonScalar("Ikke aktiv"),
    message: "getCourseStatus(false) skal returnere Ikke aktiv.",
  },
  {
    id: "check-javascript-array-join-1",
    validationId: "validation-javascript-array-join",
    sortOrder: 1,
    type: "definesFunction",
    name: "formatTopics",
    message: "Du skal definere funktionen formatTopics.",
  },
  {
    id: "check-javascript-array-join-2",
    validationId: "validation-javascript-array-join",
    sortOrder: 2,
    type: "returnsExpected",
    name: "formatTopics",
    args: [["HTML", "CSS", "JavaScript"]],
    expected: encodeJsonScalar("HTML, CSS og JavaScript"),
    message:
      "formatTopics skal samle listen til teksten HTML, CSS og JavaScript.",
  },
  {
    id: "check-javascript-array-join-3",
    validationId: "validation-javascript-array-join",
    sortOrder: 3,
    type: "includesText",
    value: "join",
    message: "Prøv at bruge join som en del af løsningen.",
  },
];

const projects = [
  {
    id: "giv-siden-nyt-liv",
    number: "01",
    numberVariant: "coral",
    title: "Giv din gamle side nyt liv",
    description: "Analyse · Idé · Første prototype",
  },
  {
    id: "design-til-en-bruger",
    number: "02",
    numberVariant: "yellow",
    title: "Design til en rigtig bruger",
    description: "Interview · Wireframe · Test",
  },
];

const users = [
  {
    id: "ada-lovelace",
    email: "ada@klarkode.dk",
    username: "ada",
    name: "Ada Lovelace",
  },
];

let pendingSeed: Promise<void> | undefined;

async function runSeed(): Promise<void> {
  await connectDatabase();

  for (const classroom of classrooms) {
    await db.orm.public.Classroom.upsert({
      create: classroom,
      update: classroom,
      conflictOn: { id: classroom.id },
    });
  }

  for (const course of courses) {
    await db.orm.public.Course.upsert({
      create: course,
      update: course,
      conflictOn: { id: course.id },
    });
  }

  for (const lesson of lessons) {
    await db.orm.public.Lesson.upsert({
      create: lesson,
      update: lesson,
      conflictOn: { id: lesson.id },
    });
  }

  for (const validation of validations) {
    await db.orm.public.LessonValidation.upsert({
      create: validation,
      update: validation,
      conflictOn: { id: validation.id },
    });
  }

  for (const check of validationChecks) {
    await db.orm.public.ValidationCheck.upsert({
      create: check,
      update: check,
      conflictOn: { id: check.id },
    });
  }

  for (const project of projects) {
    await db.orm.public.Project.upsert({
      create: project,
      update: project,
      conflictOn: { id: project.id },
    });
  }

  for (const user of users) {
    await db.orm.public.User.upsert({
      create: user,
      update: user,
      conflictOn: { id: user.id },
    });
  }
}

export function seed(): Promise<void> {
  pendingSeed ??= runSeed().catch((error: unknown) => {
    pendingSeed = undefined;
    throw error;
  });
  return pendingSeed;
}
