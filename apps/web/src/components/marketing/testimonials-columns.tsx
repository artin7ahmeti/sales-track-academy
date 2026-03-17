import Image from 'next/image';
import { FadeIn } from '@/components/animations/fade-in';
import { cn } from '@/lib/utils';
import styles from './testimonials-columns.module.css';

type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

const testimonials: Testimonial[] = [
  {
    text:
      'SalesTrack Academy gave us one place for onboarding, coaching, and certification. New reps are productive weeks faster.',
    image:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces',
    name: 'Maya Brooks',
    role: 'Enablement Director, Northstar Telecom',
  },
  {
    text:
      'The quiz checkpoints changed everything. Managers can finally see who understands the material and who needs coaching.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces',
    name: 'Ethan Ward',
    role: 'VP of Sales, LedgerAxis',
  },
  {
    text:
      'We replaced scattered docs and Loom links with guided courses. Completion rates went up immediately.',
    image:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces',
    name: 'Sofia Bennett',
    role: 'Training Lead, Peakline Energy',
  },
  {
    text:
      'Our field team loves that lessons work across video, audio, PDFs, and text. It fits the way reps actually learn.',
    image:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces',
    name: 'Noah Patel',
    role: 'Regional Manager, BrightCall Systems',
  },
  {
    text:
      'The analytics help us prove training impact instead of guessing. We can tie progress back to team performance.',
    image:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces',
    name: 'Chloe Rivera',
    role: 'Revenue Operations, Apex Bridge',
  },
  {
    text:
      'Assigning courses by group made rollout simple. We launched new product training to three teams in one afternoon.',
    image:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=160&h=160&fit=crop&crop=faces',
    name: 'Daniel Kim',
    role: 'Sales Ops Manager, Velora Health',
  },
  {
    text:
      'The learner experience feels polished, not like an internal tool. Our reps actually want to come back and finish modules.',
    image:
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&h=160&fit=crop&crop=faces',
    name: 'Lena Foster',
    role: 'Head of Onboarding, CrestPoint',
  },
  {
    text:
      'Certifications gave our reps a real sense of progress. It turned onboarding into something measurable and motivating.',
    image:
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=160&h=160&fit=crop&crop=faces',
    name: 'Marcus Hill',
    role: 'Director of Inside Sales, SignalForge',
  },
  {
    text:
      'We used to spend hours tracking training manually. Now every lesson, quiz, and completion milestone is in one workflow.',
    image:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces',
    name: 'Ava Chen',
    role: 'Operations Lead, HarborIQ',
  },
];

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <div className="w-full max-w-sm rounded-[2rem] border border-border/70 bg-background px-8 py-8 shadow-xl shadow-primary/10">
      <p className="text-[15px] leading-7 tracking-tight text-foreground/85">
        {testimonial.text}
      </p>

      <div className="mt-6 flex items-center gap-3">
        <Image
          src={testimonial.image}
          alt={testimonial.name}
          width={48}
          height={48}
          className="size-12 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <div className="text-sm font-medium leading-5 tracking-tight">
            {testimonial.name}
          </div>
          <div className="text-sm leading-5 tracking-tight text-muted-foreground">
            {testimonial.role}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsColumn({
  className,
  testimonials,
  duration,
  reverse = false,
}: {
  className?: string;
  testimonials: Testimonial[];
  duration: number;
  reverse?: boolean;
}) {
  return (
    <div className={cn(styles.viewport, className)}>
      <div
        className={cn(styles.track, reverse && styles.reverse, 'bg-background')}
        style={{ ['--duration' as string]: `${duration}s` }}
      >
        {[0, 1].map((groupIndex) => (
          <div
            key={groupIndex}
            className={styles.group}
            aria-hidden={groupIndex === 1}
          >
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={`${groupIndex}-${testimonial.name}`}
                testimonial={testimonial}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TestimonialsColumns() {
  const columns = [
    testimonials.filter((_, index) => index % 3 === 0),
    testimonials.filter((_, index) => index % 3 === 1),
    testimonials.filter((_, index) => index % 3 === 2),
  ];

  return (
    <section id="testimonials" className="relative overflow-hidden border-t py-20">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-primary/[0.04] to-transparent" />
      <div className="absolute left-1/2 top-24 h-56 w-56 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6">
        <FadeIn>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Trusted by teams building a stronger sales floor
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sales leaders use SalesTrack Academy to make onboarding repeatable,
              measurable, and easier to scale across the organization.
            </p>
          </div>
        </FadeIn>

        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:hidden">
          {testimonials.slice(0, 4).map((testimonial) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} />
          ))}
        </div>

        <div className="mt-14 hidden gap-6 lg:grid lg:grid-cols-3">
          <TestimonialsColumn
            className="pt-10"
            testimonials={columns[0]}
            duration={24}
          />
          <TestimonialsColumn
            testimonials={columns[1]}
            duration={28}
            reverse
          />
          <TestimonialsColumn
            className="pt-6"
            testimonials={columns[2]}
            duration={26}
          />
        </div>
      </div>
    </section>
  );
}
