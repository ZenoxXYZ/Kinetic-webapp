"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Clock,
  Home,
  Lock,
  LogOut,
  Send,
  Settings,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Users,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Toaster, toast } from "sonner";

type Screen =
  | "loading"
  | "login"
  | "onboarding"
  | "path-building"
  | "dashboard"
  | "practice"
  | "progress"
  | "mentors"
  | "feynman"
  | "profile";

type PracticeOrigin = "dashboard" | "progress";

type Question = {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  deeper: string;
  subject: string;
  source: string;
  difficulty: "green" | "orange" | "red";
};

type PathNode = {
  id: string;
  kind: "topic" | "checkpoint";
  x: number;
  y: number;
  title: string;
  week: string;
  subtitle?: string;
  status: "completed" | "current" | "locked" | "final";
  progressText?: string;
};

const BRAND = "#1A56DB";
const GREEN = "#0E9F6E";
const RED = "#E02424";
const GOLD = "#F59E0B";
const CARD = "#1E293B";

const questions: Question[] = [
  {
    prompt: "Choose the grammatically correct sentence:",
    options: [
      "He don't know the answer",
      "He doesn't know the answer",
      "He doesn't knows the answer",
      "He do not know the answer",
    ],
    correctIndex: 1,
    subject: "Subject-Verb Agreement",
    source: "IBA English",
    difficulty: "green",
    explanation:
      "With he/she/it we always use doesn't + base verb. Never don't or doesn't knows. This is called subject-verb agreement, one of IBA's most tested rules.",
    deeper:
      "Think of doesn't as already carrying the grammar load for he/she/it. Once does is present, the main verb stays plain: know, go, write. That is why doesn't know is correct.",
  },
  {
    prompt: "If a train travels 120km in 2 hours, what is its speed in m/s?",
    options: ["60 m/s", "33.33 m/s", "40 m/s", "45 m/s"],
    correctIndex: 1,
    subject: "Ratio & Proportion",
    source: "IBA Quant",
    difficulty: "red",
    explanation:
      "120km = 120,000m. 2 hours = 7,200 seconds. Speed = 120,000 / 7,200 = 16.67 m/s. Wait: trick! The marked answer is 33.33 m/s only if the question means one-way. Always re-read distance questions.",
    deeper:
      "The learning point is unit conversion plus suspicion. IBA often tests whether you convert hours to seconds and whether you notice wording traps before rushing into arithmetic.",
  },
  {
    prompt: "Which analogy best completes: Pen is to Writer as Brush is to ___?",
    options: ["Canvas", "Paint", "Artist", "Color"],
    correctIndex: 2,
    subject: "Analogy",
    source: "IBA Verbal",
    difficulty: "orange",
    explanation:
      "A pen is the tool a writer uses. A brush is the tool an artist uses. The relationship is tool to user, not tool to material.",
    deeper:
      "When solving analogies, name the relationship first. Here it is instrument to person. Canvas and paint are related to brush, but they do not match the same logical relationship.",
  },
  {
    prompt: "A shopkeeper buys at ৳80, sells at ৳100. Profit percentage?",
    options: ["20%", "25%", "30%", "15%"],
    correctIndex: 1,
    subject: "Profit & Loss",
    source: "IBA Quant",
    difficulty: "orange",
    explanation:
      "Profit = 100 - 80 = ৳20. Profit % = (Profit / Cost) x 100 = (20 / 80) x 100 = 25%. Common mistake: dividing by selling price instead of cost.",
    deeper:
      "Profit percentage always uses cost price as the base because it measures return on what you invested, not return on what the buyer paid.",
  },
  {
    prompt: "Choose the correct meaning of 'Ephemeral':",
    options: ["Permanent", "Ancient", "Short-lived", "Powerful"],
    correctIndex: 2,
    subject: "Vocabulary",
    source: "IBA English",
    difficulty: "green",
    explanation:
      "Ephemeral means lasting for a very short time. Memory trick: think one-day mayfly. The word comes from Greek ephemeros meaning daily or short.",
    deeper:
      "Vocabulary sticks better when attached to an image. Picture a social media story that disappears fast: that is ephemeral.",
  },
];

const subjects = [
  { label: "English RC", score: 54 },
  { label: "Quantitative", score: 71 },
  { label: "Analytical", score: 84 },
  { label: "General Know.", score: 38 },
];

const mentors = [
  {
    name: "Nafisa Rahman",
    title: "IBA - Business, Dhaka University",
    rating: 4.9,
    sessions: 127,
    subjects: ["English", "Quant"],
    price: 100,
    initials: "NR",
    topRated: true,
  },
  {
    name: "Samin Chowdhury",
    title: "IBA - Finance, Dhaka University",
    rating: 4.8,
    sessions: 94,
    subjects: ["Quant", "Analytical"],
    price: 100,
    initials: "SC",
    topRated: false,
  },
  {
    name: "Tashfia Karim",
    title: "DU - Economics, Dhaka University",
    rating: 4.7,
    sessions: 83,
    subjects: ["English", "GK"],
    price: 100,
    initials: "TK",
    topRated: false,
  },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function scoreTone(score: number) {
  if (score < 45) return RED;
  if (score < 60) return "#F97316";
  if (score < 80) return GOLD;
  return GREEN;
}

function useCountUp(target: number, duration = 1000, key = "default") {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frame = 0;
    let animationId = 0;
    const frames = Math.max(Math.round(duration / 16), 1);

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / frames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));

      if (progress < 1) {
        animationId = window.requestAnimationFrame(tick);
      }
    };

    setValue(0);
    animationId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationId);
  }, [target, duration, key]);

  return value;
}

function useCountDown(start: number, end: number, duration = 1000, key = "default") {
  const [value, setValue] = useState(start);

  useEffect(() => {
    let frame = 0;
    let animationId = 0;
    const frames = Math.max(Math.round(duration / 16), 1);

    const tick = () => {
      frame += 1;
      const progress = Math.min(frame / frames, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start - (start - end) * eased));

      if (progress < 1) {
        animationId = window.requestAnimationFrame(tick);
      }
    };

    setValue(start);
    animationId = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(animationId);
  }, [start, end, duration, key]);

  return value;
}

function useTypewriter(text: string, speed = 22, key = "default") {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    setVisible("");
    let index = 0;
    const id = window.setInterval(() => {
      index += 1;
      setVisible(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(id);
      }
    }, speed);

    return () => window.clearInterval(id);
  }, [text, speed, key]);

  return visible;
}

function useSound() {
  const [muted, setMuted] = useState(true);
  const audioRef = useRef<AudioContext | null>(null);

  const tone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine", delay = 0) => {
      if (muted || typeof window === "undefined") {
        return;
      }

      const AudioCtor = window.AudioContext || window.webkitAudioContext;

      if (!AudioCtor) {
        return;
      }

      const context = audioRef.current ?? new AudioCtor();
      audioRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = context.currentTime + delay;

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.12, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.02);
    },
    [muted],
  );

  const play = useCallback(
    (event: "correct" | "wrong" | "xp" | "streak") => {
      if (event === "correct") {
        tone(440, 0.3);
        return;
      }

      if (event === "wrong") {
        tone(200, 0.2, "triangle");
        return;
      }

      if (event === "xp") {
        tone(520, 0.16);
        tone(760, 0.18, "sine", 0.14);
        return;
      }

      tone(330, 0.18);
      tone(440, 0.24, "sine", 0.12);
    },
    [tone],
  );

  return { muted, setMuted, play };
}

function DemoButton({
  children,
  className,
  variant = "primary",
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "outline" | "ghost" | "danger";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      className={cn(
        "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black tracking-normal transition-all disabled:opacity-45",
        variant === "primary" &&
          "bg-gradient-to-r from-[#1A56DB] to-[#2563EB] text-white shadow-[0_0_28px_rgba(26,86,219,0.36)]",
        variant === "outline" &&
          "border border-slate-600 bg-transparent text-slate-100 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
        variant === "ghost" && "bg-slate-800/70 text-slate-200",
        variant === "danger" &&
          "bg-[#E02424] text-white shadow-[0_0_24px_rgba(224,36,36,0.32)]",
        className,
      )}
    >
      {children}
    </motion.button>
  );
}

function GameCard({
  children,
  className,
  delay = 0,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}) {
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 26 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.36, ease: "easeOut" }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "rounded-2xl border border-white/5 bg-[#1E293B] shadow-[0_18px_50px_rgba(2,6,23,0.35)]",
        onClick && "w-full text-left",
        className,
      )}
    >
      {children}
    </Component>
  );
}

