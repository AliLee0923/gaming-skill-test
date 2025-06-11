"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Brain, ChevronRight, Trophy } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
]

export default function MemoryTest() {
  const router = useRouter()
  const { toast } = useToast()
  const [gameState, setGameState] = useState<"idle" | "showing" | "input" | "feedback" | "finished">("idle")
  const [level, setLevel] = useState(1)
  const [pattern, setPattern] = useState<number[]>([])
  const [userPattern, setUserPattern] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [countdown, setCountdown] = useState(3)

  const startGame = () => {
    setGameState("showing")
    setLevel(1)
    setScore(0)
    setCountdown(3)

    const countdownTimer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownTimer)
          generatePattern(1)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const generatePattern = (currentLevel: number) => {
    const newPattern = []
    for (let i = 0; i < currentLevel + 2; i++) {
      newPattern.push(Math.floor(Math.random() * COLORS.length))
    }
    setPattern(newPattern)
    showPattern(newPattern)
  }

  const showPattern = (patternToShow: number[]) => {
    setGameState("showing")
    let index = 0

    const showNext = () => {
      if (index >= patternToShow.length) {
        setUserPattern([])
        setGameState("input")
        return
      }

      // Highlight current tile
      const tiles = document.querySelectorAll(".memory-tile")
      tiles.forEach((tile) => tile.classList.remove("ring-4", "ring-white", "scale-110"))

      if (tiles[patternToShow[index]]) {
        tiles[patternToShow[index]].classList.add("ring-4", "ring-white", "scale-110")
      }

      setTimeout(() => {
        // Remove highlight
        if (tiles[patternToShow[index]]) {
          tiles[patternToShow[index]].classList.remove("ring-4", "ring-white", "scale-110")
        }
        index++
        setTimeout(showNext, 200)
      }, 600)
    }

    setTimeout(showNext, 500)
  }

  const handleTileClick = (colorIndex: number) => {
    if (gameState !== "input") return

    const newUserPattern = [...userPattern, colorIndex]
    setUserPattern(newUserPattern)

    // Check if the user's input matches the pattern so far
    if (pattern[newUserPattern.length - 1] !== colorIndex) {
      // Wrong input
      setGameState("feedback")
      toast({
        title: "Incorrect pattern!",
        description: "Game over",
        variant: "destructive",
      })

      setTimeout(() => {
        endGame()
      }, 1500)
      return
    }

    // Check if the user has completed the pattern
    if (newUserPattern.length === pattern.length) {
      // Correct pattern
      setGameState("feedback")
      setScore((prev) => prev + pattern.length)

      setTimeout(() => {
        if (level >= 5) {
          endGame()
        } else {
          setLevel((prev) => prev + 1)
          generatePattern(level + 1)
        }
      }, 1000)
    }
  }

  const endGame = () => {
    setGameState("finished")

    // Save score to localStorage
    const scores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    localStorage.setItem(
      "gameScores",
      JSON.stringify({
        ...scores,
        memory: score,
      }),
    )
  }

  const nextTest = () => {
    router.push("/test/tracking")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Memory Test</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Remember and repeat the pattern of colored squares
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>Test 3/5</span>
            </div>
            <Progress value={60} className="h-2 bg-purple-950" />
          </div>

          <div className="flex justify-between text-sm text-purple-200">
            <div className="flex items-center">
              <Brain className="h-4 w-4 mr-1" />
              <span>Score: {score}</span>
            </div>
            <div>Level: {level}/5</div>
          </div>

          <div className="bg-slate-800 rounded-lg p-4">
            {gameState === "idle" && (
              <div className="flex items-center justify-center h-48">
                <Button onClick={startGame} className="bg-purple-600 hover:bg-purple-700">
                  Start Test
                </Button>
              </div>
            )}

            {gameState === "showing" && countdown > 0 && (
              <div className="flex items-center justify-center h-48 bg-black/50 rounded-lg">
                <p className="text-5xl font-bold text-white">{countdown}</p>
              </div>
            )}

            {(gameState === "showing" || gameState === "input" || gameState === "feedback") && (
              <div className="grid grid-cols-4 gap-2 h-64">
                {COLORS.map((color, index) => (
                  <div
                    key={index}
                    className={`memory-tile rounded-lg cursor-pointer transition-all duration-200 ${color} 
                      ${gameState === "input" ? "hover:opacity-80 active:scale-95" : ""}
                      ${gameState === "feedback" ? "opacity-70" : ""}
                    `}
                    onClick={() => handleTileClick(index)}
                  />
                ))}
              </div>
            )}

            {gameState === "showing" && countdown === 0 && (
              <div className="text-center mt-4 text-white">
                <p>Watch the pattern...</p>
              </div>
            )}

            {gameState === "input" && (
              <div className="text-center mt-4 text-white">
                <p>Repeat the pattern</p>
                <div className="flex justify-center gap-1 mt-2">
                  {pattern.map((_, index) => (
                    <div
                      key={index}
                      className={`w-3 h-3 rounded-full ${index < userPattern.length ? "bg-green-500" : "bg-white/30"}`}
                    />
                  ))}
                </div>
              </div>
            )}

            {gameState === "finished" && (
              <div className="flex items-center justify-center h-48 bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <Trophy className="mx-auto h-12 w-12 mb-4 text-yellow-400" />
                  <p className="text-2xl font-bold mb-2">Memory Test Complete!</p>
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-4 mb-4">
                    <p className="text-3xl font-bold">{score}</p>
                    <p className="text-sm opacity-90">Memory Points</p>
                  </div>
                  <p className="text-sm text-purple-200">
                    {score >= 15 ? "Incredible memory!" : score >= 10 ? "Good recall!" : "Keep training!"}
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
