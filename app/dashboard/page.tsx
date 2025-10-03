"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isAuthenticated, logout } from "@/lib/auth"
import { TopicCard } from "@/components/topic-card"
import { Button } from "@/components/ui/button"
import { BookOpen, Settings, LogOut, Trophy } from "lucide-react"
import { lessons } from "@/lib/lessons-data"
import type { MathTopic } from "@/lib/types"

export default function DashboardPage() {
  const router = useRouter()
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

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getTopicStats = (topic: MathTopic) => {
    const topicLessons = lessons.filter((l) => l.topic === topic)
    const completed = topicLessons.filter((l) => user.progress[l.id]?.completed).length
    return { completed, total: topicLessons.length }
  }

  const totalStars = Object.values(user.progress).reduce((sum, p) => sum + (p.stars || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">Learnbridge</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => router.push("/progress")} title="Progress">
              <Trophy className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => router.push("/settings")} title="Settings">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-card p-6 rounded-2xl shadow-lg mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            {user.language === "hausa" ? "Barka da zuwa!" : user.language === "kanuri" ? "Barka da zuwa!" : "مرحبا بك!"}
          </h2>
          <p className="text-muted-foreground text-lg">{user.email}</p>
          <div className="flex items-center gap-2 mt-4">
            <Trophy className="h-5 w-5 text-accent" />
            <span className="font-semibold text-lg">
              {totalStars} {user.language === "hausa" ? "Taurari" : user.language === "kanuri" ? "Taurari" : "نجوم"}
            </span>
          </div>
        </div>

        {/* Topics */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {user.language === "hausa" ? "Zaɓi Batu" : user.language === "kanuri" ? "Zaɓi Batu" : "اختر موضوعًا"}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TopicCard
            topic="basic"
            language={user.language}
            completedLessons={getTopicStats("basic").completed}
            totalLessons={getTopicStats("basic").total}
            onClick={() => router.push("/topics/basic")}
          />
          <TopicCard
            topic="intermediate"
            language={user.language}
            completedLessons={getTopicStats("intermediate").completed}
            totalLessons={getTopicStats("intermediate").total}
            onClick={() => router.push("/topics/intermediate")}
          />
          <TopicCard
            topic="algebra"
            language={user.language}
            completedLessons={getTopicStats("algebra").completed}
            totalLessons={getTopicStats("algebra").total}
            onClick={() => router.push("/topics/algebra")}
          />
        </div>
      </div>
    </div>
  )
}
