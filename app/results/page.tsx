"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Trophy, Zap, Brain, MousePointer, Timer, Layers, Share2, RotateCcw } from "lucide-react"

type GameScores = {
  reaction?: number
  target?: number
  memory?: number
  tracking?: number
  multitask?: number
}

type SkillRating = {
  name: string
  score: number
  rawScore: number | string
  icon: React.ReactNode
  color: string
}

export default function Results() {
  const [scores, setScores] = useState<GameScores | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [gamerRank, setGamerRank] = useState("")
  const [skillRatings, setSkillRatings] = useState<SkillRating[]>([])

  useEffect(() => {
    // Load scores from localStorage
    const savedScores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    console.log("Loaded scores from localStorage:", savedScores)

    setScores(savedScores)

    // Calculate normalized scores (0-100) with correct maximum values
    const normalizedScores = {
      // Reaction time: 200ms = 100%, 600ms = 0% (lower is better)
      reaction: savedScores.reaction
        ? Math.max(0, Math.min(100, Math.round(100 - ((savedScores.reaction - 200) / 400) * 100)))
        : 0,

      // Target precision: 50 targets = 100% (higher is better)
      target: savedScores.target ? Math.min(100, Math.round((savedScores.target / 50) * 100)) : 0,

      // Memory: 25 points = 100% (higher is better)
      memory: savedScores.memory ? Math.min(100, Math.round((savedScores.memory / 25) * 100)) : 0,

      // Visual tracking: Already 0-100% accuracy
      tracking: savedScores.tracking ? Math.round(savedScores.tracking) : 0,

      // Multi-tasking: 1000 points = 100% (higher is better)
      multitask: savedScores.multitask ? Math.min(100, Math.round((savedScores.multitask / 1000) * 100)) : 0,
    }

    console.log("Raw scores:", savedScores)
    console.log("Normalized scores:", normalizedScores)

    // Calculate total score (average of completed tests only)
    const completedScores = Object.values(normalizedScores).filter((score) => score > 0)
    const total =
      completedScores.length > 0 ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length) : 0

    setTotalScore(total)

    // Determine gamer rank
    if (total >= 90) setGamerRank("Ultra Instinct")
    else if (total >= 80) setGamerRank("Legendary Gamer")
    else if (total >= 70) setGamerRank("Pro Gamer")
    else if (total >= 60) setGamerRank("Skilled Player")
    else if (total >= 50) setGamerRank("Average Gamer")
    else if (total >= 40) setGamerRank("Casual Player")
    else if (total >= 30) setGamerRank("Novice")
    else setGamerRank("Button Masher")

    // Create skill ratings
    setSkillRatings([
      {
        name: "Reaction Time",
        score: normalizedScores.reaction,
        rawScore: savedScores.reaction ? `${savedScores.reaction}ms` : "Not completed",
        icon: <Timer className="h-5 w-5" />,
        color: "from-red-500 to-orange-500",
      },
      {
        name: "Target Precision",
        score: normalizedScores.target,
        rawScore: savedScores.target !== undefined ? `${savedScores.target} targets` : "Not completed",
        icon: <Zap className="h-5 w-5" />,
        color: "from-yellow-500 to-amber-500",
      },
      {
        name: "Memory",
        score: normalizedScores.memory,
        rawScore: savedScores.memory !== undefined ? `${savedScores.memory} points` : "Not completed",
        icon: <Brain className="h-5 w-5" />,
        color: "from-green-500 to-emerald-500",
      },
      {
        name: "Visual Tracking",
        score: normalizedScores.tracking,
        rawScore: savedScores.tracking !== undefined ? `${savedScores.tracking}% accuracy` : "Not completed",
        icon: <MousePointer className="h-5 w-5" />,
        color: "from-blue-500 to-cyan-500",
      },
      {
        name: "Multi-tasking",
        score: normalizedScores.multitask,
        rawScore: savedScores.multitask !== undefined ? `${savedScores.multitask} points` : "Not completed",
        icon: <Layers className="h-5 w-5" />,
        color: "from-purple-500 to-violet-500",
      },
    ])
  }, [])

  const shareResults = () => {
    const text = `I just scored ${totalScore}/100 on the Gaming Potential Test! My rank: ${gamerRank}. Test your gaming skills too!`

    if (navigator.share) {
      navigator.share({
        title: "My Gaming Potential Score",
        text: text,
        url: window.location.href,
      })
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard
        .writeText(text)
        .then(() => {
          alert("Results copied to clipboard!")
        })
        .catch((err) => {
          console.error("Failed to copy: ", err)
        })
    }
  }

  const resetTests = () => {
    localStorage.removeItem("gameScores")
    window.location.href = "/"
  }

  const debugScores = () => {
    const savedScores = JSON.parse(localStorage.getItem("gameScores") || "{}")
    console.log("=== DEBUG SCORES ===")
    console.log("Raw localStorage:", localStorage.getItem("gameScores"))
    console.log("Parsed scores:", savedScores)
    alert(
      `Debug Info:\nReaction: ${savedScores.reaction}\nTarget: ${savedScores.target}\nMemory: ${savedScores.memory}\nTracking: ${savedScores.tracking}\nMultitask: ${savedScores.multitask}`,
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-2xl w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl text-center text-white">Your Gaming Potential</CardTitle>
          <CardDescription className="text-center text-purple-200">
            Here's how your gaming skills measure up
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
              <span className="text-4xl font-bold text-white">{totalScore}</span>
            </div>
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400">
              {gamerRank}
            </h3>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Skill Breakdown</h3>

            {skillRatings.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`bg-gradient-to-r ${skill.color} p-1.5 rounded-full`}>{skill.icon}</div>
                    <span className="text-white">{skill.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-white font-medium">{Math.round(skill.score)}/100</span>
                    <div className="text-xs text-purple-300">{skill.rawScore}</div>
                  </div>
                </div>
                <Progress value={skill.score} className="h-2 bg-slate-700" />
              </div>
            ))}
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">Score Ranges (Perfect Scores)</h3>
            <div className="text-xs text-purple-200 space-y-1">
              <p>• Reaction Time: 200ms or faster = 100%</p>
              <p>• Target Precision: 50 targets = 100%</p>
              <p>• Memory: 25 points = 100%</p>
              <p>• Visual Tracking: 100% accuracy = 100%</p>
              <p>• Multi-tasking: 1000 points = 100%</p>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-white mb-2">What Your Score Means</h3>
            <p className="text-sm text-purple-200">
              {totalScore >= 80
                ? "You have exceptional gaming potential! Your reflexes, precision, and cognitive abilities are top-tier. You could excel at competitive gaming with practice."
                : totalScore >= 60
                  ? "You have solid gaming potential with good reflexes and coordination. With practice, you could become quite skilled at most game genres."
                  : totalScore >= 40
                    ? "You have average gaming potential. You might excel in certain game genres that match your stronger skills, like strategy or puzzle games."
                    : "You have developing gaming potential. Focus on games that emphasize your stronger skills, and practice to improve your weaker areas."}
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={shareResults}
              className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Results
            </Button>
            <Button
              onClick={resetTests}
              variant="outline"
              className="flex-1 border-purple-500 text-purple-300 hover:bg-purple-500/20"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Test Again
            </Button>
          </div>

          {/* Debug button - remove this in production */}
          <div className="text-center">
            <Button onClick={debugScores} variant="outline" size="sm" className="text-xs border-gray-500 text-gray-400">
              Debug Scores
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
