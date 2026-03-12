import { PrismaClient, Role, LessonType, InvitationStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Users ───────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@salestrack.com' },
    update: {},
    create: {
      email: 'admin@salestrack.com',
      name: 'Admin User',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`  ✓ Admin user: ${admin.email}`);

  const agent = await prisma.user.upsert({
    where: { email: 'agent@salestrack.com' },
    update: {},
    create: {
      email: 'agent@salestrack.com',
      name: 'Sales Agent',
      passwordHash,
      role: Role.AGENT,
      isActive: true,
    },
  });
  console.log(`  ✓ Agent user: ${agent.email}`);

  // ─── Groups ──────────────────────────────────────────
  const group = await prisma.group.upsert({
    where: { name: 'New Hires' },
    update: {},
    create: {
      name: 'New Hires',
      description: 'Onboarding group for newly hired sales agents',
    },
  });

  await prisma.groupMember.upsert({
    where: { userId_groupId: { userId: agent.id, groupId: group.id } },
    update: {},
    create: {
      userId: agent.id,
      groupId: group.id,
    },
  });
  console.log(`  ✓ Group: ${group.name} (1 member)`);

  // ─── Course ──────────────────────────────────────────
  const course = await prisma.course.create({
    data: {
      title: 'Cold Calling Techniques',
      description:
        'Master the art of cold calling with proven techniques, scripts, and real-world examples from top performers.',
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Introduction to Cold Calling',
            description: 'Learn the fundamentals and mindset needed for successful cold calls.',
            type: LessonType.VIDEO,
            content: {
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              source: 'youtube',
            },
            sortOrder: 0,
            durationSec: 600,
          },
          {
            title: 'The Perfect Opening Script',
            description: 'A proven script template for the first 30 seconds of your call.',
            type: LessonType.PDF,
            content: {
              url: '',
              s3Key: 'lessons/sample/opening-script.pdf',
              pageCount: 5,
            },
            sortOrder: 1,
          },
          {
            title: 'Handling Objections Like a Pro',
            description: 'Listen to a real sales call where objections are handled flawlessly.',
            type: LessonType.AUDIO,
            content: {
              url: '',
              s3Key: 'lessons/sample/objection-handling.mp3',
            },
            sortOrder: 2,
            durationSec: 480,
          },
          {
            title: 'Key Takeaways & Best Practices',
            description: 'Summary of the most important techniques covered in this module.',
            type: LessonType.TEXT,
            content: {
              body: `# Key Takeaways

## The 3-Second Rule
Always state your name, company, and reason for calling within the first 3 seconds.

## Mirror & Match
Match the prospect's tone, pace, and energy level to build rapport quickly.

## The Power of Silence
After asking a question, **stop talking**. Let the prospect fill the silence.

## Objection Handling Framework
1. **Acknowledge** — "I completely understand..."
2. **Reframe** — "What I've found is..."
3. **Redirect** — "Would it be fair to say...?"

## Follow-Up Timing
- Call back within 24 hours of a warm lead
- Send a recap email within 1 hour of any call
- Schedule the next touchpoint before hanging up`,
            },
            sortOrder: 3,
          },
        ],
      },
      quizzes: {
        create: [
          {
            title: 'Cold Calling Fundamentals Quiz',
            description: 'Test your knowledge of the cold calling techniques covered in this course.',
            passingScore: 80,
            sortOrder: 0,
            questions: {
              create: [
                {
                  text: 'What is the recommended time to state your name, company, and reason for calling?',
                  sortOrder: 0,
                  options: {
                    create: [
                      { text: 'Within 3 seconds', isCorrect: true, sortOrder: 0 },
                      { text: 'Within 10 seconds', isCorrect: false, sortOrder: 1 },
                      { text: 'Within 30 seconds', isCorrect: false, sortOrder: 2 },
                      { text: 'It doesn\'t matter', isCorrect: false, sortOrder: 3 },
                    ],
                  },
                },
                {
                  text: 'What should you do after asking a prospect a question?',
                  sortOrder: 1,
                  options: {
                    create: [
                      { text: 'Immediately offer more information', isCorrect: false, sortOrder: 0 },
                      { text: 'Stop talking and let them respond', isCorrect: true, sortOrder: 1 },
                      { text: 'Repeat the question', isCorrect: false, sortOrder: 2 },
                      { text: 'Move on to the next topic', isCorrect: false, sortOrder: 3 },
                    ],
                  },
                },
                {
                  text: 'What is the first step in the objection handling framework?',
                  sortOrder: 2,
                  options: {
                    create: [
                      { text: 'Redirect', isCorrect: false, sortOrder: 0 },
                      { text: 'Reframe', isCorrect: false, sortOrder: 1 },
                      { text: 'Acknowledge', isCorrect: true, sortOrder: 2 },
                      { text: 'Close', isCorrect: false, sortOrder: 3 },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`  ✓ Course: ${course.title} (4 lessons, 1 quiz)`);

  // ─── Course Assignment ───────────────────────────────
  await prisma.courseAssignment.create({
    data: {
      courseId: course.id,
      userId: agent.id,
      status: 'ASSIGNED',
    },
  });
  console.log(`  ✓ Assigned course to ${agent.name}`);

  console.log('\n✅ Seed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Admin: admin@salestrack.com / Password123!');
  console.log('  Agent: agent@salestrack.com / Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
