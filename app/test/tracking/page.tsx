"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Timer, ChevronRight, MousePointer, Trophy } from "lucide-react"

export default function TrackingTest() {
  const router = useRouter()
  const [gameState, setGameState] = useState<"idle" | "playing" | "finished">("idle")
  const [timeLeft, setTimeLeft] = useState(15)
  const [score, setScore] = useState(0)
  const [dotPosition, setDotPosition] = useState({ x: 150, y: 100 })
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [countdown, setCountdown] = useState(3)

  // Use refs for animation values to avoid closure issues
  const positionRef = useRef({ x: 150, y: 100 })
  const velocityRef = useRef({ x: 2, y: 1.5 })
  const animationIdRef = useRef<number | null>(null)

  const startGame = () => {
    setGameState("playing")
    setScore(0)
    setTimeLeft(15)
    setCountdown(3)

    // Reset position and velocity
    positionRef.current = { x: 150, y: 100 }
    velocityRef.current = { x: 2, y: 1.5 }
    setDotPosition({ x: 150, y: 100 })

    let countdownValue = 3
    const countdownTimer = setInterval(() => {
      countdownValue--
      setCountdown(countdownValue)

      if (countdownValue <= 0) {
        clearInterval(countdownTimer)

        // Start timer
        let timeRemaining = 15
        timerRef.current = setInterval(() => {
          timeRemaining--
          setTimeLeft(timeRemaining)

          if (timeRemaining <= 0) {
            clearInterval(timerRef.current!)
            endGame()
          }
        }, 1000)

        // Start animation
        startAnimation()
      }
    }, 1000)
  }

  const startAnimation = () => {
    const animate = () => {
      if (!containerRef.current) {
        animationIdRef.current = requestAnimationFrame(animate)
        return
      }

      const rect = containerRef.current.getBoundingClientRect()
      const width = rect.width
      const height = rect.height

      // Update position using refs
      let { x, y } = positionRef.current
      let { x: vx, y: vy } = velocityRef.current

      x += vx
      y += vy

      // Bounce off walls
      if (x <= 15 || x >= width - 15) {
        vx = -vx
        x = x <= 15 ? 15 : width - 15
      }
      if (y <= 15 || y >= height - 15) {
        vy = -vy
        y = y <= 15 ? 15 : height - 15
      }

      // Random direction changes
      if (Math.random() < 0.02) {
        vx += (Math.random() - 0.5) * 1
        vy += (Math.random() - 0.5) * 1
      }

      // Speed limits
      const speed = Math.sqrt(vx * vx + vy * vy)
      if (speed > 4) {
        vx = (vx / speed) * 4
        vy = (vy / speed) * 4
      }
      if (speed < 1.5) {
        vx = (vx / speed) * 1.5
        vy = (vy / speed) * 1.5
      }

      // Update refs
      positionRef.current = { x, y }
      velocityRef.current = { x: vx, y: vy }

      // Update state
      setDotPosition({ x, y })

      // Continue animation
      animationIdRef.current = requestAnimationFrame(animate)
    }

    animationIdRef.current = requestAnimationFrame(animate)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (gameState !== "playing" || countdown > 0) return

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const newMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
      setMousePosition(newMousePos)

      // Calculate distance and update score
      const dx = dotPosition.x - newMousePos.x
      const dy = dotPosition.y - newMousePos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      const maxDistance = 80
      const accuracy = Math.max(0, 100 - (distance / maxDistance) * 100)
      setScore(Math.round(accuracy))
    }
  }

  const endGame = () => {
    setGameState("finished")
    if (timerRef.current) clearInterval(timerRef.current)
    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)

    const scores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    localStorage.setItem(
      "gameScores",
      JSON.stringify({
        ...scores,
        tracking: score,
      }),
    )
  }

  const nextTest = () => {
    router.push("/test/multitask")
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Visual Tracking Test</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Follow the moving dot with your cursor as closely as possible
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>Test 4/5</span>
            </div>
            <Progress value={80} className="h-2 bg-purple-950" />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <div className="flex items-center">
              <MousePointer className="h-4 w-4 mr-1" />
              <span>Accuracy: {score}%</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              <span>Time: {timeLeft}s</span>
            </div>
          </div>

          <div
            ref={containerRef}
            className="h-80 bg-slate-800 rounded-lg relative overflow-hidden"
            onMouseMove={handleMouseMove}
            style={{ cursor: gameState === "playing" && countdown === 0 ? "none" : "default" }}
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

            {gameState === "playing" && countdown === 0 && (
              <>
                <div
                  className="absolute w-6 h-6 rounded-full bg-pink-500 shadow-lg shadow-pink-500/50"
                  style={{
                    left: `${dotPosition.x - 12}px`,
                    top: `${dotPosition.y - 12}px`,
                  }}
                />

                <div
                  className="absolute w-4 h-4 rounded-full border-2 border-white pointer-events-none"
                  style={{
                    left: `${mousePosition.x - 8}px`,
                    top: `${mousePosition.y - 8}px`,
                  }}
                />
              </>
            )}

            {gameState === "finished" && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="text-center text-white">
                  <Trophy className="mx-auto h-12 w-12 mb-4 text-yellow-400" />
                  <p className="text-2xl font-bold mb-2">Tracking Test Complete!</p>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-bold">{score}%</p>
                    <p className="text-sm opacity-90">Average Accuracy</p>
                  </div>
                  <p className="text-sm text-purple-200">
                    {score >= 80 ? "Perfect tracking!" : score >= 60 ? "Great coordination!" : "Keep practicing!"}
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
