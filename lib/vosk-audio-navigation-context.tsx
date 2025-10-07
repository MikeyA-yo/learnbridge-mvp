"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { getUser, updateUser } from "./auth";
import { useLanguage } from "./language-context";
import { createNigerianUtterance } from "./voice-utils";
import { lessons } from "./lessons-data";
import { createModel, KaldiRecognizer } from "vosk-browser";

// --- IMPORTANT ---
// You need to provide the URL to your Vosk model.
// For testing, you can use a small English model and host it in your /public folder.
// Download a model from: https://alphacephei.com/vosk/models
const VOSK_MODEL_URL = "/vosk-model-small-en-us-0.15.zip"; // Example path

interface AudioNavigationContextType {
  isAudioNavigationMode: boolean;
  isListening: boolean;
  currentFocus: string | null;
  availableCommands: string[];
  showDeactivationMessage: boolean;
  announcement: string;
  toggleAudioNavigationMode: () => void;
  startListening: () => void;
  stopListening: () => void;
  speakText: (text: string, priority?: "low" | "medium" | "high") => void;
  announceCurrentFocus: () => void;
  setCurrentFocus: (focus: string | null) => void;
  setAnnouncement: (text: string) => void;
}

const VoskAudioNavigationContext = createContext<
  AudioNavigationContextType | undefined
>(undefined);

