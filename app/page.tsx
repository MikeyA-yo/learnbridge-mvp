"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, signup, isAuthenticated } from "@/lib/auth"
import { BookOpen, Volume2, Users, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (isAuthenticated()) {
      router.push("/dashboard")
    }
  }, [router])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = isLogin ? login(email, password) : signup(email, password)

    if (success) {
      router.push("/language-select")
    } else {
      setError("Please enter both email and password")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-5xl md:text-6xl font-bold text-balance">Learnbridge</h1>
          </div>
          <p className="text-xl md:text-2xl text-muted-foreground text-balance">
            Math in Your Language, For Every Child
          </p>
          <p className="text-lg text-muted-foreground mt-2">
            Lissafi a Harshenka | Lissafi Harshenka | الرياضيات بلغتك
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-primary text-primary-foreground p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                <Volume2 className="h-8 w-8" />
              </div>
              <CardTitle>Voice-First Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Learn and answer in your own language with voice support
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-secondary text-secondary-foreground p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle>Accessible for All</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Designed for children with and without disabilities
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto bg-accent text-accent-foreground p-4 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                <Sparkles className="h-8 w-8" />
              </div>
              <CardTitle>Fun & Interactive</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Engaging lessons with visuals, audio, and practice
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Auth Form */}
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl text-center">{isLogin ? "Welcome Back!" : "Get Started"}</CardTitle>
            <CardDescription className="text-center text-base">
              {isLogin ? "Enter any email and password to continue" : "Create your account with any email and password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 text-base"
                  required
                />
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
              <Button type="submit" className="w-full h-12 text-lg" size="lg">
                {isLogin ? "Start Learning" : "Create Account"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary hover:underline text-base"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Demo Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground max-w-md mx-auto">
          <p className="bg-muted p-4 rounded-lg">
            <strong>Demo Mode:</strong> This is an MVP with dummy authentication. Any email and password will work. Your
            progress is saved locally.
          </p>
        </div>
      </div>
    </div>
  )
}