function DemoModeBanner() {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => toast("Full launch coming soon. Built by Kinetic Academy.")}
      className="sticky top-0 z-30 mx-auto mt-2 flex rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1.5 text-[11px] font-black text-blue-100 backdrop-blur-xl"
    >
      🚧 Demo Mode - Beta v0.1
    </motion.button>
  );
}

function SplashScreen() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[#0F172A] px-6 text-white">
      <div className="w-full max-w-[360px] text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", damping: 14, stiffness: 150 }}
          className="mx-auto grid size-24 place-items-center rounded-full bg-[#1A56DB] text-5xl font-black shadow-[0_0_60px_rgba(26,86,219,0.72)]"
        >
          K
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.45 }}
          className="mt-6 text-3xl font-black tracking-normal"
        >
          Kinetic Academy
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75, duration: 0.45 }}
          className="mt-2 text-sm font-bold text-blue-200"
        >
          Your AI Admission Copilot 🚀
        </motion.p>
        <div className="mt-12 h-2 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#1A56DB] to-[#0E9F6E]"
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.65, ease: "easeInOut" }}
          />
        </div>
      </div>
    </main>
  );
}

function LogoLockup() {
  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ rotate: -8, scale: 0.85 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 180 }}
        className="grid size-14 place-items-center rounded-2xl bg-[#1A56DB] text-2xl font-black text-white shadow-[0_0_36px_rgba(26,86,219,0.65)]"
      >
        K
      </motion.div>
      <div>
        <p className="text-2xl font-black tracking-normal text-white">
          Kinetic Academy
        </p>
        <p className="text-sm font-bold text-blue-200">
          Your AI Admission Copilot 🚀
        </p>
      </div>
    </div>
  );
}

function FloatingLabelPhone({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <span className="absolute bottom-3 left-4 z-10 text-base font-black text-slate-300">
        +880
      </span>
      <motion.label
        animate={{
          y: value ? -29 : 0,
          scale: value ? 0.82 : 1,
          color: value ? "#93C5FD" : "#94A3B8",
          x: value ? 0 : 48,
        }}
        className="pointer-events-none absolute left-4 top-3 origin-left text-base font-bold"
      >
        Phone number
      </motion.label>
      <input
        inputMode="numeric"
        maxLength={10}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        className="h-16 w-full rounded-2xl border border-slate-600 bg-[#1E293B] px-4 pl-20 pt-5 text-lg font-black text-white outline-none transition-all focus:border-[#1A56DB] focus:shadow-[0_0_26px_rgba(26,86,219,0.36)]"
      />
    </div>
  );
}