export function VoskAudioNavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAudioNavigationMode, setIsAudioNavigationMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentFocus, setCurrentFocus] = useState<string | null>(null);
  const [speechQueue, setSpeechQueue] = useState<
    Array<{ text: string; priority: "low" | "medium" | "high" }>
  >([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDeactivationMessage, setShowDeactivationMessage] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [model, setModel] = useState<any | null>(null);

  const recognizerRef = useRef<KaldiRecognizer | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const isAudioNavigationModeRef = useRef(isAudioNavigationMode);
  const mountedRef = useRef(mounted);

  const router = useRouter();
  const { language, t } = useLanguage();

  useEffect(() => {
    isAudioNavigationModeRef.current = isAudioNavigationMode;
  }, [isAudioNavigationMode]);

  useEffect(() => {
    mountedRef.current = mounted;
  }, [mounted]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const availableCommands = [
    "basic math",
    "intermediate math",
    "algebra",
    "start practice",
    "read question",
    "next question",
    "repeat question",
    "stop practice",
    "exit",
    "help",
  ];

  const speakText = useCallback(
    (text: string, priority: "low" | "medium" | "high" = "medium") => {
      if (!text) return;
      setAnnouncement(text);
      setSpeechQueue((prev) => {
        const newItem = { text, priority };
        if (priority === "high") return [newItem, ...prev];
        if (priority === "low") return [...prev, newItem];
        const highPriorityItems = prev.filter(
          (item) => item.priority === "high"
        );
        const nonHighPriorityItems = prev.filter(
          (item) => item.priority !== "high"
        );
        return [...highPriorityItems, newItem, ...nonHighPriorityItems];
      });
    },
    []
  );

  const announceCurrentFocus = useCallback(() => {
    if (currentFocus) {
      speakText(`Currently focused on: ${currentFocus}`, "medium");
    } else {
      speakText(
        "No current focus. Say 'help' for available commands.",
        "medium"
      );
    }
  }, [currentFocus, speakText]);

  useEffect(() => {
    if (speechQueue.length > 0 && !isSpeaking && "speechSynthesis" in window) {
      const nextItem = speechQueue[0];
      setSpeechQueue((prev) => prev.slice(1));
      setIsSpeaking(true);

      const user = getUser();
      const userSettings = user?.settings
        ? {
            audioSpeed: user.settings.audioSpeed,
            audioPitch: user.settings.audioPitch,
          }
        : undefined;
      const utterance =
        language !== "english"
          ? createNigerianUtterance(nextItem.text, language, userSettings)
          : new SpeechSynthesisUtterance(nextItem.text);

      if (language === "english") {
        utterance.lang = "en-US";
        const audioSpeed = userSettings?.audioSpeed ?? "normal";
        utterance.rate =
          audioSpeed === "slow" ? 0.7 : audioSpeed === "very-slow" ? 0.5 : 0.9;
        utterance.pitch = userSettings?.audioPitch === "high" ? 1.2 : 1;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  }, [speechQueue, isSpeaking, language]);

  const stopListening = useCallback(() => {
    console.log("🛑 [Vosk] Stopping recognition");
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (recognizerRef.current) {
      recognizerRef.current.remove();
      recognizerRef.current = null;
    }
    setIsListening(false);
  }, []);

  const toggleAudioNavigationMode = useCallback(() => {
    const newMode = !isAudioNavigationMode;
    setIsAudioNavigationMode(newMode);

    const user = getUser();
    if (user) {
      updateUser({ settings: { ...user.settings, audioNavigation: newMode } });
    }

    if (newMode) {
      // Welcome messages logic remains the same
      setTimeout(() => {
        speakText("Audio navigation activated with Vosk.", "high");
      }, 500);
    } else {
      stopListening();
      if ("speechSynthesis" in window) speechSynthesis.cancel();
      setSpeechQueue([]);
      setIsSpeaking(false);
      setShowDeactivationMessage(true);
      setTimeout(() => {
        setShowDeactivationMessage(false);
        speakText("Audio navigation mode deactivated.", "high");
      }, 100);
    }
  }, [isAudioNavigationMode, speakText, stopListening]);

  const handleVoiceCommand = useCallback(
    (command: string) => {
      console.log("🗣️ [Vosk] Processing command:", command);
      const normalizedCommand = command.toLowerCase().trim();

      // Global navigation commands
      if (
        /\b(go\s*to\s*dashboard)\b/i.test(normalizedCommand) ||
        /\b(zuwa\s*dashboard|dashboard\s*zuwa)\b/i.test(normalizedCommand)
      ) {
        const message = t("goingToDashboard", {
          english: "Going to Dashboard",
          hausa: "Zuwa Dashboard",
          kanuri: "Dashboard zuwa",
          arabic: "الانتقال إلى لوحة القيادة",
        });
        setSpeechQueue([]); // Clear queue
        setAnnouncement(message);
        speakText(message, "medium");
        router.push("/dashboard");
        return;
      }

      if (
        /\b(go\s*to\s*progress)\b/i.test(normalizedCommand) ||
        /\b(zuwa\s*progress|progress\s*zuwa)\b/i.test(normalizedCommand)
      ) {
        const message = t("goingToProgress", {
          english: "Going to Progress",
          hausa: "Zuwa Ci gaba",
          kanuri: "Ci gaba zuwa",
          arabic: "الانتقال إلى التقدم",
        });
        setAnnouncement(message);
        speakText(message, "medium");
        router.push("/progress");
        return;
      }

      if (
        /\b(go\s*to\s*settings)\b/i.test(normalizedCommand) ||
        /\b(zuwa\s*settings|settings\s*zuwa)\b/i.test(normalizedCommand)
      ) {
        const message = t("goingToSettings", {
          english: "Going to Settings",
          hausa: "Zuwa Saitunan",
          kanuri: "Saitunan zuwa",
          arabic: "الانتقال إلى الإعدادات",
        });
        setAnnouncement(message);
        speakText(message, "medium");
        router.push("/settings");
        return;
      }

      if (
        /\b(go\s*to\s*lessons?)\b/i.test(normalizedCommand) ||
        /\b(zuwa\s*darussa|darussa\s*zuwa)\b/i.test(normalizedCommand)
      ) {
        const message = t("goingToLessons", {
          english: "Going to Lessons",
          hausa: "Zuwa Darussa",
          kanuri: "Darussa zuwa",
          arabic: "الانتقال إلى الدروس",
        });
        setAnnouncement(message);
        speakText(message, "medium");
        router.push("/topics/basic");
        return;
      }

      if (
        /\b(go\s*back)\b/i.test(normalizedCommand) ||
        /\b(koma\s*baya|baya\s*koma)\b/i.test(normalizedCommand)
      ) {
        const message = t("goingBack", {
          english: "Going back",
          hausa: "Koma baya",
          kanuri: "Baya koma",
          arabic: "العودة",
        });
        setAnnouncement(message);
        speakText(message, "medium");
        router.back();
        return;
      }

      if (
        /\b(exit)\b/i.test(normalizedCommand) ||
        /\b(fita|dakatar)\b/i.test(normalizedCommand)
      ) {
        stopListening();

        if ("speechSynthesis" in window) {
          speechSynthesis.cancel();
        }
        setSpeechQueue([]);
        setIsSpeaking(false);

        setIsAudioNavigationMode(false);
        const user = getUser();
        if (user) {
          updateUser({
            settings: {
              ...user.settings,
              audioNavigation: false,
            },
          });
        }

        setShowDeactivationMessage(true);
        setTimeout(() => {
          setShowDeactivationMessage(false);
          const message = t("audioNavDeactivated", {
            english: "Audio navigation mode deactivated.",
            hausa: "An kashe yanayin kewayawa da murya.",
            kanuri: "Murya kewayawa yanayi kashe.",
            arabic: "تم إلغاء تفعيل وضع التنقل الصوتي.",
          });
          setAnnouncement(message);
          speakText(message, "high");
        }, 100);
        return;
      }

      // Settings-specific commands
      if (window.location.pathname === "/settings") {
        if (
          /\b(toggle\s*audio\s*navigation)\b/i.test(normalizedCommand) ||
          /\b(kunna\s*kewayawa\s*da\s*murya)\b/i.test(normalizedCommand)
        ) {
          toggleAudioNavigationMode();
          return;
        }
        if (
          /\b(toggle\s*dyslexia\s*font)\b/i.test(normalizedCommand) ||
          /\b(kunna\s*rubutun\s*dyslexia)\b/i.test(normalizedCommand)
        ) {
          const user = getUser();
          if (user) {
            updateUser({
              settings: {
                ...user.settings,
                dyslexiaFont: !user.settings.dyslexiaFont,
              },
            });
            const message = t(
              user.settings.dyslexiaFont
                ? "dyslexiaFontDisabled"
                : "dyslexiaFontEnabled",
              {
                english: user.settings.dyslexiaFont
                  ? "Dyslexia font disabled"
                  : "Dyslexia font enabled",
                hausa: user.settings.dyslexiaFont
                  ? "Rubutun dyslexia kashe"
                  : "Rubutun dyslexia kunna",
                kanuri: user.settings.dyslexiaFont
                  ? "Rubutun dyslexia kashe"
                  : "Rubutun dyslexia kunna",
                arabic: user.settings.dyslexiaFont
                  ? "تم تعطيل خط الديسلكسيا"
                  : "تم تفعيل خط الديسلكسيا",
              }
            );
            setAnnouncement(message);
            speakText(message, "medium");
          }
          return;
        }
        if (
          /\b(toggle\s*subtitles)\b/i.test(normalizedCommand) ||
          /\b(kunna\s*rubutu)\b/i.test(normalizedCommand)
        ) {
          const user = getUser();
          if (user) {
            updateUser({
              settings: {
                ...user.settings,
                subtitles: !user.settings.subtitles,
              },
            });
            const message = t(
              user.settings.subtitles
                ? "subtitlesDisabled"
                : "subtitlesEnabled",
              {
                english: user.settings.subtitles
                  ? "Subtitles disabled"
                  : "Subtitles enabled",
                hausa: user.settings.subtitles
                  ? "Rubutu kashe"
                  : "Rubutu kunna",
                kanuri: user.settings.subtitles
                  ? "Rubutu kashe"
                  : "Rubutu kunna",
                arabic: user.settings.subtitles
                  ? "تم تعطيل النصوص التوضيحية"
                  : "تم تفعيل النصوص التوضيحية",
              }
            );
            setAnnouncement(message);
            speakText(message, "medium");
          }
          return;
        }
        if (
          /\b(change\s*language)\b/i.test(normalizedCommand) ||
          /\b(canza\s*harshe)\b/i.test(normalizedCommand)
        ) {
          const message = t("languageSelectorOpened", {
            english: "Language selector opened",
            hausa: "Zabin harshe ya buɗe",
            kanuri: "Zabin harshe ya buɗe",
            arabic: "تم فتح محدد اللغة",
          });
          setAnnouncement(message);
          speakText(message, "medium");
          window.dispatchEvent(
            new CustomEvent("audioNavigationCommand", {
              detail: { command: "changeLanguage" },
            })
          );
          return;
        }
        if (
          /\b(change\s*audio\s*speed)\b/i.test(normalizedCommand) ||
          /\b(canza\s*saurin\s*sauti)\b/i.test(normalizedCommand)
        ) {
          const user = getUser();
          if (user) {
            const speeds = ["normal", "slow", "very-slow"] as const;
            const currentIndex = speeds.indexOf(user.settings.audioSpeed);
            const nextSpeed = speeds[(currentIndex + 1) % speeds.length];
            updateUser({
              settings: {
                ...user.settings,
                audioSpeed: nextSpeed,
              },
            });
            const message = t("audioSpeedChanged", {
              english: `Audio speed changed to ${nextSpeed}`,
              hausa: `Saurin sauti ya canza zuwa ${nextSpeed}`,
              kanuri: `Saurin sauti ya canza zuwa ${nextSpeed}`,
              arabic: `تم تغيير سرعة الصوت إلى ${nextSpeed}`,
            });
            setAnnouncement(message);
            speakText(message, "medium");
          }
          return;
        }
        if (
          /\b(change\s*audio\s*pitch)\b/i.test(normalizedCommand) ||
          /\b(canza\s*sautin\s*sauti)\b/i.test(normalizedCommand)
        ) {
          const user = getUser();
          if (user) {
            const pitches = ["normal", "high"] as const;
            const currentIndex = pitches.indexOf(user.settings.audioPitch);
            const nextPitch = pitches[(currentIndex + 1) % pitches.length];
            updateUser({
              settings: {
                ...user.settings,
                audioPitch: nextPitch,
              },
            });
            const message = t("audioPitchChanged", {
              english: `Audio pitch changed to ${nextPitch}`,
              hausa: `Sautin sauti ya canza zuwa ${nextPitch}`,
              kanuri: `Sautin sauti ya canza zuwa ${nextPitch}`,
              arabic: `تم تغيير نبرة الصوت إلى ${nextPitch}`,
            });
            setAnnouncement(message);
            speakText(message, "medium");
          }
          return;
        }
      }

      // Lesson-specific commands
      if (window.location.pathname.includes("/lesson/")) {
        const lessonId = window.location.pathname.split("/").pop();
        const currentLesson = lessons.find((l: any) => l.id === lessonId);

        if (
          /\b(st(?:art)?\s*practice)\b/i.test(normalizedCommand) ||
          /\b(fara\s*aiki)\b/i.test(normalizedCommand)
        ) {
          window.dispatchEvent(
            new CustomEvent("audioNavigationCommand", {
              detail: { command: "startPractice" },
            })
          );
          return;
        }

        if (
          /\b(read\s*question|repeat\s*question)\b/i.test(normalizedCommand) ||
          /\b(karanta\s*tambaya|maimaita\s*tambaya)\b/i.test(normalizedCommand)
        ) {
          window.dispatchEvent(
            new CustomEvent("audioNavigationCommand", {
              detail: { command: "readQuestion" },
            })
          );
          return;
        }

        if (
          /\b(next\s*question)\b/i.test(normalizedCommand) ||
          /\b(tambaya\s*ta\s*gaba)\b/i.test(normalizedCommand)
        ) {
          window.dispatchEvent(
            new CustomEvent("audioNavigationCommand", {
              detail: { command: "nextQuestion" },
            })
          );
          return;
        }

        if (
          /\b(stop\s*practice)\b/i.test(normalizedCommand) ||
          /\b(dakatar\s*da\s*aiki)\b/i.test(normalizedCommand)
        ) {
          window.dispatchEvent(
            new CustomEvent("audioNavigationCommand", {
              detail: { command: "stopPractice" },
            })
          );
          return;
        }

        // Handle answer selection
        if (currentLesson) {
          // Try to get current question index from the lesson page state
          // Since we can't access the component state directly, we'll use a more generic approach
          const currentQuestionIndex = 0; // This will be handled by the lesson component
          const allOptions = currentLesson.questions.flatMap(
            (q: any) => q.options || []
          );

          const matchedOption = allOptions.find(
            (option: any) =>
              option.toLowerCase().includes(normalizedCommand) ||
              normalizedCommand.includes(option.toLowerCase())
          );

          if (matchedOption) {
            window.dispatchEvent(
              new CustomEvent("audioNavigationCommand", {
                detail: { command: "genericCommand", text: matchedOption },
              })
            );
            return;
          }

          const numberMatch = normalizedCommand.match(/\d+/);
          if (numberMatch) {
            const number = parseInt(numberMatch[0]);
            const numberOption = allOptions.find((option: any) =>
              option.includes(number.toString())
            );
            if (numberOption) {
              window.dispatchEvent(
                new CustomEvent("audioNavigationCommand", {
                  detail: { command: "genericCommand", text: numberOption },
                })
              );
              return;
            }
          }
        }
      }

      // Topic-specific commands
      const basicMathCommands = {
        english: ["basic math", "basic mathematics"],
        hausa: ["lissafin farko", "lissafi na asali"],
        kanuri: ["lissafin farko", "lissafi asali"],
        arabic: ["الرياضيات الأساسية", "الأساسية"],
      };

      const intermediateMathCommands = {
        english: ["intermediate math", "intermediate mathematics"],
        hausa: ["lissafin matsakaici", "lissafi na matsakaici"],
        kanuri: ["lissafin matsakaici", "lissafi matsakaici"],
        arabic: ["الرياضيات المتوسطة", "المتوسطة"],
      };

      const algebraCommands = {
        english: ["algebra"],
        hausa: ["algebra"],
        kanuri: ["algebra"],
        arabic: ["الجبر"],
      };

      const startPracticeCommands = {
        english: ["start practice", "begin practice", "start"],
        hausa: ["fara aiki", "fara horawa"],
        kanuri: ["fara aiki", "fara horawa"],
        arabic: ["ابدأ التمرين", "ابدأ"],
      };

      const readQuestionCommands = {
        english: ["read question", "repeat question", "hear question"],
        hausa: ["karanta tambaya", "maimaita tambaya"],
        kanuri: ["karanta tambaya", "maimaita tambaya"],
        arabic: ["اقرأ السؤال", "كرر السؤال"],
      };

      const nextQuestionCommands = {
        english: ["next question", "next"],
        hausa: ["tambaya ta gaba", "na gaba"],
        kanuri: ["tambaya ta gaba", "na gaba"],
        arabic: ["السؤال التالي", "التالي"],
      };

      const stopPracticeCommands = {
        english: ["stop practice", "stop", "end practice"],
        hausa: ["dakatar da aiki", "ƙare aiki"],
        kanuri: ["dakatar da aiki", "ƙare aiki"],
        arabic: ["توقف عن التمرين", "إنهاء"],
      };

      const helpCommands = {
        english: ["help", "commands", "what can i say"],
        hausa: ["taimako", "umarni", "me za na iya yi"],
        kanuri: ["taimako", "umarni", "me za na iya yi"],
        arabic: ["مساعدة", "أوامر", "ماذا يمكنني أن أقول"],
      };

      if (
        basicMathCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("goingToBasic", {
            english: "Going to Basic Math",
            hausa: "Zuwa Lissafin Asali",
            kanuri: "Lissafin Asali zuwa",
            arabic: "الانتقال إلى الرياضيات الأساسية",
          })
        );
        speakText(announcement, "medium");
        router.push("/topics/basic");
        return;
      }

      if (
        intermediateMathCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("goingToIntermediate", {
            english: "Going to Intermediate Math",
            hausa: "Zuwa Lissafin Matsakaici",
            kanuri: "Lissafin Matsakaici zuwa",
            arabic: "الانتقال إلى الرياضيات المتوسطة",
          })
        );
        speakText(announcement, "medium");
        router.push("/topics/intermediate");
        return;
      }

      if (
        algebraCommands[language].some((cmd) => normalizedCommand.includes(cmd))
      ) {
        setAnnouncement(
          t("goingToAlgebra", {
            english: "Going to Algebra",
            hausa: "Zuwa Algebra",
            kanuri: "Algebra zuwa",
            arabic: "الانتقال إلى الجبر",
          })
        );
        speakText(announcement, "medium");
        router.push("/topics/algebra");
        return;
      }

      if (
        startPracticeCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("startingPractice", {
            english: "Starting practice",
            hausa: "Fara aiki",
            kanuri: "Fara aiki",
            arabic: "بدء التمرين",
          })
        );
        speakText(announcement, "medium");
        window.dispatchEvent(
          new CustomEvent("audioNavigationCommand", {
            detail: { command: "startPractice" },
          })
        );
        return;
      }

      if (
        readQuestionCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("readingQuestion", {
            english: "Reading question",
            hausa: "Karanta tambaya",
            kanuri: "Karanta tambaya",
            arabic: "قراءة السؤال",
          })
        );
        speakText(announcement, "medium");
        window.dispatchEvent(
          new CustomEvent("audioNavigationCommand", {
            detail: { command: "readQuestion" },
          })
        );
        return;
      }

      if (
        nextQuestionCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("nextQuestion", {
            english: "Moving to next question",
            hausa: "Tambaya ta gaba",
            kanuri: "Tambaya ta gaba",
            arabic: "الانتقال إلى السؤال التالي",
          })
        );
        speakText(announcement, "medium");
        window.dispatchEvent(
          new CustomEvent("audioNavigationCommand", {
            detail: { command: "nextQuestion" },
          })
        );
        return;
      }

      if (
        stopPracticeCommands[language].some((cmd) =>
          normalizedCommand.includes(cmd)
        )
      ) {
        setAnnouncement(
          t("stoppingPractice", {
            english: "Stopping practice",
            hausa: "Dakatar da aiki",
            kanuri: "Dakatar da aiki",
            arabic: "إيقاف التمرين",
          })
        );
        speakText(announcement, "medium");
        window.dispatchEvent(
          new CustomEvent("audioNavigationCommand", {
            detail: { command: "stopPractice" },
          })
        );
        return;
      }

      if (
        helpCommands[language].some((cmd) => normalizedCommand.includes(cmd))
      ) {
        const currentPath = window.location.pathname;
        let helpText = "";

        if (currentPath === "/dashboard") {
          helpText = t("helpDashboard", {
              english: "Available commands: Global - 'Go to Progress', 'Go to Settings', 'Go to Lessons'. Topics - 'Basic Math', 'Intermediate Math', 'Algebra'. Say 'Exit' to exit audio navigation mode.",
              hausa: "Umarnin da ake iya amfani da su: Gaba daya - 'Zuwa Progress', 'Zuwa Settings', 'Zuwa Darussa'. Batutuwa - 'Lissafin Asali', 'Lissafin Matsakaici', 'Algebra'. Ka ce 'Fita' don fita daga yanayin kewayawa da murya.",
              kanuri: "Umarni da ake iya amfani: Gaba daya - 'Progress zuwa', 'Settings zuwa', 'Darussa zuwa'. Batutuwa - 'Lissafin Asali', 'Lissafin Matsakaici', 'Algebra'. 'Fita' ce murya kewayawa yanayi daga fita don.",
              arabic: ""
          });
        } else if (currentPath.includes("/topics/")) {
          helpText = t("helpTopic", {
              english: "Available commands: Say lesson names to navigate to lessons, 'Go back' to return to dashboard. Global - 'Go to Progress', 'Go to Settings'. Say 'Exit' to exit audio navigation mode.",
              hausa: "Umarnin da ake iya amfani da su: Ka ce sunaye na darussa don zuwa darussa, 'Koma baya' don komawa dashboard. Gaba daya - 'Zuwa Progress', 'Zuwa Settings'. Ka ce 'Fita' don fita daga yanayin kewayawa da murya.",
              kanuri: "Umarni da ake iya amfani: Darussa sunaye ce darussa zuwa don, 'Baya koma' ce dashboard komawa don. Gaba daya - 'Progress zuwa', 'Settings zuwa'. 'Fita' ce murya kewayawa yanayi daga fita don.",
              arabic: ""
          });
        } else if (currentPath.includes("/lesson/")) {
          helpText = t("helpLesson", {
              english: "Available commands: 'Start practice', 'Read question', 'Next question', 'Repeat question', 'Stop practice'. Global - 'Go to Dashboard', 'Go to Progress', 'Go to Settings'. Say 'Exit' to exit audio navigation mode.",
              hausa: "Umarnin da ake iya amfani da su: 'Fara aiki', 'Karanta tambaya', 'Tambaya ta gaba', 'Maimaita tambaya', 'Dakatar da aiki'. Gaba daya - 'Zuwa Dashboard', 'Zuwa Progress', 'Zuwa Settings'. Ka ce 'Fita' don fita daga yanayin kewayawa da murya.",
              kanuri: "Umarni da ake iya amfani: 'Fara aiki', 'Karanta tambaya', 'Tambaya ta gaba', 'Maimaita tambaya', 'Dakatar da aiki'. Gaba daya - 'Dashboard zuwa', 'Progress zuwa', 'Settings zuwa'. 'Fita' ce murya kewayawa yanayi daga fita don.",
              arabic: ""
          });
        } else {
          helpText = t("helpGeneral", {
              english: "Global commands: 'Go to Dashboard', 'Go to Progress', 'Go to Settings', 'Go to Lessons'. Say 'Exit' for more commands. To exit audio navigation mode, say 'Exit'.",
              hausa: "Umarnin gaba daya: 'Zuwa Dashboard', 'Zuwa Progress', 'Zuwa Settings', 'Zuwa Darussa'. Ka ce 'Taimako' don karin umarni. Don fita daga yanayin kewayawa da murya, ka ce 'Fita'.",
              kanuri: "Gaba daya umarni: 'Dashboard zuwa', 'Progress zuwa', 'Settings zuwa', 'Darussa zuwa'. 'Taimako' ce karin umarni don. Murya kewayawa yanayi daga fita don, 'Fita' ce.",
              arabic: ""
          });
        }

        setAnnouncement(helpText);
        speakText(helpText, "high");
        return;
      }

      // Generic command handling
      setAnnouncement(
        t("processingCommand", {
          english: `Processing command: ${normalizedCommand}`,
          hausa: `Ana sarrafa umarni: ${normalizedCommand}`,
          kanuri: `Umarni sarrafa: ${normalizedCommand}`,
          arabic: `جارٍ معالجة الأمر: ${normalizedCommand}`,
        })
      );
      speakText(announcement, "medium");
      window.dispatchEvent(
        new CustomEvent("audioNavigationCommand", {
          detail: { command: "genericCommand", text: normalizedCommand },
        })
      );
    },
    [
      router,
      speakText,
      t,
      language,
      toggleAudioNavigationMode,
      setSpeechQueue,
      stopListening,
    ]
  );

  const startListening = useCallback(async () => {
    if (
      !mountedRef.current ||
      !isAudioNavigationModeRef.current ||
      isListening
    ) {
      return;
    }

    console.log("🎤 [Vosk] Initializing speech recognition...");
    setIsListening(true);

    try {
      let currentModel = model;
      if (!currentModel) {
        speakText("Loading recognition model...", "high");
        console.log(`[Vosk] Creating model from: ${VOSK_MODEL_URL}`);
        currentModel = await createModel(VOSK_MODEL_URL);
        setModel(currentModel);
        speakText("Model loaded. Ready for commands.", "medium");
      }

      const recognizer = new currentModel.KaldiRecognizer(16000);
      recognizer.on("result", (message: any) => {
        const text = message.result.text;
        if (text) {
          handleVoiceCommand(text);
        }
      });
      recognizerRef.current = recognizer;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      processor.onaudioprocess = (event) => {
        if (!isAudioNavigationModeRef.current) return;
        try {
          recognizer.acceptWaveform(event.inputBuffer);
        } catch (error) {
          console.error("[Vosk] Error accepting waveform:", error);
        }
      };

      source.connect(processor);
      processor.connect(audioContext.destination);
    } catch (error) {
      console.error("💥 [Vosk] Setup error:", error);
      speakText(
        "Voice recognition failed to start. Please check microphone permissions and model URL.",
        "high"
      );
      setIsListening(false);
      stopListening();
    }
  }, [isListening, model, handleVoiceCommand, speakText, stopListening]);

  useEffect(() => {
    if (isAudioNavigationMode && mounted) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isAudioNavigationMode, mounted]);

  useEffect(() => {
    return () => {
      stopListening();
      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();
      }
    };
  }, [stopListening]);

  return (
    <VoskAudioNavigationContext.Provider
      value={{
        isAudioNavigationMode,
        isListening,
        currentFocus,
        availableCommands,
        showDeactivationMessage,
        announcement,
        toggleAudioNavigationMode,
        startListening,
        stopListening,
        speakText,
        announceCurrentFocus,
        setCurrentFocus,
        setAnnouncement,
      }}
    >
      {children}
    </VoskAudioNavigationContext.Provider>
  );
}

export function useAudioNavigation() {
  const context = useContext(VoskAudioNavigationContext);
  if (context === undefined) {
    throw new Error(
      "useAudioNavigation must be used within a VoskAudioNavigationProvider"
    );
  }
  return context;
}
