"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isAuthenticated } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Trophy, Star, Target, TrendingUp } from "lucide-react"
import { lessons } from "@/lib/lessons-data"

export default function ProgressPage() {
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

  const totalLessons = lessons.length
  const completedLessons = Object.values(user.progress).filter((p) => p.completed).length
  const totalStars = Object.values(user.progress).reduce((sum, p) => sum + (p.stars || 0), 0)
  const totalAttempts = Object.values(user.progress).reduce((sum, p) => sum + (p.attempts || 0), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              {user.language === "hausa" ? "Ci Gaban Ka" : user.language === "kanuri" ? "Ci Gaban Ka" : "تقدمك"}
            </h1>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-accent" />
                {user.language === "hausa"
                  ? "Jimlar Taurari"
                  : user.language === "kanuri"
                    ? "Jimlar Taurari"
                    : "إجمالي النجوم"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-accent">{totalStars}</p>
              <div className="flex gap-1 mt-2">
                {[...Array(Math.min(totalStars, 10))].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" />
                {user.language === "hausa"
                  ? "Darussa Da Aka Kammala"
                  : user.language === "kanuri"
                    ? "Darussa Da Aka Kammala"
                    : "الدروس المكتملة"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-primary">
                {completedLessons}/{totalLessons}
              </p>
              <div className="w-full bg-muted rounded-full h-3 mt-4">
                <div
                  className="bg-primary h-3 rounded-full transition-all"
                  style={{ width: `${(completedLessons / totalLessons) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-6 w-6 text-secondary" />
                {user.language === "hausa"
                  ? "Jimlar Gwaje-gwaje"
                  : user.language === "kanuri"
                    ? "Jimlar Gwaje-gwaje"
                    : "إجمالي المحاولات"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-secondary">{totalAttempts}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-6 w-6 text-accent" />
                {user.language === "hausa"
                  ? "Matsakaicin Taurari"
                  : user.language === "kanuri"
                    ? "Matsakaicin Taurari"
                    : "متوسط النجوم"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-5xl font-bold text-accent">
                {completedLessons > 0 ? (totalStars / completedLessons).toFixed(1) : "0"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Encouragement */}
        <Card className="bg-gradient-to-r from-primary/20 to-accent/20">
          <CardContent className="pt-6">
            <p className="text-xl font-semibold text-center text-balance">
              {completedLessons === 0
                ? user.language === "hausa"
                  ? "Fara tafiyarka ta koyo yau! 🚀"
                  : user.language === "kanuri"
                    ? "Fara tafiyarka ta koyo yau! 🚀"
                    : "ابدأ رحلة التعلم اليوم! 🚀"
                : completedLessons < totalLessons / 2
                  ? user.language === "hausa"
                    ? "Kana yin kyau! Ci gaba da aiki! 💪"
                    : user.language === "kanuri"
                      ? "Kana yin kyau! Ci gaba! 💪"
                      : "أنت تقوم بعمل رائع! استمر! 💪"
                  : completedLessons < totalLessons
                    ? user.language === "hausa"
                      ? "Kuna kusa da kammala! 🌟"
                      : user.language === "kanuri"
                        ? "Kuna kusa da kammala! 🌟"
                        : "أنت قريب من الانتهاء! 🌟"
                    : user.language === "hausa"
                      ? "Madalla! Ka kammala dukkan darussa! 🎉"
                      : user.language === "kanuri"
                        ? "Madalla! Ka kammala dukkan darussa! 🎉"
                        : "ممتاز! لقد أكملت جميع الدروس! 🎉"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
