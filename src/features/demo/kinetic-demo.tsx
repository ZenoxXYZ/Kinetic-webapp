"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpenCheck,
  Brain,
  Check,
  ChevronRight,
  Flame,
  GraduationCap,
  Home,
  LoaderCircle,
  Medal,
  MessageCircle,
  Phone,
  Sparkles,
  Star,
  Target,
  User,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Toaster, toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Screen = "login" | "dashboard" | "practice" | "mentors" | "profile";

const student = {
  name: "Zarif",
  target: "IBA",
  daysToExam: 23,
  streak: 7,
  accuracy: 67,
};

const mentors = [
  {
    name: "Nafisa Rahman",
    university: "IBA, University of Dhaka",
    subject: "English RC",
    rating: 4.9,
    initials: "NR",
  },
  {
    name: "Samin Chowdhury",
    university: "BUET CSE",
    subject: "Quantitative",
    rating: 4.8,
    initials: "SC",
  },
  {
    name: "Tashfia Karim",
    university: "Dhaka University",
    subject: "Analytical Ability",
    rating: 4.7,
    initials: "TK",
  },
];

const options = [
  "The author wants to criticize all forms of memorization.",
  "The author believes practice is useful only when it builds understanding.",
  "The author argues that exams should avoid analytical questions.",
  "The author says confidence matters more than preparation.",
];

const correctAnswer = 1;

const screenVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-12 place-items-center rounded-2xl bg-[#1A56DB] text-white shadow-lg shadow-blue-500/25">
        <Sparkles className="size-6" />
      </div>
      <div>
        <p className="text-xl font-black tracking-normal text-slate-950">
          Kinetic Academy
        </p>
        <p className="text-sm font-medium text-slate-500">
          Learn deeply. Practice actively.
        </p>
      </div>
    </div>
  );
}

