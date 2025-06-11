"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle, Clock, ChevronRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Trophy } from "lucide-react"

export default function ReactionTest() {
  const router = useRouter()
  const { toast } = useToast()
  const [state, setState] = useState<"idle" | "waiting" | "ready" | "clicked" | "finished">("idle")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [attempts, setAttempts] = useState<number[]>([])
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [countdown, setCountdown] = useState(3)

  const startTest = useCallback(() => {
    setState("waiting")
    setCountdown(3)

    const id = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(id)
          const randomDelay = Math.floor(Math.random() * 3000) + 1000 // 1-4 seconds
          const timeout = setTimeout(() => {
            setStartTime(Date.now())
            setState("ready")
          }, randomDelay)
          setTimeoutId(timeout)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [])

  const handleClick = () => {
    if (state === "waiting") {
      // Clicked too early
      if (timeoutId) clearTimeout(timeoutId)
      setState("idle")
      toast({
        title: "Too early!",
        description: "Wait for the green color before clicking",
        variant: "destructive",
      })
    } else if (state === "ready") {
      // Valid click
      const endTime = Date.now()
      const time = startTime ? endTime - startTime : 0
      setReactionTime(time)
      setState("clicked")

      // Record the attempt
      const newAttempts = [...attempts, time]
      setAttempts(newAttempts)

      // Check if we've completed all attempts
      if (newAttempts.length >= 5) {
        setState("finished")

        // Calculate average and save to localStorage
        const average = Math.round(newAttempts.reduce((a, b) => a + b, 0) / newAttempts.length)
        const scores = JSON.parse(localStorage.getItem("gameScores") || "{}")
        localStorage.setItem(
          "gameScores",
          JSON.stringify({
            ...scores,
            reaction: average,
          }),
        )
      }
    }
  }

  const nextTest = () => {
    router.push("/test/target")
  }

  const nextAttempt = () => {
    setTimeout(() => {
      setState("idle")
      setReactionTime(null)
    }, 1500)
  }

  useEffect(() => {
    if (state === "clicked") {
      nextAttempt()
    }
  }, [state])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Reaction Time Test</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Click as fast as you can when the color changes to green
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>Test 1/5</span>
            </div>
            <Progress value={20} className="h-2 bg-purple-950" />
          </div>

          <div
            className={`h-64 rounded-lg flex items-center justify-center transition-colors duration-200 cursor-pointer
              ${state === "idle" ? "bg-slate-800" : ""}
              ${state === "waiting" ? "bg-red-600" : ""}
              ${state === "ready" ? "bg-green-500" : ""}
              ${state === "clicked" ? "bg-blue-500" : ""}
              ${state === "finished" ? "bg-purple-600" : ""}
            `}
            onClick={handleClick}
          >
            {state === "idle" && (
              <Button onClick={startTest} className="bg-purple-600 hover:bg-purple-700">
                Start Test
              </Button>
            )}

            {state === "waiting" && (
              <div className="text-center text-white">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p className="text-xl font-bold">Wait for green...</p>
                {countdown > 0 && <p className="text-3xl font-bold mt-2">{countdown}</p>}
              </div>
            )}

            {state === "ready" && (
              <div className="text-center text-white">
                <p className="text-2xl font-bold">CLICK NOW!</p>
              </div>
            )}

            {state === "clicked" && reactionTime && (
              <div className="text-center text-white">
                <Clock className="mx-auto h-8 w-8 mb-2" />
                <p className="text-xl font-bold">{reactionTime} ms</p>
              </div>
            )}

            {state === "finished" && (
              <div className="text-center text-white">
                <Trophy className="mx-auto h-12 w-12 mb-4 text-yellow-400" />
                <p className="text-2xl font-bold mb-2">Reaction Test Complete!</p>
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 mb-4">
                  <p className="text-3xl font-bold">
                    {Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length)} ms
                  </p>
                  <p className="text-sm opacity-90">Average Reaction Time</p>
                </div>
                <p className="text-sm text-purple-200">
                  {Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) < 200
                    ? "Excellent reflexes!"
                    : Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) < 300
                      ? "Good reaction time!"
                      : "Keep practicing!"}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <span>Attempts: {attempts.length}/5</span>
            {attempts.length > 0 && <span>Last: {attempts[attempts.length - 1]} ms</span>}
          </div>
        </CardContent>

        {state === "finished" && (
          <CardFooter>
            <Button
              onClick={nextTest}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Next Test <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
