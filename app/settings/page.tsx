"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getUser, isAuthenticated, updateUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, SettingsIcon } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import type { Language } from "@/lib/types"

export default function SettingsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!isAuthenticated()) {
      router.push("/")
    }
  }, [router])

  if (!mounted) return null

  const user = getUser()
  if (!user) return null

  const handleToggle = (setting: keyof typeof user.settings) => {
    updateUser({
      settings: {
        ...user.settings,
        [setting]: !user.settings[setting],
      },
    })
    window.location.reload()
  }

  const handleLanguageChange = (language: Language) => {
    updateUser({ language })
    setShowLanguageSelector(false)
    window.location.reload()
  }

  const handleSpeedChange = () => {
    const speeds = ["normal", "slow", "very-slow"] as const
    const currentIndex = speeds.indexOf(user.settings.audioSpeed)
    const nextSpeed = speeds[(currentIndex + 1) % speeds.length]
    updateUser({
      settings: {
        ...user.settings,
        audioSpeed: nextSpeed,
      },
    })
    window.location.reload()
  }

  const handlePitchChange = () => {
    const pitches = ["normal", "high"] as const
    const currentIndex = pitches.indexOf(user.settings.audioPitch)
    const nextPitch = pitches[(currentIndex + 1) % pitches.length]
    updateUser({
      settings: {
        ...user.settings,
        audioPitch: nextPitch,
      },
    })
    window.location.reload()
  }

  if (showLanguageSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Button variant="outline" onClick={() => setShowLanguageSelector(false)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {user.language === "hausa" ? "Koma" : user.language === "kanuri" ? "Koma" : "رجوع"}
          </Button>
          <div className="bg-card p-8 rounded-2xl shadow-lg">
            <LanguageSelector onSelect={handleLanguageChange} currentLanguage={user.language} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold">
              {user.language === "hausa" ? "Saitunan" : user.language === "kanuri" ? "Saitunan" : "الإعدادات"}
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>
                {user.language === "hausa" ? "Harshe" : user.language === "kanuri" ? "Harshe" : "اللغة"}
              </CardTitle>
              <CardDescription>
                {user.language === "hausa"
                  ? "Canza harshen koyo"
                  : user.language === "kanuri"
                    ? "Canza harshen koyo"
                    : "تغيير لغة التعلم"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setShowLanguageSelector(true)} variant="outline" size="lg">
                {user.language === "hausa"
                  ? "Canza Harshe"
                  : user.language === "kanuri"
                    ? "Canza Harshe"
                    : "تغيير اللغة"}
              </Button>
            </CardContent>
          </Card>

          {/* Accessibility Settings */}
          <Card>
            <CardHeader>
              <CardTitle>
                {user.language === "hausa"
                  ? "Saitunan Samun Dama"
                  : user.language === "kanuri"
                    ? "Saitunan Samun Dama"
                    : "إعدادات إمكانية الوصول"}
              </CardTitle>
              <CardDescription>
                {user.language === "hausa"
                  ? "Daidaita app don bukatunka"
                  : user.language === "kanuri"
                    ? "Daidaita app"
                    : "تخصيص التطبيق لاحتياجاتك"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="dyslexia-font" className="text-base">
                    {user.language === "hausa"
                      ? "Rubutun Mai Sauƙi"
                      : user.language === "kanuri"
                        ? "Rubutun Mai Sauƙi"
                        : "خط سهل القراءة"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {user.language === "hausa"
                      ? "Rubutu mai sauƙin karatu"
                      : user.language === "kanuri"
                        ? "Rubutu mai sauƙi"
                        : "خط أسهل للقراءة"}
                  </p>
                </div>
                <Switch
                  id="dyslexia-font"
                  checked={user.settings.dyslexiaFont}
                  onCheckedChange={() => handleToggle("dyslexiaFont")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="subtitles" className="text-base">
                    {user.language === "hausa" ? "Rubutu" : user.language === "kanuri" ? "Rubutu" : "الترجمة"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {user.language === "hausa"
                      ? "Nuna rubutu tare da sauti"
                      : user.language === "kanuri"
                        ? "Nuna rubutu"
                        : "إظهار النص مع الصوت"}
                  </p>
                </div>
                <Switch
                  id="subtitles"
                  checked={user.settings.subtitles}
                  onCheckedChange={() => handleToggle("subtitles")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="audio-nav" className="text-base">
                    {user.language === "hausa"
                      ? "Sauti Cikakke"
                      : user.language === "kanuri"
                        ? "Sauti Cikakke"
                        : "التنقل الصوتي الكامل"}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {user.language === "hausa"
                      ? "Amfani da app da sauti kawai"
                      : user.language === "kanuri"
                        ? "Amfani da sauti"
                        : "استخدام التطبيق بالصوت فقط"}
                  </p>
                </div>
                <Switch
                  id="audio-nav"
                  checked={user.settings.audioNavigation}
                  onCheckedChange={() => handleToggle("audioNavigation")}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-base">
                  {user.language === "hausa"
                    ? "Saurin Sauti"
                    : user.language === "kanuri"
                      ? "Saurin Sauti"
                      : "سرعة الصوت"}
                </Label>
                <Button onClick={handleSpeedChange} variant="outline" size="lg" className="w-full bg-transparent">
                  {user.settings.audioSpeed === "normal"
                    ? user.language === "hausa"
                      ? "Na Yau da Kullun"
                      : user.language === "kanuri"
                        ? "Na Yau da Kullun"
                        : "عادي"
                    : user.settings.audioSpeed === "slow"
                      ? user.language === "hausa"
                        ? "Sannu"
                        : user.language === "kanuri"
                          ? "Sannu"
                          : "بطيء"
                      : user.language === "hausa"
                        ? "Sannu Sosai"
                        : user.language === "kanuri"
                          ? "Sannu Sosai"
                          : "بطيء جدًا"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-base">
                  {user.language === "hausa"
                    ? "Sautin Sauti"
                    : user.language === "kanuri"
                      ? "Sautin Sauti"
                      : "نبرة الصوت"}
                </Label>
                <Button onClick={handlePitchChange} variant="outline" size="lg" className="w-full bg-transparent">
                  {user.settings.audioPitch === "normal"
                    ? user.language === "hausa"
                      ? "Na Yau da Kullun"
                      : user.language === "kanuri"
                        ? "Na Yau da Kullun"
                        : "عادي"
                    : user.language === "hausa"
                      ? "Babba"
                      : user.language === "kanuri"
                        ? "Babba"
                        : "عالي"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