function AppShell({
  screen,
  setScreen,
  children,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-hidden bg-[#F8FBFF] shadow-2xl shadow-blue-950/10 sm:my-6 sm:min-h-[860px] sm:rounded-[2rem]">
      <div className="flex-1 overflow-y-auto">{children}</div>
      {screen !== "login" ? (
        <BottomNav screen={screen} setScreen={setScreen} />
      ) : null}
    </main>
  );
}

function BottomNav({
  screen,
  setScreen,
}: {
  screen: Screen;
  setScreen: (screen: Screen) => void;
}) {
  const items = [
    { id: "dashboard" as const, label: "Home", icon: Home },
    { id: "practice" as const, label: "Practice", icon: BookOpenCheck },
    { id: "mentors" as const, label: "Mentors", icon: Users },
    { id: "profile" as const, label: "Profile", icon: User },
  ];

  return (
    <nav className="grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 pb-3 pt-2 backdrop-blur">
      {items.map((item) => {
        const Icon = item.icon;
        const active = screen === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setScreen(item.id)}
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 rounded-2xl text-xs font-bold transition-colors",
              active
                ? "bg-blue-50 text-[#1A56DB]"
                : "text-slate-400 hover:bg-slate-50 hover:text-slate-700",
            )}
          >
            <Icon className="size-5" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <motion.section
      className="flex min-h-dvh flex-col px-5 py-7"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      <div className="flex flex-1 flex-col justify-between gap-8">
        <div className="space-y-8">
          <Logo />

          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-[#1A56DB]">
              <GraduationCap className="size-4" />
              Built for Bangladesh admission prep
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-normal text-slate-950">
              Your AI study coach for IBA, Medical and DU.
            </h1>
            <p className="text-base leading-7 text-slate-600">
              Practice with adaptive MCQs, streaks, XP, and clear AI explanations
              that build real understanding.
            </p>
          </div>
        </div>

        <Card className="border-blue-100 bg-white/90 shadow-xl shadow-blue-950/10 backdrop-blur">
          <CardHeader>
            <CardTitle>Start demo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700" htmlFor="phone">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="phone"
                  inputMode="numeric"
                  maxLength={11}
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="pl-11"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700" htmlFor="otp">
                OTP
              </label>
              <Input
                id="otp"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
              />
            </div>

            <Button className="w-full" size="lg" onClick={onLogin}>
              Send OTP
              <ChevronRight className="size-5" />
            </Button>

            <Button
              className="w-full"
              variant="outline"
              size="lg"
              onClick={onLogin}
            >
              <span className="grid size-5 place-items-center rounded-full border border-slate-300 text-xs font-black">
                G
              </span>
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.section>
  );
}

function AccuracyRing({ value }: { value: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative grid size-36 place-items-center">
      <svg className="size-36 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="12"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#1A56DB"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-black text-slate-950">{value}%</p>
        <p className="text-xs font-bold uppercase text-slate-400">overall</p>
      </div>
    </div>
  );
}

function DashboardScreen({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <motion.section
      className="space-y-5 px-5 pb-6 pt-6"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-500">Today</p>
          <h1 className="text-2xl font-black tracking-normal text-slate-950">
            Hi {student.name} 👋
          </h1>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-orange-50 px-3 py-2 text-sm font-black text-orange-600">
          <Flame className="size-5 fill-orange-500 text-orange-500" />
          {student.streak} days
        </div>
      </header>

      <Card className="overflow-hidden border-0 bg-[#1A56DB] text-white shadow-xl shadow-blue-500/25">
        <CardContent className="space-y-5 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-blue-100">Exam countdown</p>
              <p className="mt-1 text-3xl font-black tracking-normal">
                {student.daysToExam} days to {student.target}
              </p>
            </div>
            <div className="grid size-12 place-items-center rounded-2xl bg-white/15">
              <Target className="size-6" />
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/20">
            <motion.div
              className="h-2 rounded-full bg-white"
              initial={{ width: "0%" }}
              animate={{ width: "72%" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-[auto_1fr] gap-4">
        <Card className="grid place-items-center p-3">
          <AccuracyRing value={student.accuracy} />
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weak areas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["English RC", "Quantitative"].map((area, index) => (
              <div
                key={area}
                className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100"
              >
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{area}</span>
                  <span className="text-[#1A56DB]">{index === 0 ? "54%" : "58%"}</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-[#1A56DB]"
                    style={{ width: index === 0 ? "54%" : "58%" }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#1A56DB]">
            <Brain className="size-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-slate-500">Next path</p>
            <p className="font-black text-slate-950">Inference questions in English RC</p>
          </div>
          <ChevronRight className="size-5 text-slate-400" />
        </CardContent>
      </Card>

      <Button className="w-full" size="lg" onClick={() => setScreen("practice")}>
        Start Practice
        <Sparkles className="size-5" />
      </Button>
    </motion.section>
  );
}

function PracticeScreen() {
  const [selected, setSelected] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showXp, setShowXp] = useState(false);

  const isCorrect = selected === correctAnswer;

  const handleAnswer = (index: number) => {
    setSelected(index);

    if (index === correctAnswer) {
      setShowExplanation(false);
      setShowXp(true);
      window.setTimeout(() => setShowXp(false), 1200);
      return;
    }

    setShowExplanation(true);
  };

  return (
    <motion.section
      className="relative min-h-full space-y-5 px-5 pb-6 pt-6"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500">IBA English</p>
            <h1 className="text-2xl font-black tracking-normal text-slate-950">
              Practice
            </h1>
          </div>
          <div className="rounded-2xl bg-blue-50 px-3 py-2 text-sm font-black text-[#1A56DB]">
            1/10
          </div>
        </div>
        <div className="h-3 rounded-full bg-slate-200">
          <motion.div
            className="h-3 rounded-full bg-[#1A56DB]"
            initial={{ width: "0%" }}
            animate={{ width: "10%" }}
          />
        </div>
      </header>

      <motion.div
        animate={
          isCorrect
            ? { backgroundColor: ["#ffffff", "#DCFCE7", "#ffffff"] }
            : undefined
        }
        transition={{ duration: 0.7 }}
      >
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              <BookOpenCheck className="size-4" />
              Reading comprehension
            </div>
            <p className="text-lg font-black leading-7 text-slate-950">
              The passage suggests that effective preparation is less about
              memorizing answers and more about understanding the logic behind
              each question. Which option best captures the author&apos;s view?
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-3">
        {options.map((option, index) => {
          const active = selected === index;
          const correct = index === correctAnswer;

          return (
            <button
              key={option}
              type="button"
              onClick={() => handleAnswer(index)}
              className={cn(
                "flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left text-sm font-bold leading-6 shadow-sm transition-all",
                active && correct
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : active
                    ? "border-rose-300 bg-rose-50 text-rose-700"
                    : "border-slate-200 text-slate-700 hover:border-blue-200 hover:bg-blue-50",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-xl border text-xs font-black",
                  active && correct
                    ? "border-emerald-400 bg-emerald-500 text-white"
                    : active
                      ? "border-rose-300 bg-rose-500 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-500",
                )}
              >
                {active && correct ? <Check className="size-4" /> : String.fromCharCode(65 + index)}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {showXp ? (
          <motion.div
            className="pointer-events-none fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-full bg-emerald-500 px-5 py-3 text-base font-black text-white shadow-xl shadow-emerald-500/30"
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.9 }}
          >
            +10 XP
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showExplanation ? (
          <motion.div
            className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-md px-5"
            initial={{ opacity: 0, y: 120 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 120 }}
            transition={{ type: "spring", damping: 24, stiffness: 260 }}
          >
            <Card className="border-blue-100 shadow-2xl shadow-blue-950/20">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center gap-2 text-sm font-black text-[#1A56DB]">
                  <Sparkles className="size-5" />
                  AI Tutor
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  Good try. The key phrase is &quot;understanding the logic
                  behind each question.&quot; That means practice is valuable
                  when it builds reasoning, not when it becomes blind
                  memorization. Option B captures that idea most clearly.
                </p>
                <Button className="w-full" onClick={() => setShowExplanation(false)}>
                  Got it
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function MentorBrowseScreen() {
  const [filter, setFilter] = useState("IBA");
  const filters = ["IBA", "Medical", "B Unit"];

  return (
    <motion.section
      className="space-y-5 px-5 pb-6 pt-6"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <header>
        <p className="text-sm font-bold text-slate-500">Verified mentors</p>
        <h1 className="text-2xl font-black tracking-normal text-slate-950">
          Book a top scorer
        </h1>
      </header>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-black transition-colors",
              filter === item
                ? "bg-[#1A56DB] text-white shadow-lg shadow-blue-500/20"
                : "bg-white text-slate-500 ring-1 ring-slate-200",
            )}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {mentors.map((mentor) => (
          <Card key={mentor.name} className="overflow-hidden">
            <CardContent className="flex gap-4 p-4">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 text-lg font-black text-[#1A56DB]">
                {mentor.initials}
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div>
                  <p className="font-black text-slate-950">{mentor.name}</p>
                  <p className="text-sm font-medium text-slate-500">
                    {mentor.university}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-[#1A56DB]">
                    {mentor.subject}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-black text-amber-500">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {mentor.rating}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => toast("Coming Soon")}
                >
                  Book ৳100
                  <MessageCircle className="size-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.section>
  );
}

function ProfilePlaceholder() {
  return (
    <motion.section
      className="space-y-5 px-5 pb-6 pt-6"
      variants={screenVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <header>
        <p className="text-sm font-bold text-slate-500">Student profile</p>
        <h1 className="text-2xl font-black tracking-normal text-slate-950">
          {student.name}
        </h1>
      </header>
      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="grid size-20 place-items-center rounded-3xl bg-blue-50 text-[#1A56DB]">
            <Medal className="size-10" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-950">IBA Target</p>
            <p className="text-sm font-medium text-slate-500">
              7-day streak, 67% accuracy, focused on English RC and Quantitative.
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}

export function KineticDemo() {
  const [screen, setScreen] = useState<Screen>("login");
  const pageKey = useMemo(() => screen, [screen]);

  const goDashboard = () => setScreen("dashboard");

  return (
    <>
      <AppShell screen={screen} setScreen={setScreen}>
        <AnimatePresence mode="wait">
          {screen === "login" ? (
            <LoginScreen key={pageKey} onLogin={goDashboard} />
          ) : null}
          {screen === "dashboard" ? (
            <DashboardScreen key={pageKey} setScreen={setScreen} />
          ) : null}
          {screen === "practice" ? <PracticeScreen key={pageKey} /> : null}
          {screen === "mentors" ? <MentorBrowseScreen key={pageKey} /> : null}
          {screen === "profile" ? <ProfilePlaceholder key={pageKey} /> : null}
        </AnimatePresence>
      </AppShell>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            borderRadius: "16px",
            borderColor: "#DBEAFE",
            color: "#0F172A",
            fontWeight: 800,
          },
        }}
      />
    </>
  );
}
