"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Timer, ChevronRight, Layers, Trophy } from "lucide-react"

export default function MultitaskTest() {
  const router = useRouter()
  const [gameState, setGameState] = useState<"idle" | "countdown" | "playing" | "finished">("idle")
  const [timeLeft, setTimeLeft] = useState(20)
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)

  // Bar states
  const [verticalBar, setVerticalBar] = useState({ position: 50, target: 30 })
  const [horizontalBar, setHorizontalBar] = useState({ position: 50, target: 70 })

  // Refs for tracking values
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const scoreRef = useRef(0)
  const timeRef = useRef(20)

  const startGame = () => {
    console.log("=== STARTING GAME ===")
    setGameState("countdown")
    setScore(0)
    scoreRef.current = 0
    setTimeLeft(20)
    timeRef.current = 20
    setVerticalBar({ position: 50, target: 30 })
    setHorizontalBar({ position: 50, target: 70 })
    setCountdown(3)

    // Clear any existing interval
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current)
    }

    // Countdown phase
    let countdownValue = 3
    const countdownTimer = setInterval(() => {
      countdownValue--
      console.log("Countdown:", countdownValue)
      setCountdown(countdownValue)

      if (countdownValue <= 0) {
        clearInterval(countdownTimer)
        console.log("=== STARTING MAIN GAME ===")
        setGameState("playing")
        startMainGame()
      }
    }, 1000)
  }

  const startMainGame = () => {
    let tickCount = 0
    let currentVerticalBar = { position: 50, target: 30 }
    let currentHorizontalBar = { position: 50, target: 70 }

    // Single interval that handles everything
    gameIntervalRef.current = setInterval(() => {
      tickCount++

      // Update timer every 10 ticks (every second)
      if (tickCount % 10 === 0) {
        timeRef.current--
        setTimeLeft(timeRef.current)
        console.log("Time remaining:", timeRef.current)

        if (timeRef.current <= 0) {
          console.log("=== TIME UP! ENDING GAME ===")
          endGame()
          return
        }
      }

      // Get current bar positions
      setVerticalBar((prev) => {
        const newPosition = Math.max(0, Math.min(100, prev.position + (Math.random() * 2 - 1)))
        currentVerticalBar = { ...prev, position: newPosition }
        return currentVerticalBar
      })

      setHorizontalBar((prev) => {
        const newPosition = Math.max(0, Math.min(100, prev.position + (Math.random() * 2 - 1)))
        currentHorizontalBar = { ...prev, position: newPosition }
        return currentHorizontalBar
      })

      // Update score using current positions
      const vDiff = Math.abs(currentVerticalBar.position - currentVerticalBar.target)
      const hDiff = Math.abs(currentHorizontalBar.position - currentHorizontalBar.target)
      const totalDiff = vDiff + hDiff

      let points = 0
      if (totalDiff < 15)
        points = 3 // Very close
      else if (totalDiff < 25)
        points = 2 // Close
      else if (totalDiff < 35) points = 1 // Okay

      if (points > 0) {
        scoreRef.current += points
        setScore(scoreRef.current)
      }

      // Occasionally change targets
      if (Math.random() < 0.01) {
        setVerticalBar((prev) => ({
          ...prev,
          target: Math.floor(Math.random() * 60) + 20,
        }))
        currentVerticalBar.target = Math.floor(Math.random() * 60) + 20
      }

      if (Math.random() < 0.01) {
        setHorizontalBar((prev) => ({
          ...prev,
          target: Math.floor(Math.random() * 60) + 20,
        }))
        currentHorizontalBar.target = Math.floor(Math.random() * 60) + 20
      }
    }, 100) // Run every 100ms
  }

  const endGame = () => {
    const finalScore = scoreRef.current
    console.log("=== ENDING GAME ===", "Final Score:", finalScore)
    setGameState("finished")

    // Clear interval
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current)
      gameIntervalRef.current = null
    }

    // Save score
    const scores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    const newScores = {
      ...scores,
      multitask: finalScore,
    }
    localStorage.setItem("gameScores", JSON.stringify(newScores))
    console.log("Saved scores:", newScores)
  }

  const showResults = () => {
    router.push("/results")
  }

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return

      // Prevent page scrolling
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault()
      }

      const key = e.key.toLowerCase()

      // Vertical bar controls
      if (key === "w" || key === "arrowup") {
        setVerticalBar((prev) => ({
          ...prev,
          position: Math.max(0, prev.position - 1),
        }))
      } else if (key === "s" || key === "arrowdown") {
        setVerticalBar((prev) => ({
          ...prev,
          position: Math.min(100, prev.position + 1),
        }))
      }

      // Horizontal bar controls
      if (key === "a" || key === "arrowleft") {
        setHorizontalBar((prev) => ({
          ...prev,
          position: Math.max(0, prev.position - 1),
        }))
      } else if (key === "d" || key === "arrowright") {
        setHorizontalBar((prev) => ({
          ...prev,
          position: Math.min(100, prev.position + 1),
        }))
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameState])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Multi-tasking Test</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Keep both bars aligned with their targets using arrow keys or WASD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>Test 5/5</span>
            </div>
            <Progress value={100} className="h-2 bg-purple-950" />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <div className="flex items-center">
              <Layers className="h-4 w-4 mr-1" />
              <span>Score: {score}</span>
            </div>
            <div className="flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              <span>Time: {timeLeft}s</span>
            </div>
          </div>

          <div className="bg-slate-800 rounded-lg p-6">
            {gameState === "idle" && (
              <div className="flex flex-col items-center justify-center h-48 space-y-4">
                <p className="text-white text-center">
                  Use <span className="font-bold text-pink-400">W/S or Up/Down</span> for the top bar
                  <br />
                  Use <span className="font-bold text-purple-400">A/D or Left/Right</span> for the bottom bar
                </p>
                <p className="text-sm text-purple-300 text-center">
                  Keep the colored bars inside the white target zones to score points!
                </p>
                <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                  Start Test
                </Button>
              </div>
            )}

            {gameState === "countdown" && (
              <div className="flex items-center justify-center h-48 bg-black/50 rounded-lg">
                <p className="text-5xl font-bold text-white">{countdown}</p>
              </div>
            )}

            {gameState === "playing" && (
              <div className="space-y-12 h-64 flex flex-col justify-center">
                {/* Scoring info */}
                <div className="text-xs text-center text-green-300">
                  {(() => {
                    const totalDiff =
                      Math.abs(verticalBar.position - verticalBar.target) +
                      Math.abs(horizontalBar.position - horizontalBar.target)
                    if (totalDiff < 15) return "🔥 PERFECT! +3 points"
                    if (totalDiff < 25) return "✨ GOOD! +2 points"
                    if (totalDiff < 35) return "👍 OK! +1 point"
                    return "Keep trying!"
                  })()}
                </div>

                {/* Vertical bar */}
                <div className="relative">
                  <div className="text-xs text-pink-300 mb-2 text-center">Vertical Bar - W/S or ↑/↓</div>
                  <div className="relative h-8 bg-slate-700 rounded-full">
                    {/* Target zone */}
                    <div
                      className="absolute top-0 h-full bg-white/30 border-2 border-white rounded-full"
                      style={{
                        width: "24px",
                        left: `calc(${verticalBar.target}% - 12px)`,
                      }}
                    />
                    {/* Player bar */}
                    <div
                      className="absolute top-1 h-6 bg-pink-500 rounded-full z-10"
                      style={{
                        width: "10px",
                        left: `calc(${verticalBar.position}% - 5px)`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1 text-white">
                    Distance: {Math.abs(verticalBar.position - verticalBar.target).toFixed(1)}
                  </div>
                </div>

                {/* Horizontal bar */}
                <div className="relative">
                  <div className="text-xs text-purple-300 mb-2 text-center">Horizontal Bar - A/D or ←/→</div>
                  <div className="relative h-8 bg-slate-700 rounded-full">
                    {/* Target zone */}
                    <div
                      className="absolute top-0 h-full bg-white/30 border-2 border-white rounded-full"
                      style={{
                        width: "24px",
                        left: `calc(${horizontalBar.target}% - 12px)`,
                      }}
                    />
                    {/* Player bar */}
                    <div
                      className="absolute top-1 h-6 bg-purple-500 rounded-full z-10"
                      style={{
                        width: "10px",
                        left: `calc(${horizontalBar.position}% - 5px)`,
                      }}
                    />
                  </div>
                  <div className="text-xs text-center mt-1 text-white">
                    Distance: {Math.abs(horizontalBar.position - horizontalBar.target).toFixed(1)}
                  </div>
                </div>
              </div>
            )}

            {gameState === "finished" && (
              <div className="flex items-center justify-center h-48 bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Trophy className="mx-auto h-12 w-12 mb-4 text-yellow-400" />
                  <p className="text-2xl font-bold mb-2">Multi-tasking Complete!</p>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-sm opacity-90">Multi-task Points</p>
                  </div>
                  <p className="text-sm text-purple-200">
                    {score >= 1000 ? "Master multi-tasker!" : score >= 500 ? "Great coordination!" : "Good effort!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        {gameState === "finished" && (
          <CardFooter>
            <Button
              onClick={showResults}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              See Your Results <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
