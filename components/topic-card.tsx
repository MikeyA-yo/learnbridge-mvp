"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Language, MathTopic } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"

interface TopicCardProps {
  topic: MathTopic
  language: Language
  completedLessons: number
  totalLessons: number
  onClick: () => void
}

const topicData = {
  basic: {
    title: {
      hausa: "Lissafi na Asali",
      kanuri: "Lissafi Asali",
      arabic: "الرياضيات الأساسية",
    },
    description: {
      hausa: "Ƙidaya, Ƙari, Ragi, da Sauransu",
      kanuri: "Kərəwa, Kəmma, Ragi",
      arabic: "العد، الجمع، الطرح، والمزيد",
    },
    icon: "🔢",
    color: "bg-primary",
  },
  intermediate: {
    title: {
      hausa: "Lissafi na Matsakaici",
      kanuri: "Lissafi Matsakaici",
      arabic: "الرياضيات المتوسطة",
    },
    description: {
      hausa: "Kashi Ɗari, Lokaci, Auna",
      kanuri: "Kashi Dari, Lokaci, Auna",
      arabic: "النسب المئوية، الوقت، القياس",
    },
    icon: "📊",
    color: "bg-secondary",
  },
  algebra: {
    title: {
      hausa: "Algebra (Gabatarwa)",
      kanuri: "Algebra",
      arabic: "الجبر (مقدمة)",
    },
    description: {
      hausa: "Masu Canzawa, Ma'auni",
      kanuri: "Masu Canzawa, Ma'auni",
      arabic: "المتغيرات، المعادلات",
    },
    icon: "🔤",
    color: "bg-accent",
  },
}

export function TopicCard({ topic, language, completedLessons, totalLessons, onClick }: TopicCardProps) {
  const data = topicData[topic]
  const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`${data.color} text-white p-4 rounded-xl text-4xl mb-2`}>{data.icon}</div>
          {completedLessons > 0 && <CheckCircle2 className="h-6 w-6 text-accent" />}
        </div>
        <CardTitle className="text-2xl text-balance">{data.title[language]}</CardTitle>
        <CardDescription className="text-base">{data.description[language]}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {language === "hausa" ? "Ci gaba" : language === "kanuri" ? "Ci gaba" : "التقدم"}
            </span>
            <span className="font-semibold">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className={`${data.color} h-2 rounded-full transition-all`} style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Button className="w-full mt-4" size="lg">
          {language === "hausa" ? "Fara Koyo" : language === "kanuri" ? "Fara Koyo" : "ابدأ التعلم"}
        </Button>
      </CardContent>
    </Card>
  )
}
