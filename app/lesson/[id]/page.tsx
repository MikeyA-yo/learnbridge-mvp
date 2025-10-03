"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { getUser, isAuthenticated, updateUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Star } from "lucide-react"
import { lessons } from "@/lib/lessons-data"

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const [mounted, setMounted] = useState(false)
  const [showPractice, setShowPractice] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [stars, setStars] = useState(0)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  if (!mounted) return null

  const user = getUser()
  if (!user) return null

  const lesson = lessons.find((l) => l.id === params.id)
  if (!lesson) {
    router.push("/dashboard")
    return null
  }

  const handleStartPractice = () => {
    setShowPractice(true)
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer)
  }

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return

    const question = lesson.questions[currentQuestion]
    const correct = selectedAnswer === question.answer

    setIsCorrect(correct)
    setShowFeedback(true)

    if (correct) {
      setStars((prev) => Math.min(prev + 1, 3))
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < lesson.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // Complete lesson
      const user = getUser()
      if (user) {
        const newProgress = {
          ...user.progress,
          [lesson.id]: {
            completed: true,
            stars: Math.max(stars, user.progress[lesson.id]?.stars || 0),
            attempts: (user.progress[lesson.id]?.attempts || 0) + 1,
          },
        }
        updateUser({ progress: newProgress })
      }
      router.push("/dashboard")
    }
  }

  const handlePlayAudio = () => {
    // Mock audio playback
    console.log("[v0] Playing audio for lesson content")
    alert(
      user.language === "hausa"
        ? "Sauti yana kunna... (Demo Mode)"
        : user.language === "kanuri"
          ? "Sauti yana kunna... (Demo Mode)"
          : "تشغيل الصوت... (وضع العرض)",
    )
  }

  const question = lesson.questions[currentQuestion]

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 ${user.settings.dyslexiaFont ? "dyslexia-font" : ""}`}
    >
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push(`/topics/${lesson.topic}`)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-balance">{lesson.title[user.language]}</h1>
            <p className="text-muted-foreground">{lesson.description[user.language]}</p>
          </div>
        </div>

        {!showPractice ? (
          /* Teaching Section */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{user.language === "hausa" ? "Darasi" : user.language === "kanuri" ? "Darasi" : "الدرس"}</span>
                  <Button variant="outline" size="icon" onClick={handlePlayAudio}>
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Visual Aid */}
                <div className="bg-muted p-8 rounded-xl text-center">
                  <div className="text-6xl mb-4">{lesson.icon}</div>
                  <p className="text-4xl font-bold">{lesson.questions[0]?.visual || "📚"}</p>
                </div>

                {/* Lesson Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-xl leading-relaxed">{lesson.content[user.language]}</p>
                </div>

                {/* Subtitles */}
                {user.settings.subtitles && (
                  <div className="bg-card border-2 border-primary p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">
                      {user.language === "hausa" ? "Rubutu" : user.language === "kanuri" ? "Rubutu" : "الترجمة"}
                    </p>
                    <p className="text-base">{lesson.content[user.language]}</p>
                  </div>
                )}

                <Button onClick={handleStartPractice} size="lg" className="w-full text-lg">
                  {user.language === "hausa" ? "Fara Aiki" : user.language === "kanuri" ? "Fara Aiki" : "ابدأ التمرين"}
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Practice Section */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {user.language === "hausa" ? "Tambaya" : user.language === "kanuri" ? "Tambaya" : "سؤال"}{" "}
                    {currentQuestion + 1}/{lesson.questions.length}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <Star key={i} className={`h-5 w-5 ${i < stars ? "fill-accent text-accent" : "text-muted"}`} />
                    ))}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Visual */}
                {question.visual && (
                  <div className="bg-muted p-8 rounded-xl text-center">
                    <p className="text-5xl">{question.visual}</p>
                  </div>
                )}

                {/* Question Text */}
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">{question.question[user.language]}</p>
                  <Button variant="outline" size="icon" onClick={handlePlayAudio}>
                    <Volume2 className="h-5 w-5" />
                  </Button>
                </div>

                {/* Answer Options */}
                <div className="grid grid-cols-2 gap-4">
                  {question.options?.map((option) => (
                    <Button
                      key={option}
                      variant={selectedAnswer === option ? "default" : "outline"}
                      size="lg"
                      className="h-20 text-2xl font-bold"
                      onClick={() => handleAnswerSelect(option)}
                      disabled={showFeedback}
                    >
                      {option}
                    </Button>
                  ))}
                </div>

                {/* Feedback */}
                {showFeedback && (
                  <Card className={isCorrect ? "bg-accent/10 border-accent" : "bg-destructive/10 border-destructive"}>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        {isCorrect ? (
                          <CheckCircle2 className="h-8 w-8 text-accent" />
                        ) : (
                          <XCircle className="h-8 w-8 text-destructive" />
                        )}
                        <p className="text-xl font-bold">
                          {isCorrect
                            ? user.language === "hausa"
                              ? "Madalla! 🎉"
                              : user.language === "kanuri"
                                ? "Madalla! 🎉"
                                : "ممتاز! 🎉"
                            : user.language === "hausa"
                              ? "Sake gwadawa..."
                              : user.language === "kanuri"
                                ? "Sake gwadawa..."
                                : "حاول مرة أخرى..."}
                        </p>
                      </div>
                      {!isCorrect && (
                        <p className="text-muted-foreground">
                          {user.language === "hausa"
                            ? `Amsar da ta dace ita ce: ${question.answer}`
                            : user.language === "kanuri"
                              ? `Amsar da ta dace: ${question.answer}`
                              : `الإجابة الصحيحة هي: ${question.answer}`}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Action Buttons */}
                {!showFeedback ? (
                  <Button onClick={handleSubmitAnswer} size="lg" className="w-full text-lg" disabled={!selectedAnswer}>
                    {user.language === "hausa"
                      ? "Tura Amsa"
                      : user.language === "kanuri"
                        ? "Tura Amsa"
                        : "إرسال الإجابة"}
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} size="lg" className="w-full text-lg">
                    {currentQuestion < lesson.questions.length - 1
                      ? user.language === "hausa"
                        ? "Tambaya Na Gaba"
                        : user.language === "kanuri"
                          ? "Tambaya Na Gaba"
                          : "السؤال التالي"
                      : user.language === "hausa"
                        ? "Kammala"
                        : user.language === "kanuri"
                          ? "Kammala"
                          : "إنهاء"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
