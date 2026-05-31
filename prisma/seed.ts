import { PrismaClient, AiUseCase, ExamType } from "@prisma/client";

const prisma = new PrismaClient();

const examTargets = [
  {
    type: ExamType.IBA,
    name: "IBA Admission",
    description: "Analytical English, math, and reasoning preparation for IBA aspirants.",
    timeLimitMinutes: 90,
    questionCount: 100,
    subjects: ["English", "Mathematics", "Analytical Ability"],
  },
  {
    type: ExamType.MEDICAL,
    name: "Medical Admission",
    description: "HSC-aligned biology, chemistry, physics, English, and GK practice.",
    timeLimitMinutes: 60,
    questionCount: 100,
    subjects: ["Biology", "Chemistry", "Physics", "English", "General Knowledge"],
  },
  {
    type: ExamType.DHAKA_B_UNIT,
    name: "Dhaka University B Unit",
    description: "Arts and humanities focused admission preparation.",
    timeLimitMinutes: 60,
    questionCount: 100,
    subjects: ["Bangla", "English", "General Knowledge"],
  },
  {
    type: ExamType.DHAKA_C_UNIT,
    name: "Dhaka University C Unit",
    description: "Business studies focused admission preparation.",
    timeLimitMinutes: 60,
    questionCount: 100,
    subjects: ["Accounting", "Business Principles", "English", "Bangla"],
  },
  {
    type: ExamType.DHAKA_D_UNIT,
    name: "Dhaka University D Unit",
    description: "Multi-disciplinary preparation for D Unit aspirants.",
    timeLimitMinutes: 60,
    questionCount: 100,
    subjects: ["Bangla", "English", "General Knowledge", "Analytical Ability"],
  },
];

const promptSeeds = [
  {
    useCase: AiUseCase.WRONG_ANSWER_EXPLANATION,
    version: 1,
    title: "Wrong answer explanation",
    body: "Explain why the correct answer is right, why the student's answer is wrong, and give one memory tip. Use simple Bangla-English phrasing. Max 120 words.",
  },
  {
    useCase: AiUseCase.FEYNMAN_GAP_DETECTION,
    version: 1,
    title: "Feynman gap detection",
    body: "Act as a confused student. Ask one follow-up question, identify what was understood and missed, then score clarity, simplicity, and logical flow.",
  },
  {
    useCase: AiUseCase.SOCRATIC_CHAIN,
    version: 1,
    title: "Socratic chain",
    body: "Do not reveal the answer. Ask one short guiding question that nudges the student toward the concept.",
  },
  {
    useCase: AiUseCase.FIRST_PRINCIPLES,
    version: 1,
    title: "First principles explanation",
    body: "Start from observable truth, avoid formulas in the first half, build step by step, and end with one analogy.",
  },
];

async function main() {
  for (const exam of examTargets) {
    const target = await prisma.examTarget.upsert({
      where: { type: exam.type },
      update: {
        name: exam.name,
        description: exam.description,
        timeLimitMinutes: exam.timeLimitMinutes,
        questionCount: exam.questionCount,
        isActive: true,
      },
      create: {
        type: exam.type,
        name: exam.name,
        description: exam.description,
        timeLimitMinutes: exam.timeLimitMinutes,
        questionCount: exam.questionCount,
      },
    });

    for (const [index, subjectName] of exam.subjects.entries()) {
      const slug = subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const subject = await prisma.subject.upsert({
        where: {
          examTargetId_slug: {
            examTargetId: target.id,
            slug,
          },
        },
        update: {
          name: subjectName,
          order: index + 1,
        },
        create: {
          examTargetId: target.id,
          name: subjectName,
          slug,
          order: index + 1,
        },
      });

      await prisma.chapter.upsert({
        where: {
          subjectId_slug: {
            subjectId: subject.id,
            slug: "foundation",
          },
        },
        update: {
          name: "Foundation",
          order: 1,
        },
        create: {
          subjectId: subject.id,
          name: "Foundation",
          slug: "foundation",
          order: 1,
        },
      });
    }
  }

  for (const prompt of promptSeeds) {
    await prisma.promptVersion.upsert({
      where: {
        useCase_version: {
          useCase: prompt.useCase,
          version: prompt.version,
        },
      },
      update: {
        title: prompt.title,
        body: prompt.body,
        isActive: true,
      },
      create: prompt,
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