function LoginScreen({ onEnter }: { onEnter: () => void }) {
  const [phone, setPhone] = useState("");

  const handleEnter = () => {
    const visiblePhone = phone.length >= 9 ? `01${phone.slice(1, 10)}` : "01XXXXXXXXX";
    toast.success(`OTP sent to ${visiblePhone} ✓`);
    onEnter();
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex min-h-dvh flex-col bg-[#0F172A] px-5 pb-8"
    >
      <DemoModeBanner />
      <div className="flex flex-1 flex-col justify-between gap-10 pt-8">
        <div className="space-y-10">
          <LogoLockup />
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="space-y-3"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-black text-blue-200">
              <Sparkles className="size-4" />
              Co-founder demo mode
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-white">
              Turn exam prep into a daily winning streak.
            </h1>
            <p className="text-base font-medium leading-7 text-slate-300">
              Practice fast, learn deeply, and command your IBA prep like a war room.
            </p>
          </motion.div>
        </div>

        <GameCard className="space-y-5 p-5" delay={0.18}>
          <FloatingLabelPhone value={phone} onChange={setPhone} />
          <DemoButton className="w-full" onClick={handleEnter}>
            Send OTP
            <Send className="size-4" />
          </DemoButton>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <div className="h-px flex-1 bg-slate-700" />
            or continue with
            <div className="h-px flex-1 bg-slate-700" />
          </div>
          <DemoButton className="w-full" variant="outline" onClick={handleEnter}>
            <span className="grid size-6 place-items-center rounded-full bg-white text-sm font-black text-slate-950">
              G
            </span>
            Continue with Google
          </DemoButton>
        </GameCard>
      </div>
    </motion.section>
  );
}

function OnboardingScreen({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);
  const [exam, setExam] = useState("IBA");
  const [timeline, setTimeline] = useState("Less than 1 month 🔥");
  const [level, setLevel] = useState(1);

  const cards = useMemo(
    () => [
      {
        title: "Which exam are you targeting? 🎯",
        body: (
          <div className="grid grid-cols-2 gap-3">
            {["IBA", "Medical", "B Unit", "C Unit"].map((option) => (
              <ChoiceButton
                key={option}
                active={exam === option}
                label={option}
                onClick={() => setExam(option)}
              />
            ))}
          </div>
        ),
      },
      {
        title: "When is your exam? 📅",
        body: (
          <div className="space-y-3">
            {["Less than 1 month 🔥", "1-3 months ⚡", "3+ months 🌱"].map((option) => (
              <ChoiceButton
                key={option}
                active={timeline === option}
                label={option}
                onClick={() => setTimeline(option)}
              />
            ))}
          </div>
        ),
      },
      {
        title: "How would you rate yourself? 💪",
        body: (
          <div className="space-y-6">
            <input
              type="range"
              min={0}
              max={2}
              step={1}
              value={level}
              onChange={(event) => setLevel(Number(event.target.value))}
              className="w-full accent-[#1A56DB]"
            />
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black text-slate-400">
              {["Beginner", "Balanced", "Advanced"].map((label, index) => (
                <span
                  key={label}
                  className={cn(index === level && "text-blue-200")}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="rounded-2xl bg-blue-500/10 p-4 text-sm font-bold leading-6 text-blue-100">
              Great. We will tune your IBA path for {exam}, {timeline.toLowerCase()}, and a{" "}
              {["beginner", "balanced", "advanced"][level]} starting point.
            </div>
          </div>
        ),
      },
    ],
    [exam, level, timeline],
  );

  const goNext = () => {
    if (step === cards.length - 1) {
      onComplete();
      return;
    }

    setStep((value) => Math.min(value + 1, cards.length - 1));
  };

  const dragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number } }) => {
    if (info.offset.x < -40) {
      setStep((value) => Math.min(value + 1, cards.length - 1));
    }

    if (info.offset.x > 40) {
      setStep((value) => Math.max(value - 1, 0));
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -24 }}
      className="flex min-h-dvh flex-col bg-[#0F172A] px-5 pb-8"
    >
      <DemoModeBanner />
      <div className="flex flex-1 flex-col justify-between gap-8 pt-8">
        <div className="space-y-5">
          <LogoLockup />
          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <motion.div
              className="h-full rounded-full bg-[#1A56DB]"
              animate={{ width: `${((step + 1) / cards.length) * 100}%` }}
              transition={{ duration: 0.35 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={dragEnd}
            initial={{ opacity: 0, x: 50, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: -50, rotate: -2 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="rounded-[2rem] border border-white/5 bg-[#1E293B] p-5 shadow-[0_24px_70px_rgba(2,6,23,0.45)]"
          >
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              Setup {step + 1} of 3
            </p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-white">
              {cards[step].title}
            </h1>
            <div className="mt-7">{cards[step].body}</div>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-4">
          <div className="flex justify-center gap-2">
            {cards.map((card, index) => (
              <button
                key={card.title}
                type="button"
                onClick={() => setStep(index)}
                aria-label={`Go to setup step ${index + 1}`}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === step ? "w-8 bg-[#1A56DB]" : "w-2 bg-slate-600",
                )}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <DemoButton
              variant="outline"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(value - 1, 0))}
            >
              Back
            </DemoButton>
            <DemoButton onClick={goNext}>
              {step === cards.length - 1 ? "Let's Go 🚀" : "Next →"}
            </DemoButton>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function ChoiceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "min-h-14 rounded-2xl border px-4 text-sm font-black transition-all",
        active
          ? "border-blue-300 bg-[#1A56DB] text-white shadow-[0_0_28px_rgba(26,86,219,0.35)]"
          : "border-slate-600 bg-slate-900/40 text-slate-200",
      )}
    >
      {label}
    </motion.button>
  );
}

function PathBuildingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, 1500);
    return () => window.clearTimeout(id);
  }, [onDone]);

  return (
    <main className="grid min-h-dvh place-items-center bg-[#0F172A] px-6 text-center text-white">
      <div className="max-w-[340px]">
        <motion.div
          animate={{ rotate: [0, 8, -8, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          className="mx-auto grid size-24 place-items-center rounded-[2rem] bg-blue-500/15 text-5xl shadow-[0_0_50px_rgba(26,86,219,0.42)]"
        >
          🧠
        </motion.div>
        <h1 className="mt-7 text-3xl font-black leading-tight">
          Building your personal path...
        </h1>
        <p className="mt-3 text-sm font-bold leading-6 text-blue-100">
          Calibrating IBA sprint pace, weak areas, and daily XP rhythm.
        </p>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#1A56DB] via-[#0E9F6E] to-[#F59E0B]"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  value,
  label,
  tone,
  delay,
  danger,
  warning,
  onClick,
}: {
  icon: string;
  value: string;
  label: string;
  tone: string;
  delay: number;
  danger?: boolean;
  warning?: string;
  onClick?: () => void;
}) {
  return (
    <GameCard
      delay={delay}
      onClick={onClick}
      className={cn(
        "min-h-32 p-3 text-center",
        danger && "bg-gradient-to-b from-red-500/20 to-orange-500/10 shadow-[0_0_34px_rgba(224,36,36,0.32)] ring-1 ring-red-400/30",
      )}
    >
      <motion.div
        animate={danger ? { scale: [1, 1.18, 1] } : { scale: [1, 1.06, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
        className="text-3xl"
      >
        {icon}
      </motion.div>
      <p
        className="mt-2 text-3xl font-black tracking-normal"
        style={{ color: tone, textShadow: `0 0 18px ${tone}66` }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] font-black uppercase tracking-normal text-slate-400">
        {label}
      </p>
      {warning ? (
        <p className="mt-2 text-[10px] font-black leading-4 text-orange-200">
          {warning}
        </p>
      ) : null}
    </GameCard>
  );
}

function CountdownRing({ percent }: { percent: number }) {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative grid size-16 place-items-center">
      <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#334155" strokeWidth="7" />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={BRAND}
          strokeLinecap="round"
          strokeWidth="7"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <Target className="absolute size-5 text-blue-200" />
    </div>
  );
}

function DashboardScreen({
  startPractice,
  setScreen,
  streakAtRisk,
  journeyAdvanced,
}: {
  startPractice: (origin: PracticeOrigin, topic: string) => void;
  setScreen: (screen: Screen) => void;
  streakAtRisk: boolean;
  journeyAdvanced: boolean;
}) {
  const xp = useCountUp(2340, 1500, "dashboard-xp");
  const streak = useCountUp(7, 900, "dashboard-streak");
  const rank = useCountDown(100, 47, 1250, "dashboard-rank");
  const days = useCountUp(23, 900, "dashboard-days");
  const currentTopic = journeyAdvanced ? "Time & Work" : "Ratio & Proportion";
  const weekProgress = journeyAdvanced ? "Week 2 • 3/5 done" : "Week 2 • 2/5 done";
  const weakest = useMemo(
    () => subjects.reduce((min, item) => (item.score < min.score ? item : min), subjects[0]),
    [],
  );
  const actionCards = useMemo(
    () => [
      {
        icon: "⚡",
        title: "Quick Practice",
        subtitle: "5 questions",
        onClick: () => startPractice("dashboard", "IBA Mixed Sprint"),
        primary: true,
      },
      {
        icon: "📝",
        title: "Mock Test",
        subtitle: "Full IBA sprint",
        onClick: () => setScreen("progress"),
        primary: false,
      },
      {
        icon: "🧠",
        title: "Teach the AI",
        subtitle: "Feynman check",
        onClick: () => setScreen("feynman"),
        primary: false,
      },
      {
        icon: "👥",
        title: "Find Mentor",
        subtitle: "Top scorers",
        onClick: () => setScreen("mentors"),
        primary: false,
      },
    ],
    [setScreen, startPractice],
  );

  return (
    <ScreenFrame>
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A56DB] via-[#1747B8] to-[#0F172A] p-5 shadow-[0_0_42px_rgba(26,86,219,0.32)]"
      >
        <div className="absolute -right-16 -top-16 size-40 rounded-full bg-white/10 blur-xl" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-blue-100">আস্সালামুয়ালাইকুম 👋</p>
            <h1 className="mt-1 text-4xl font-black tracking-normal text-white">Zarif</h1>
            <p className="mt-2 text-xs font-bold text-blue-100">IBA battle plan is live</p>
          </div>
          <div className="relative">
            <motion.div
              animate={{ boxShadow: ["0 0 0 #1A56DB00", "0 0 28px #60A5FAAA", "0 0 0 #1A56DB00"] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="grid size-16 place-items-center rounded-full border-4 border-blue-300 bg-[#1E293B] text-xl font-black text-white"
            >
              Z
            </motion.div>
            <div className="absolute -right-1 -top-1 grid size-8 place-items-center rounded-full bg-[#0F172A] text-blue-200 ring-2 ring-blue-300">
              <Bell className="size-4" />
            </div>
          </div>
        </div>
      </motion.header>

      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon="🔥"
          value={String(streak)}
          label="Day Streak"
          tone={streakAtRisk ? "#FDBA74" : GOLD}
          delay={0}
          danger={streakAtRisk}
          warning={streakAtRisk ? "Practice today to save your streak! 🔥" : undefined}
          onClick={streakAtRisk ? () => startPractice("dashboard", "Streak Saver Sprint") : undefined}
        />
        <StatCard icon="⚡" value={formatNumber(xp)} label="Total XP" tone={GOLD} delay={0.1} />
        <StatCard icon="🏆" value={`#${rank}`} label="This Week" tone="#FFFFFF" delay={0.2} />
      </div>

      <GameCard delay={0.25} className="bg-[#27243B] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-full bg-blue-500/20 px-4 py-2 text-xs font-black text-blue-200 ring-1 ring-blue-400/30">
            IBA
          </div>
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="text-center"
          >
            <p className="text-5xl font-black text-white" style={{ textShadow: "0 0 24px rgba(245,158,11,0.38)" }}>
              {days}
            </p>
            <p className="text-xs font-black uppercase tracking-normal text-slate-400">days left</p>
          </motion.div>
          <CountdownRing percent={68} />
        </div>
      </GameCard>

      <GameCard
        delay={0.29}
        onClick={() => setScreen("progress")}
        className="overflow-hidden p-5 shadow-[0_0_34px_rgba(26,86,219,0.22)] ring-1 ring-blue-500/25"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-black text-blue-200">Continue Journey →</p>
            <h2 className="mt-1 text-xl font-black text-white">{currentTopic}</h2>
            <p className="mt-1 text-xs font-bold text-slate-400">{weekProgress}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-3">
            <span className="size-3 rounded-full bg-[#0E9F6E]" />
            <span className="relative size-4 rounded-full bg-[#1A56DB] shadow-[0_0_20px_rgba(26,86,219,0.75)]">
              <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/60" />
            </span>
            <span className="size-3 rounded-full bg-slate-600" />
          </div>
        </div>
      </GameCard>

      <motion.button
        type="button"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.32, type: "spring", stiffness: 240, damping: 16 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => startPractice("dashboard", "IBA Mixed Sprint")}
        className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#1A56DB] to-[#2563EB] px-5 py-4 text-left shadow-[0_0_34px_rgba(26,86,219,0.36)]"
      >
        <span>
          <span className="block text-lg font-black text-white">Start Practice</span>
          <span className="text-xs font-bold text-blue-100">5-question IBA sprint</span>
        </span>
        <Zap className="size-6 text-white" />
      </motion.button>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-white">War Room 🎯</h2>
          <span className="text-xs font-black text-slate-500">Live strengths</span>
        </div>
        <div className="space-y-3">
          {subjects.map((subject, index) => {
            const color = scoreTone(subject.score);
            const isWeakest = subject.label === weakest.label;

            return (
              <GameCard key={subject.label} delay={0.35 + index * 0.07} className="p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black text-white">{subject.label}</p>
                    {isWeakest ? (
                      <span className="text-[11px] font-black text-red-300">Focus here →</span>
                    ) : null}
                  </div>
                  <p className="text-sm font-black" style={{ color }}>{subject.score}%</p>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-700">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${subject.score}%` }}
                    transition={{ delay: 0.8 + index * 0.08, duration: 0.75 }}
                  />
                </div>
              </GameCard>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 pb-3">
        {actionCards.map((action, index) => (
          <motion.button
            key={action.title}
            initial={{ opacity: 0, scale: 0.76, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.55 + index * 0.08, type: "spring", stiffness: 250, damping: 16 }}
            whileTap={{ scale: 0.94 }}
            onClick={action.onClick}
            className={cn(
              "rounded-2xl border border-white/5 bg-[#1E293B] p-4 text-left shadow-[0_18px_42px_rgba(2,6,23,0.28)]",
              action.primary && "shadow-[0_0_34px_rgba(26,86,219,0.3)] ring-1 ring-blue-500/30",
            )}
          >
            <p className="text-3xl">{action.icon}</p>
            <p className="mt-2 text-sm font-black text-white">{action.title}</p>
            <p className="text-xs font-bold text-slate-400">{action.subtitle}</p>
          </motion.button>
        ))}
      </div>
    </ScreenFrame>
  );
}

function PracticeTimer({ questionIndex }: { questionIndex: number }) {
  const [seconds, setSeconds] = useState(90);

  useEffect(() => {
    setSeconds(90);
    const id = window.setInterval(() => {
      setSeconds((value) => Math.max(value - 1, 0));
    }, 1000);

    return () => window.clearInterval(id);
  }, [questionIndex]);

  const urgent = seconds < 30;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return (
    <motion.div
      animate={urgent ? { scale: [1, 1.08, 1] } : { scale: 1 }}
      transition={{ duration: 0.55, repeat: urgent ? Infinity : 0 }}
      className={cn(
        "flex items-center gap-1 rounded-full px-3 py-2 text-xs font-black",
        urgent ? "bg-red-500/15 text-red-300" : "bg-slate-800 text-slate-200",
      )}
    >
      <Clock className="size-4" />
      {String(minutes).padStart(2, "0")}:{String(remaining).padStart(2, "0")}
    </motion.div>
  );
}

function ConfettiBurst({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 mx-auto h-44 max-w-[430px] overflow-hidden">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <motion.span
          key={item}
          initial={{ opacity: 1, y: -20, x: 190 }}
          animate={{ opacity: 0, y: 150, x: 28 + item * 43, rotate: 240 + item * 28 }}
          transition={{ duration: 0.92, ease: "easeOut" }}
          className="absolute top-0 size-3 rounded-sm"
          style={{ backgroundColor: [GOLD, GREEN, BRAND, "#F97316", "#FFFFFF", RED, "#22D3EE", "#A78BFA", "#FACC15"][item] }}
        />
      ))}
    </div>
  );
}

function ResultsScreen({
  score,
  xp,
  weakestArea,
  onRetry,
  onFinish,
  finishLabel,
}: {
  score: number;
  xp: number;
  weakestArea: string;
  onRetry: () => void;
  onFinish: () => void;
  finishLabel: string;
}) {
  return (
    <ScreenFrame>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onFinish}
          className="grid size-11 place-items-center rounded-2xl bg-slate-800 text-slate-200"
          aria-label={finishLabel}
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <p className="text-sm font-black text-blue-200">Practice complete</p>
          <h1 className="text-3xl font-black text-white">Mission Report 🏆</h1>
        </div>
      </div>

      <GameCard className="p-6 text-center" delay={0.05}>
        <Trophy className="mx-auto size-14 text-[#F59E0B]" />
        <p className="mt-4 text-6xl font-black text-white">{score}/5</p>
        <p className="mt-2 text-sm font-bold text-slate-400">correct answers</p>
        <div className="mt-5 rounded-2xl bg-amber-500/15 px-4 py-3 text-lg font-black text-amber-300">
          {xp} XP earned ⚡
        </div>
      </GameCard>

      <GameCard className="p-5" delay={0.14}>
        <p className="text-sm font-black text-slate-400">Your weakest area</p>
        <p className="mt-2 text-2xl font-black text-white">{weakestArea}</p>
      </GameCard>

      <div className="grid grid-cols-2 gap-3">
        <DemoButton variant="outline" onClick={onRetry}>Try Again</DemoButton>
        <DemoButton onClick={onFinish}>{finishLabel}</DemoButton>
      </div>
    </ScreenFrame>
  );
}

function PracticeScreen({
  setScreen,
  muted,
  setMuted,
  playSound,
  practiceTopic,
  origin,
  onComplete,
}: {
  setScreen: (screen: Screen) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  playSound: (event: "correct" | "wrong" | "xp" | "streak") => void;
  practiceTopic: string;
  origin: PracticeOrigin;
  onComplete: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [wrongSubjects, setWrongSubjects] = useState<string[]>([]);
  const [showSheet, setShowSheet] = useState(false);
  const [showDeep, setShowDeep] = useState(false);
  const [showXp, setShowXp] = useState(false);
  const [flash, setFlash] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [complete, setComplete] = useState(false);
  const current = questions[questionIndex];
  const xp = score * 10;
  const progress = ((questionIndex + 1) / questions.length) * 100;

  const finishPractice = useCallback(() => {
    if (origin === "progress") {
      onComplete();
      return;
    }

    setComplete(true);
    setSelected(null);
    setShowSheet(false);
    setShowDeep(false);
  }, [onComplete, origin]);

  const resetPractice = () => {
    setQuestionIndex(0);
    setSelected(null);
    setScore(0);
    setWrongSubjects([]);
    setShowSheet(false);
    setShowDeep(false);
    setShowXp(false);
    setFlash(false);
    setConfetti(false);
    setComplete(false);
  };

  const moveNext = useCallback(() => {
    if (questionIndex >= questions.length - 1) {
      finishPractice();
      return;
    }

    setQuestionIndex((value) => value + 1);
    setSelected(null);
    setShowSheet(false);
    setShowDeep(false);
  }, [finishPractice, questionIndex]);

  const answerQuestion = (index: number) => {
    if (selected !== null) return;

    setSelected(index);

    if (index === current.correctIndex) {
      playSound("correct");
      window.setTimeout(() => playSound("xp"), 120);
      setScore((value) => value + 1);
      setFlash(true);
      setShowXp(true);
      setConfetti(true);
      window.setTimeout(() => setFlash(false), 100);
      window.setTimeout(() => setShowXp(false), 760);
      window.setTimeout(() => setConfetti(false), 850);
      window.setTimeout(moveNext, 1000);
      return;
    }

    playSound("wrong");
    setWrongSubjects((items) => [...items, current.subject]);
    setShowSheet(true);
  };

  const weakestArea =
    wrongSubjects[0] ?? (score === questions.length ? "No weak area - clean run" : questions[0].subject);

  if (complete) {
    return (
      <ResultsScreen
        score={score}
        xp={xp}
        weakestArea={weakestArea}
        onRetry={resetPractice}
        onFinish={onComplete}
        finishLabel={origin === "progress" ? "Back to Map" : "Back to Dashboard"}
      />
    );
  }

  return (
    <ScreenFrame>
      <AnimatePresence>
        {flash ? (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0E9F6E]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        ) : null}
      </AnimatePresence>
      <ConfettiBurst show={confetti} />
      <AnimatePresence>
        {showXp ? (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.9 }}
            animate={{ opacity: 1, y: -38, scale: 1 }}
            exit={{ opacity: 0, y: -82, scale: 0.92 }}
            className="fixed left-1/2 top-28 z-50 -translate-x-1/2 rounded-full bg-[#F59E0B] px-5 py-3 text-lg font-black text-[#0F172A] shadow-[0_0_36px_rgba(245,158,11,0.55)]"
          >
            +10 ⚡
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setScreen(origin === "progress" ? "progress" : "dashboard")}
          className="grid size-10 place-items-center rounded-2xl bg-slate-800 text-slate-300"
          aria-label={origin === "progress" ? "Back to map" : "Back to dashboard"}
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="rounded-full bg-slate-800 px-3 py-2 text-xs font-black text-white">
          {questionIndex + 1} / {questions.length}
        </div>
        <PracticeTimer questionIndex={questionIndex} />
        <div className="rounded-full bg-amber-500/15 px-3 py-2 text-xs font-black text-amber-300">
          +{xp} ⚡
        </div>
        <button
          type="button"
          onClick={() => setMuted(!muted)}
          className="grid size-10 place-items-center rounded-2xl bg-slate-800 text-slate-300"
          aria-label="Toggle sound"
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </button>
      </div>

      <div className="rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-200">Current topic</p>
        <p className="mt-1 text-lg font-black text-white">{practiceTopic}</p>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          className="h-full rounded-full bg-[#1A56DB]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        />
      </div>

      <motion.div
        key={`question-${questionIndex}`}
        initial={{ opacity: 0, rotateX: -75, y: 30 }}
        animate={{ opacity: 1, rotateX: 0, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]"
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-xs font-black text-slate-200">
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  current.difficulty === "green"
                    ? GREEN
                    : current.difficulty === "orange"
                      ? GOLD
                      : RED,
              }}
            />
            {current.subject}
          </div>
          <span className="rounded-full bg-blue-500/15 px-3 py-1 text-xs font-black text-blue-200">
            {origin === "progress" ? practiceTopic : current.source}
          </span>
        </div>
        <p className="text-xl font-black leading-8 text-white">{current.prompt}</p>
      </motion.div>

      <div className="space-y-3">
        {current.options.map((answer, index) => {
          const answered = selected !== null;
          const selectedThis = selected === index;
          const correct = index === current.correctIndex;
          const wrongSelected = selectedThis && !correct;

          return (
            <motion.button
              key={`${questionIndex}-${answer}`}
              type="button"
              onClick={() => answerQuestion(index)}
              initial={{ opacity: 0, x: 42 }}
              animate={{
                opacity: answered && !selectedThis && !correct ? 0.42 : 1,
                x: wrongSelected ? [0, -8, 8, -8, 8, 0] : 0,
                scale: selectedThis && correct ? [1, 1.04, 1] : 1,
              }}
              transition={{
                delay: answered ? 0 : 0.05 * index,
                duration: wrongSelected ? 0.4 : 0.26,
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-sm font-black leading-6 shadow-[0_12px_34px_rgba(2,6,23,0.28)]",
                !answered && "border-white/5 bg-[#1E293B] text-slate-100",
                wrongSelected && "border-red-300 bg-[#E02424] text-white",
                answered && correct && "border-green-300 bg-[#0E9F6E] text-white",
                answered && !selectedThis && !correct && "border-white/5 bg-[#1E293B] text-slate-400",
              )}
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/10 text-xs">
                {answered && correct ? <Check className="size-5" /> : String.fromCharCode(65 + index)}
              </span>
              {answer}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {showSheet ? (
          <motion.div
            initial={{ opacity: 0, y: 220 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 220 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-[430px] rounded-t-[2rem] border border-blue-400/20 bg-[#111C33] p-5 shadow-[0_-24px_70px_rgba(2,6,23,0.7)]"
          >
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-600" />
            <div className="border-l-4 border-[#1A56DB] pl-4">
              <h2 className="text-xl font-black text-white">Not quite! Here&apos;s why 🧠</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-300">
                {current.explanation}
              </p>
              <AnimatePresence>
                {showDeep ? (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 rounded-2xl bg-blue-500/10 p-3 text-sm font-bold leading-6 text-blue-100"
                  >
                    {current.deeper}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <DemoButton variant="outline" onClick={() => setShowDeep(true)}>
                But Why? 🤔
              </DemoButton>
              <DemoButton onClick={moveNext}>Next Question →</DemoButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ScreenFrame>
  );
}

function buildPath(points: Array<{ x: number; y: number }>) {
  if (!points.length) return "";

  return points
    .slice(1)
    .reduce((path, point, index) => {
      const previous = points[index];
      const midY = previous.y + (point.y - previous.y) / 2;
      return `${path} C ${previous.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
    }, `M ${points[0].x} ${points[0].y}`);
}

function createPathNodes(advanced: boolean): PathNode[] {
  return [
    { id: "final", kind: "checkpoint", x: 188, y: 80, title: "Graduation Trophy", week: "Week 5", subtitle: "Full Mock Marathon", status: "final", progressText: "Locked 🔒" },
    { id: "mock-3", kind: "topic", x: 78, y: 170, title: "Final Mock 3", week: "Week 5", status: "locked" },
    { id: "mock-2", kind: "topic", x: 292, y: 255, title: "Final Mock 2", week: "Week 5", status: "locked" },
    { id: "mock-1", kind: "topic", x: 105, y: 340, title: "Final Mock 1", week: "Week 5", status: "locked" },
    { id: "week4", kind: "checkpoint", x: 278, y: 430, title: "Week 4", week: "Week 4", subtitle: "Analytical", status: "locked", progressText: "Locked 🔒" },
    { id: "logic", kind: "topic", x: 92, y: 525, title: "Logic Games", week: "Week 4", status: "locked" },
    { id: "sets", kind: "topic", x: 286, y: 615, title: "Sets & Venn", week: "Week 4", status: "locked" },
    { id: "week3", kind: "checkpoint", x: 92, y: 710, title: "Week 3", week: "Week 3", subtitle: "Verbal Reasoning", status: "locked", progressText: "Locked 🔒" },
    { id: "analogy", kind: "topic", x: 280, y: 805, title: "Analogies", week: "Week 3", status: "locked" },
    { id: "critical", kind: "topic", x: 102, y: 900, title: "Critical Reasoning", week: "Week 3", status: "locked" },
    { id: "week2", kind: "checkpoint", x: 284, y: 995, title: "Week 2", week: "Week 2", subtitle: "Quantitative Basics", status: "locked", progressText: advanced ? "3/5 Complete" : "2/5 Complete" },
    { id: "speed-distance", kind: "topic", x: 104, y: 1090, title: "Speed & Distance", week: "Week 2", status: "locked" },
    { id: "time-work", kind: "topic", x: 284, y: 1180, title: "Time & Work", week: "Week 2", status: advanced ? "current" : "locked" },
    { id: "ratio", kind: "topic", x: 100, y: 1275, title: "Ratio & Proportion", week: "Week 2", status: advanced ? "completed" : "current" },
    { id: "profit", kind: "topic", x: 286, y: 1370, title: "Profit & Loss", week: "Week 2", status: "completed" },
    { id: "percentages", kind: "topic", x: 98, y: 1460, title: "Percentages", week: "Week 2", status: "completed" },
    { id: "week1", kind: "checkpoint", x: 280, y: 1555, title: "Week 1", week: "Week 1", subtitle: "English Fundamentals", status: "completed", progressText: "4/4 Complete ✅" },
    { id: "sentence", kind: "topic", x: 102, y: 1650, title: "Sentence Correction", week: "Week 1", status: "completed" },
    { id: "prep", kind: "topic", x: 284, y: 1740, title: "Prepositions", week: "Week 1", status: "completed" },
    { id: "tenses", kind: "topic", x: 104, y: 1830, title: "Tenses", week: "Week 1", status: "completed" },
    { id: "sva", kind: "topic", x: 284, y: 1920, title: "Subject-Verb Agreement", week: "Week 1", status: "completed" },
  ];
}

function ProgressMapScreen({
  startPractice,
  journeyAdvanced,
  mapCelebration,
  onCelebrationDone,
}: {
  startPractice: (origin: PracticeOrigin, topic: string) => void;
  journeyAdvanced: boolean;
  mapCelebration: boolean;
  onCelebrationDone: () => void;
}) {
  const [popup, setPopup] = useState<{ id: string; message?: string } | null>(null);
  const nodes = useMemo(() => createPathNodes(journeyAdvanced), [journeyAdvanced]);
  const points = useMemo(() => nodes.map(({ x, y }) => ({ x, y })), [nodes]);
  const fullPath = useMemo(() => buildPath(points), [points]);
  const activeIndex = nodes.findIndex((node) => node.status === "current");
  const completedPoints = useMemo(
    () => points.slice(activeIndex === -1 ? 0 : activeIndex),
    [activeIndex, points],
  );
  const completedPath = useMemo(() => buildPath(completedPoints), [completedPoints]);
  const currentNode = nodes.find((node) => node.status === "current") ?? nodes[13];
  const previousCurrent = nodes.find((node) => node.id === "ratio") ?? currentNode;

  useEffect(() => {
    const id = window.setTimeout(() => {
      window.scrollTo({
        top: Math.max(currentNode.y - 340, 0),
        behavior: "smooth",
      });
    }, 120);

    return () => window.clearTimeout(id);
  }, [currentNode.id, currentNode.y]);

  useEffect(() => {
    if (!mapCelebration) return;

    const id = window.setTimeout(onCelebrationDone, 2200);
    return () => window.clearTimeout(id);
  }, [mapCelebration, onCelebrationDone]);

  const openPopup = (node: PathNode) => {
    if (node.kind === "checkpoint" && node.status === "completed") {
      setPopup({ id: node.id, message: "Week 1 Complete! 🎉\nYou earned: 50 XP ⚡ + Streak Badge 🔥" });
      return;
    }

    if (node.status === "completed") {
      setPopup({ id: node.id });
      return;
    }

    if (node.status === "current") {
      setPopup({ id: node.id });
      return;
    }

    setPopup({ id: node.id, message: "🔒 Complete previous topics first" });
    window.setTimeout(() => {
      setPopup((current) => (current?.id === node.id ? null : current));
    }, 1500);
  };

  return (
    <ScreenFrame className="px-0 pt-0">
      <ConfettiBurst show={mapCelebration} />
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0F172A]/95 px-5 pb-4 pt-2 backdrop-blur-xl">
        <DemoModeBanner />
        <div className="mt-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-white">Your IBA Journey 🗺️</h1>
            <p className="mt-1 text-xs font-bold text-slate-400">Scroll upward as Zarif levels up.</p>
          </div>
          <div className="rounded-full bg-blue-500/15 px-3 py-2 text-xs font-black text-blue-200 ring-1 ring-blue-400/30">
            Week 2 of 5
          </div>
        </div>
        <div className="mt-4 rounded-2xl bg-[#1E293B] p-3">
          <div className="flex items-center justify-between text-xs font-black">
            <span className="text-slate-300">320 / 500 XP this week</span>
            <span className="text-blue-200">64%</span>
          </div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-700">
            <motion.div
              className="h-full rounded-full bg-[#1A56DB]"
              initial={{ width: 0 }}
              animate={{ width: "64%" }}
              transition={{ delay: 0.25, duration: 0.8 }}
            />
          </div>
        </div>
      </div>

      <div className="relative mx-auto h-[2000px] w-full max-w-[390px] overflow-hidden px-2 pb-28 pt-4">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 390 2000" preserveAspectRatio="none">
          <motion.path
            d={fullPath}
            fill="none"
            stroke="#334155"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="1 16"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />
          <motion.path
            d={completedPath}
            fill="none"
            stroke="#1A56DB"
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray="1 16"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.15, duration: 1, ease: "easeInOut" }}
          />
        </svg>

        {nodes.map((node, index) => (
          <PathMapNode
            key={`${node.id}-${node.status}`}
            node={node}
            index={index}
            popup={popup?.id === node.id ? popup : null}
            onOpen={() => openPopup(node)}
            onContinue={() => startPractice("progress", node.title)}
            celebration={mapCelebration}
          />
        ))}

        <motion.div
          className="pointer-events-none absolute z-20"
          initial={
            mapCelebration && journeyAdvanced
              ? { left: previousCurrent.x - 18, top: previousCurrent.y - 66, y: -18, opacity: 0 }
              : { left: currentNode.x - 18, top: currentNode.y - 66, y: -42, opacity: 0 }
          }
          animate={{ left: currentNode.x - 18, top: currentNode.y - 66, y: [0, -8, 0], opacity: 1 }}
          transition={{
            left: { duration: mapCelebration ? 0.9 : 0.2, ease: "easeInOut" },
            top: { duration: mapCelebration ? 0.9 : 0.2, ease: "easeInOut" },
            y: { delay: mapCelebration ? 0.9 : 0.45, duration: 1.2, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.35 },
          }}
        >
          <div className="grid size-9 place-items-center rounded-full border-2 border-white bg-[#1A56DB] text-sm font-black text-white shadow-[0_8px_22px_rgba(26,86,219,0.55)]">
            Z
          </div>
          <div className="mx-auto mt-1 h-1.5 w-7 rounded-full bg-black/35 blur-[1px]" />
        </motion.div>
      </div>
    </ScreenFrame>
  );
}

function PathMapNode({
  node,
  index,
  popup,
  onOpen,
  onContinue,
  celebration,
}: {
  node: PathNode;
  index: number;
  popup: { id: string; message?: string } | null;
  onOpen: () => void;
  onContinue: () => void;
  celebration: boolean;
}) {
  const isCheckpoint = node.kind === "checkpoint";
  const isCompleted = node.status === "completed";
  const isCurrent = node.status === "current";
  const isLocked = node.status === "locked" || node.status === "final";
  const size = isCheckpoint ? "size-16" : isCurrent ? "size-[52px]" : "size-11";

  return (
    <motion.div
      className="absolute z-10"
      style={{ left: node.x, top: node.y, transform: "translate(-50%, -50%)" }}
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: 1 + index * 0.035 + (celebration && isCurrent ? 0.3 : 0),
        type: "spring",
        stiffness: 250,
        damping: 16,
      }}
    >
      {isCheckpoint ? (
        <WeekLabel node={node} />
      ) : null}
      {isCurrent && !isCheckpoint ? (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-2 py-1 text-[10px] font-black text-white shadow-[0_0_18px_rgba(26,86,219,0.65)]">
          YOU
        </div>
      ) : null}
      <motion.button
        type="button"
        onClick={onOpen}
        whileTap={{ scale: 0.92 }}
        className={cn(
          "relative grid place-items-center rounded-full border-2 text-lg font-black text-white",
          size,
          isCompleted && !isCheckpoint && "border-green-200 bg-[#0E9F6E] shadow-[0_0_26px_rgba(14,159,110,0.45)]",
          isCurrent && !isCheckpoint && "border-blue-100 bg-[#1A56DB] shadow-[0_0_34px_rgba(26,86,219,0.75)]",
          isLocked && !isCheckpoint && "border-slate-600 bg-[#334155] text-slate-300",
          isCheckpoint && isCompleted && "border-amber-200 bg-[#F59E0B] text-3xl shadow-[0_0_34px_rgba(245,158,11,0.52)]",
          isCheckpoint && !isCompleted && "border-slate-600 bg-[#334155] text-3xl grayscale",
        )}
        aria-label={node.title}
      >
        {isCurrent && !isCheckpoint ? (
          <span className="absolute inset-0 animate-ping rounded-full bg-blue-400/50" />
        ) : null}
        <span className="relative z-10">
          {isCheckpoint ? (node.status === "final" ? "🎓" : "🏆") : isCompleted ? "✓" : isCurrent ? "●" : <Lock className="size-5" />}
        </span>
      </motion.button>
      <AnimatePresence>
        {popup ? (
          <PathPopup
            node={node}
            message={popup.message}
            onContinue={onContinue}
          />
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}

function WeekLabel({ node }: { node: PathNode }) {
  const alignRight = node.x < 190;

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-1/2 w-32 -translate-y-1/2",
        alignRight ? "left-20 text-left" : "right-20 text-right",
      )}
    >
      <p className="text-sm font-black text-white">{node.week}</p>
      <p className="text-xs font-bold text-slate-400">{node.subtitle}</p>
      <p className="mt-1 text-[11px] font-black text-blue-200">{node.progressText}</p>
    </div>
  );
}

function PathPopup({
  node,
  message,
  onContinue,
}: {
  node: PathNode;
  message?: string;
  onContinue: () => void;
}) {
  const isCurrent = node.status === "current";
  const isCompleted = node.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.94 }}
      className="absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-56 -translate-x-1/2 rounded-2xl border border-white/10 bg-[#111C33] p-3 text-left shadow-[0_18px_60px_rgba(0,0,0,0.45)]"
    >
      <p className="whitespace-pre-line text-sm font-black text-white">{message ?? node.title}</p>
      {isCompleted && !message ? (
        <>
          <div className="mt-2 w-fit rounded-full bg-green-500/15 px-3 py-1 text-[11px] font-black text-green-200">
            Completed! +10 XP
          </div>
          <button className="mt-3 rounded-xl border border-slate-600 px-3 py-2 text-xs font-black text-slate-200">
            Practice Again
          </button>
        </>
      ) : null}
      {isCurrent ? (
        <DemoButton className="mt-3 min-h-10 w-full text-xs" onClick={onContinue}>
          Continue →
        </DemoButton>
      ) : null}
    </motion.div>
  );
}

function ScoreBar({
  label,
  score,
  delay,
}: {
  label: string;
  score: number;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2"
    >
      <div className="flex items-center justify-between text-sm font-black">
        <span className="text-slate-200">{label}</span>
        <span className="text-white">{score}/10</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-700">
        <motion.div
          className="h-full rounded-full bg-[#0E9F6E]"
          initial={{ width: 0 }}
          animate={{ width: `${score * 10}%` }}
          transition={{ delay: delay + 0.12, type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>
    </motion.div>
  );
}

function FeynmanScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const speech = useTypewriter(
    "Hey! I just learned about subject-verb agreement but I'm confused. Can you explain it to me like I'm 10 years old?",
    18,
    submitted ? "done" : "intro",
  );
  const canSubmit = text.trim().length >= 50 && !loading;

  const submit = () => {
    if (!canSubmit) return;

    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 2000);
  };

  const reset = () => {
    setText("");
    setSubmitted(false);
    setLoading(false);
  };

  return (
    <ScreenFrame>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setScreen("dashboard")}
          className="grid size-11 place-items-center rounded-2xl bg-slate-800 text-slate-200"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-white">Teach the AI 🧠</h1>
          <p className="text-sm font-bold text-slate-400">Explain it simply. Find your gaps.</p>
        </div>
      </div>

      <div className="w-fit rounded-full bg-blue-500/15 px-4 py-2 text-xs font-black text-blue-200 ring-1 ring-blue-400/25">
        Subject-Verb Agreement
      </div>

      <GameCard className="p-5">
        <div className="flex gap-4">
          <motion.div
            animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            className="grid size-14 shrink-0 place-items-center rounded-2xl bg-slate-900 text-3xl shadow-[0_0_28px_rgba(26,86,219,0.28)]"
          >
            🤖
          </motion.div>
          <div className="rounded-2xl rounded-tl-sm bg-slate-800 p-4 text-sm font-bold leading-6 text-slate-100">
            {speech}
            <span className="ml-1 inline-block h-4 w-1 animate-pulse bg-blue-300 align-middle" />
          </div>
        </div>
      </GameCard>

      <GameCard className="space-y-3 p-4">
        <textarea
          value={text}
          maxLength={300}
          onChange={(event) => setText(event.target.value.slice(0, 300))}
          placeholder="Type your explanation here... try to use simple words and examples"
          className="min-h-40 w-full resize-none rounded-2xl border border-slate-600 bg-[#0F172A] p-4 text-sm font-bold leading-6 text-white outline-none placeholder:text-slate-500 focus:border-[#1A56DB] focus:shadow-[0_0_24px_rgba(26,86,219,0.24)]"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-500">{text.length}/300</span>
          <DemoButton disabled={!canSubmit} onClick={submit}>
            {loading ? (
              <>
                <span className="flex gap-1">
                  {[0, 1, 2].map((dot) => (
                    <motion.span
                      key={dot}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: dot * 0.12 }}
                      className="size-1.5 rounded-full bg-white"
                    />
                  ))}
                </span>
                AI thinking
              </>
            ) : (
              <>Submit Explanation →</>
            )}
          </DemoButton>
        </div>
      </GameCard>

      <AnimatePresence>
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 38 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="space-y-4 rounded-2xl border border-white/5 bg-[#1E293B] p-5 shadow-[0_18px_50px_rgba(2,6,23,0.35)]"
          >
            <h2 className="text-2xl font-black text-white">Gap Report 📊</h2>
            {[
              ["✅ What you understood well:", "You correctly identified that he/she/it uses doesn't."],
              ["❌ What you missed:", "You didn't explain WHY - the grammatical rule behind it."],
              ["💡 Memorized vs Understood:", "Feels memorized - try explaining with a real life example next time."],
            ].map(([title, body], index) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className="rounded-2xl bg-slate-900/70 p-4"
              >
                <p className="text-sm font-black text-white">{title}</p>
                <p className="mt-2 text-sm font-bold leading-6 text-slate-300">{body}</p>
              </motion.div>
            ))}
            <div className="space-y-3 pt-1">
              <ScoreBar label="Clarity" score={8} delay={0.35} />
              <ScoreBar label="Simplicity" score={6} delay={0.45} />
              <ScoreBar label="Logic Flow" score={7} delay={0.55} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <DemoButton variant="outline" onClick={reset}>Try Again</DemoButton>
              <DemoButton onClick={() => setScreen("dashboard")}>Back to Dashboard</DemoButton>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ScreenFrame>
  );
}

function RippleBookButton({
  onClick,
}: {
  onClick: () => void;
}) {
  const [ripples, setRipples] = useState<number[]>([]);

  const trigger = () => {
    const id = Date.now();
    setRipples((items) => [...items, id]);
    window.setTimeout(() => {
      setRipples((items) => items.filter((item) => item !== id));
    }, 520);
    onClick();
  };

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={trigger}
      className="relative min-h-9 w-full overflow-hidden rounded-2xl bg-[#1A56DB] px-3 text-xs font-black text-white shadow-[0_0_24px_rgba(26,86,219,0.35)]"
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple}
          initial={{ opacity: 0.45, scale: 0 }}
          animate={{ opacity: 0, scale: 5 }}
          transition={{ duration: 0.52 }}
          className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        />
      ))}
      <span className="relative z-10">Book Now</span>
    </motion.button>
  );
}

function MentorsScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const [active, setActive] = useState("All");
  const [selectedMentor, setSelectedMentor] = useState<(typeof mentors)[number] | null>(null);
  const filters = ["All", "IBA", "Medical", "B Unit", "C Unit", "D Unit"];

  return (
    <ScreenFrame>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setScreen("dashboard")}
          className="grid size-11 place-items-center rounded-2xl bg-slate-800 text-slate-200"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div>
          <motion.h1 initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-black tracking-normal text-white">
            Find Your Guide 🎓
          </motion.h1>
          <p className="mt-1 text-sm font-bold text-slate-400">Learn from those who got in</p>
        </div>
      </div>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map((filter) => (
          <motion.button
            key={filter}
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => setActive(filter)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-black",
              active === filter
                ? "bg-[#1A56DB] text-white shadow-[0_0_28px_rgba(26,86,219,0.36)]"
                : "border border-slate-600 text-slate-300",
            )}
          >
            {filter}
          </motion.button>
        ))}
      </div>

      <div className="space-y-4">
        {mentors.map((mentor, index) => (
          <motion.div
            key={mentor.name}
            initial={{ opacity: 0, x: 44 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.09, duration: 0.35 }}
            className="rounded-2xl border border-white/5 bg-[#1E293B] p-4 shadow-[0_18px_50px_rgba(2,6,23,0.35)]"
          >
            <div className="flex gap-3">
              <div
                className={cn(
                  "grid size-16 shrink-0 place-items-center rounded-full border-4 bg-[#0F172A] text-lg font-black text-white",
                  mentor.topRated ? "border-[#F59E0B]" : "border-[#1A56DB]",
                )}
              >
                {mentor.initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-black text-white">{mentor.name}</p>
                <p className="mt-0.5 text-xs font-bold leading-5 text-slate-400">{mentor.title}</p>
                <div className="mt-2 flex items-center gap-2 text-xs font-black text-slate-300">
                  <span className="inline-flex items-center gap-1 text-amber-300">
                    <Star className="size-4 fill-[#F59E0B] text-[#F59E0B]" />
                    {mentor.rating}
                  </span>
                  <span>•</span>
                  <span>{mentor.sessions} sessions</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {mentor.subjects.map((subject) => (
                    <span key={subject} className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-black text-blue-200">
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex w-20 shrink-0 flex-col items-end gap-2">
                <div className="text-right">
                  <p className="text-lg font-black text-white">৳{mentor.price}</p>
                  <p className="text-[11px] font-bold text-slate-500">/ chat</p>
                </div>
                <RippleBookButton onClick={() => setSelectedMentor(mentor)} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedMentor ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/70"
            onClick={() => setSelectedMentor(null)}
          >
            <motion.div
              initial={{ y: 280 }}
              animate={{ y: 0 }}
              exit={{ y: 280 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute inset-x-0 bottom-0 mx-auto max-w-[430px] rounded-t-[2rem] border border-white/10 bg-[#111C33] p-5"
            >
              <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-slate-600" />
              <div className="flex items-center gap-3">
                <div className="grid size-14 place-items-center rounded-full border-4 border-[#F59E0B] bg-[#0F172A] text-base font-black text-white">
                  {selectedMentor.initials}
                </div>
                <div>
                  <p className="font-black text-white">{selectedMentor.name}</p>
                  <p className="text-xs font-bold text-slate-400">{selectedMentor.title}</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button className="rounded-2xl border border-blue-400 bg-blue-500/15 p-4 text-left">
                  <p className="font-black text-white">Chat</p>
                  <p className="text-sm font-bold text-blue-200">৳100</p>
                </button>
                <button className="rounded-2xl border border-slate-600 p-4 text-left">
                  <p className="font-black text-white">Video</p>
                  <p className="text-sm font-bold text-slate-300">৳300</p>
                </button>
              </div>
              <div className="mt-4 rounded-2xl bg-amber-500/15 p-4 text-center text-sm font-black text-amber-200">
                Coming Soon 🚀
              </div>
              <DemoButton
                className="mt-4 w-full"
                onClick={() => {
                  toast.success("Added to mentor waitlist");
                  setSelectedMentor(null);
                }}
              >
                Join Waitlist
              </DemoButton>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </ScreenFrame>
  );
}

function ProfileScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  const rows = [
    "Notification Settings",
    "Exam Target",
    "Language (বাংলা / English)",
    "About Kinetic Academy",
  ];

  return (
    <ScreenFrame>
      <header>
        <p className="text-sm font-black text-blue-200">Profile</p>
        <h1 className="text-3xl font-black text-white">Zarif Ahmed</h1>
      </header>
      <GameCard className="p-5">
        <div className="flex items-center gap-4">
          <div className="grid size-20 place-items-center rounded-full border-4 border-blue-400 bg-[#0F172A] text-3xl font-black text-white">
            Z
          </div>
          <div>
            <p className="text-xl font-black text-white">Zarif Ahmed</p>
            <p className="text-sm font-bold text-slate-400">IBA Aspirant • Joined May 2026</p>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["7", "day streak"],
            ["2340", "XP"],
            ["3", "sessions"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-2xl bg-slate-900/70 p-3 text-center">
              <p className="text-lg font-black text-white">{value}</p>
              <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
            </div>
          ))}
        </div>
      </GameCard>
      <GameCard className="overflow-hidden">
        {rows.map((row) => (
          <button
            key={row}
            type="button"
            className="flex w-full items-center justify-between border-b border-white/5 px-5 py-4 text-left text-sm font-black text-slate-200 last:border-b-0"
          >
            <span className="inline-flex items-center gap-3">
              <Settings className="size-4 text-blue-300" />
              {row}
            </span>
            <ChevronRight className="size-4 text-slate-500" />
          </button>
        ))}
        <button
          type="button"
          onClick={() => setScreen("login")}
          className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-black text-red-300"
        >
          <span className="inline-flex items-center gap-3">
            <LogOut className="size-4" />
            Logout
          </span>
          <ChevronRight className="size-4 text-red-400" />
        </button>
      </GameCard>
    </ScreenFrame>
  );
}

function ScreenFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={cn("space-y-5 px-5 pb-24 pt-2", className)}
    >
      {className?.includes("px-0") ? null : <DemoModeBanner />}
      {children}
    </motion.section>
  );
}

function BottomNav({
  screen,
  setScreen,
  newUnlock,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  newUnlock: boolean;
}) {
  const tabs = [
    { id: "dashboard" as const, icon: <Home className="size-5" />, label: "Home" },
    { id: "practice" as const, icon: <Zap className="size-5" />, label: "Practice" },
    { id: "progress" as const, icon: <span className="text-lg leading-none">🗺️</span>, label: "Map" },
    { id: "mentors" as const, icon: <Users className="size-5" />, label: "Mentors" },
    { id: "profile" as const, icon: <User className="size-5" />, label: "Profile" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-[430px] border-t border-white/5 bg-[#0B1222]/95 px-2 pb-3 pt-2 backdrop-blur-xl">
      <div className="grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const active = screen === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setScreen(tab.id)}
              className="relative flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-black text-slate-500"
            >
              {active ? (
                <motion.div
                  layoutId="active-tab"
                  className="absolute inset-1 rounded-2xl bg-[#1A56DB]"
                  transition={{ type: "spring", damping: 22, stiffness: 300 }}
                />
              ) : null}
              <span className={cn("relative z-10", active && "text-white")}>
                {tab.icon}
              </span>
              <span className={cn("relative z-10", active && "text-white")}>{tab.label}</span>
              {tab.id === "progress" && newUnlock ? (
                <span className="absolute right-4 top-2 z-20 size-2.5 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(147,197,253,0.95)]" />
              ) : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default function KineticAcademyDemoPage() {
  const [screen, setScreen] = useState<Screen>("loading");
  const [practiceOrigin, setPracticeOrigin] = useState<PracticeOrigin>("dashboard");
  const [practiceTopic, setPracticeTopic] = useState("IBA Mixed Sprint");
  const [journeyAdvanced, setJourneyAdvanced] = useState(false);
  const [newUnlock, setNewUnlock] = useState(false);
  const [mapCelebration, setMapCelebration] = useState(false);
  const [streakAtRisk, setStreakAtRisk] = useState(false);
  const { muted, setMuted, play } = useSound();

  useEffect(() => {
    const id = window.setTimeout(() => setScreen("login"), 1800);
    return () => window.clearTimeout(id);
  }, []);

  useEffect(() => {
    setStreakAtRisk(new Date().getHours() >= 20);
  }, []);

  useEffect(() => {
    if (screen === "dashboard") {
      play("streak");
    }
  }, [screen, play]);

  const startPractice = useCallback((origin: PracticeOrigin, topic: string) => {
    setPracticeOrigin(origin);
    setPracticeTopic(topic);
    setScreen("practice");
  }, []);

  const finishPractice = useCallback(() => {
    if (practiceOrigin === "progress") {
      setJourneyAdvanced(true);
      setNewUnlock(true);
      setMapCelebration(true);
      setScreen("progress");
      toast.success("Topic Complete! +10 XP ⚡");
      return;
    }

    setScreen("dashboard");
  }, [practiceOrigin]);

  const goToDashboard = useCallback(() => setScreen("dashboard"), []);

  const navigate = useCallback((next: Screen) => {
    if (next === "practice") {
      startPractice("dashboard", "IBA Mixed Sprint");
      return;
    }

    setScreen(next);
  }, [startPractice]);

  useEffect(() => {
    if (screen !== "progress") {
      window.scrollTo({ top: 0 });
    }
  }, [screen]);

  return (
    <main className="min-h-dvh bg-[#0F172A] text-white">
      <div
        className="mx-auto min-h-dvh max-w-[430px] overflow-x-hidden"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, rgba(26,86,219,0.28), transparent 18rem), #0F172A",
        }}
      >
        <AnimatePresence mode="wait">
          {screen === "loading" ? <SplashScreen key="loading" /> : null}
          {screen === "login" ? (
            <LoginScreen key="login" onEnter={() => setScreen("onboarding")} />
          ) : null}
          {screen === "onboarding" ? (
            <OnboardingScreen key="onboarding" onComplete={() => setScreen("path-building")} />
          ) : null}
          {screen === "path-building" ? (
            <PathBuildingScreen key="path-building" onDone={goToDashboard} />
          ) : null}
          {screen === "dashboard" ? (
            <DashboardScreen
              key="dashboard"
              setScreen={setScreen}
              startPractice={startPractice}
              streakAtRisk={streakAtRisk}
              journeyAdvanced={journeyAdvanced}
            />
          ) : null}
          {screen === "practice" ? (
            <PracticeScreen
              key={`${practiceOrigin}-${practiceTopic}`}
              setScreen={setScreen}
              muted={muted}
              setMuted={setMuted}
              playSound={play}
              practiceTopic={practiceTopic}
              origin={practiceOrigin}
              onComplete={finishPractice}
            />
          ) : null}
          {screen === "progress" ? (
            <ProgressMapScreen
              key="progress"
              startPractice={startPractice}
              journeyAdvanced={journeyAdvanced}
              mapCelebration={mapCelebration}
              onCelebrationDone={() => setMapCelebration(false)}
            />
          ) : null}
          {screen === "mentors" ? <MentorsScreen key="mentors" setScreen={setScreen} /> : null}
          {screen === "feynman" ? <FeynmanScreen key="feynman" setScreen={setScreen} /> : null}
          {screen === "profile" ? <ProfileScreen key="profile" setScreen={setScreen} /> : null}
        </AnimatePresence>
        {!["loading", "login", "onboarding", "path-building", "feynman"].includes(screen) ? (
          <BottomNav screen={screen} setScreen={navigate} newUnlock={newUnlock} />
        ) : null}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: CARD,
            border: "1px solid rgba(255,255,255,0.08)",
            color: "white",
            borderRadius: "18px",
            fontWeight: 900,
          },
        }}
      />
    </main>
  );
}

declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}
