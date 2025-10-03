import type { Lesson } from "./types"

export const lessons: Lesson[] = [
  // Basic Math
  {
    id: "counting",
    topic: "basic",
    title: {
      hausa: "Ƙidaya (1-100)",
      kanuri: "Kərəwa (1-100)",
      arabic: "العد (1-100)",
      english: "Counting (1-100)",
    },
    description: {
      hausa: "Koyi yadda ake ƙidaya daga 1 zuwa 100",
      kanuri: "Kərəwa kəmma 1 to 100",
      arabic: "تعلم العد من 1 إلى 100",
      english: "Learn how to count from 1 to 100",
    },
    content: {
      hausa: "Mu fara koyon ƙidaya! Idan muna da lemu 3, za mu iya ƙidaya: ɗaya, biyu, uku!",
      kanuri: "Kərəwa kəmma! Ləmun 3 nə, kərəwa: dəgə, fətu, yaska!",
      arabic: "لنبدأ بتعلم العد! إذا كان لدينا 3 برتقالات، يمكننا العد: واحد، اثنان، ثلاثة!",
      english: "Let's start learning to count! If we have 3 oranges, we can count: one, two, three!",
    },
    questions: [
      {
        id: "q1",
        question: {
          hausa: "Nawa lemu ake gani?",
          kanuri: "Ləmun nawa?",
          arabic: "كم عدد البرتقالات؟",
          english: "How many oranges do you see?",
        },
        answer: "5",
        options: ["3", "5", "7", "4"],
        visual: "🍊🍊🍊🍊🍊",
      },
    ],
    icon: "🔢",
  },
  {
    id: "addition",
    topic: "basic",
    title: {
      hausa: "Ƙari",
      kanuri: "Kəmma",
      arabic: "الجمع",
      english: "Addition",
    },
    description: {
      hausa: "Koyi yadda ake ƙara lambobi",
      kanuri: "Kəmma lambobi",
      arabic: "تعلم كيفية جمع الأرقام",
      english: "Learn how to add numbers",
    },
    content: {
      hausa: "Ƙari yana nufin haɗa lambobi. Misali: 2 + 3 = 5. Idan muna da lemu 2 kuma muka ƙara 3, za mu sami 5!",
      kanuri: "Kəmma nə lambobi haɗa. Misali: 2 + 3 = 5. Ləmun 2 kəmma 3, za mu sami 5!",
      arabic: "الجمع يعني إضافة الأرقام. مثال: 2 + 3 = 5. إذا كان لدينا برتقالتان وأضفنا 3، سنحصل على 5!",
      english: "Addition means combining numbers. Example: 2 + 3 = 5. If we have 2 oranges and add 3, we get 5!",
    },
    questions: [
      {
        id: "q1",
        question: {
          hausa: "3 + 4 = ?",
          kanuri: "3 + 4 = ?",
          arabic: "3 + 4 = ؟",
          english: "3 + 4 = ?",
        },
        answer: "7",
        options: ["6", "7", "8", "5"],
        visual: "🍊🍊🍊 + 🍊🍊🍊🍊",
      },
    ],
    icon: "➕",
  },
  // Intermediate Math
  {
    id: "percentages",
    topic: "intermediate",
    title: {
      hausa: "Kashi Ɗari",
      kanuri: "Kashi Dari",
      arabic: "النسب المئوية",
      english: "Percentages",
    },
    description: {
      hausa: "Koyi game da kashi ɗari",
      kanuri: "Kashi dari koyi",
      arabic: "تعلم عن النسب المئوية",
      english: "Learn about percentages",
    },
    content: {
      hausa: "Kashi ɗari yana nuna kashi na 100. Misali: 50% yana nufin rabin abu.",
      kanuri: "Kashi dari nə 100 kashi. Misali: 50% rabin abu nə.",
      arabic: "النسبة المئوية تظهر جزءًا من 100. مثال: 50٪ تعني نصف الشيء.",
      english: "Percentage shows a part of 100. Example: 50% means half of something.",
    },
    questions: [
      {
        id: "q1",
        question: {
          hausa: "Menene 50% na 10?",
          kanuri: "50% na 10 menene?",
          arabic: "ما هو 50٪ من 10؟",
          english: "What is 50% of 10?",
        },
        answer: "5",
        options: ["3", "5", "7", "10"],
      },
    ],
    icon: "📊",
  },
  // Algebra
  {
    id: "variables",
    topic: "algebra",
    title: {
      hausa: "Fahimtar Masu Canzawa (x, y)",
      kanuri: "Masu Canzawa (x, y)",
      arabic: "فهم المتغيرات (x، y)",
      english: "Understanding Variables (x, y)",
    },
    description: {
      hausa: "Koyi game da haruffa waɗanda ke wakiltar lambobi",
      kanuri: "Haruffa lambobi wakiltar",
      arabic: "تعلم عن الحروف التي تمثل الأرقام",
      english: "Learn about letters that represent numbers",
    },
    content: {
      hausa:
        "A algebra, muna amfani da haruffa kamar x da y don wakiltar lambobi da ba mu sani ba. Misali: x + 2 = 5, to x = 3",
      kanuri: "Algebra, haruffa kamar x da y lambobi wakiltar. Misali: x + 2 = 5, x = 3",
      arabic: "في الجبر، نستخدم حروفًا مثل x و y لتمثيل الأرقام التي لا نعرفها. مثال: x + 2 = 5، إذن x = 3",
      english:
        "In algebra, we use letters like x and y to represent numbers we don't know. Example: x + 2 = 5, so x = 3",
    },
    questions: [
      {
        id: "q1",
        question: {
          hausa: "Idan x + 3 = 7, menene x?",
          kanuri: "x + 3 = 7, x menene?",
          arabic: "إذا كان x + 3 = 7، ما هو x؟",
          english: "If x + 3 = 7, what is x?",
        },
        answer: "4",
        options: ["3", "4", "5", "10"],
      },
    ],
    icon: "🔤",
  },
]
