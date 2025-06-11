"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Timer, ChevronRight, Target, Trophy } from "lucide-react"

export default function TargetTest() {
  const router = useRouter()
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; size: number }>>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(20)
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [countdown, setCountdown] = useState(3)

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(20)
    setTargets([createTarget()]) // Start with only 1 target
    setCountdown(3)

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer)

          // Start the game timer
          timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
              if (prev <= 1) {
                clearInterval(timerRef.current as NodeJS.Timeout)
                endGame()
                return 0
              }
              return prev - 1
            })
          }, 1000)

          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const createTarget = () => {
    if (!containerRef.current) return { id: Date.now(), x: 50, y: 50, size: 40 }

    const { width, height } = containerRef.current.getBoundingClientRect()
    const size = Math.floor(Math.random() * 30) + 25 // 25-55px
    const x = Math.floor(Math.random() * (width - size - 20)) + 10
    const y = Math.floor(Math.random() * (height - size - 20)) + 10

    return { id: Date.now() + Math.random(), x, y, size }
  }

  const handleTargetClick = (id: number) => {
    setScore((prev) => prev + 1)
    setTargets((prev) => {
      // Remove clicked target and add one new target
      const filtered = prev.filter((t) => t.id !== id)
      const newTarget = createTarget()
      return [...filtered, newTarget]
    })
  }

  const endGame = () => {
    setGameState("finished")
    if (timerRef.current) clearInterval(timerRef.current)

    // Save score to localStorage
    const scores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    localStorage.setItem(
      "gameScores",
      JSON.stringify({
        ...scores,
        target: score,
      }),
    )
  }

  const nextTest = () => {
    router.push("/test/memory")
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Target Clicking Test</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Click as many targets as you can in 20 seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>Test 2/5</span>
            </div>
            <Progress value={40} className="h-2 bg-purple-950" />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <div className="flex items-center">
              <Target className="h-4 w-4 mr-1" />
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              <span>Time: {timeLeft}s</span>
            </div>
          </div>

          <div
            ref={containerRef}
            className="h-80 bg-slate-800 rounded-lg relative overflow-hidden"
            style={{ cursor: gameState === "playing" ? "crosshair" : "default" }}
          >
            {gameState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                  Start Test
                </Button>
              </div>
            )}

            {gameState === "playing" && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <p className="text-5xl font-bold text-white">{countdown}</p>
              </div>
            )}

            {gameState === "playing" &&
              countdown === 0 &&
              targets.map((target) => (
                <div
                  key={target.id}
                  className="absolute rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center cursor-pointer hover:scale-95 transition-transform"
                  style={{
                    left: `${target.x}px`,
                    top: `${target.y}px`,
                    width: `${target.size}px`,
                    height: `${target.size}px`,
                  }}
                  onClick={() => handleTargetClick(target.id)}
                >
                  <span className="text-white text-xs font-bold">+1</span>
                </div>
              ))}

            {gameState === "finished" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Trophy className="mx-auto h-12 w-12 mb-4 text-yellow-400" />
                  <p className="text-2xl font-bold mb-2">Target Test Complete!</p>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-sm opacity-90">Targets Hit</p>
                  </div>
                  <p className="text-sm text-purple-200">
                    {score >= 25 ? "Amazing accuracy!" : score >= 15 ? "Good shooting!" : "Keep practicing!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {gameState === "finished" && (
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
