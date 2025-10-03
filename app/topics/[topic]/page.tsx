"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getUser, isAuthenticated } from "@/lib/auth"
import { LessonCard } from "@/components/lesson-card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, BookOpen } from "lucide-react"
import { lessons } from "@/lib/lessons-data"
import type { MathTopic } from "@/lib/types"

export default function TopicPage() {
  const router = useRouter()
  const params = useParams()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  if (!mounted) return null

  const user = getUser()
  if (!user) return null

  const topic = params.topic as MathTopic
  const topicLessons = lessons.filter((l) => l.topic === topic)

  const topicTitles = {
    basic: {
      hausa: "Lissafi na Asali",
      kanuri: "Lissafi Asali",
      arabic: "الرياضيات الأساسية",
    },
    intermediate: {
      hausa: "Lissafi na Matsakaici",
      kanuri: "Lissafi Matsakaici",
      arabic: "الرياضيات المتوسطة",
    },
    algebra: {
      hausa: "Algebra",
      kanuri: "Algebra",
      arabic: "الجبر",
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">{topicTitles[topic][user.language]}</h1>
          </div>
        </div>

        {/* Lessons */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topicLessons.map((lesson, index) => {
            const progress = user.progress[lesson.id]
            return (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                language={user.language}
                stars={progress?.stars || 0}
                completed={progress?.completed || false}
                locked={false}
                onClick={() => router.push(`/lesson/${lesson.id}`)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
