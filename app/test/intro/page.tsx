"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronRight, Gamepad2 } from "lucide-react"

export default function TestIntro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const startTest = () => {
    setLoading(true)
    setTimeout(() => {
      router.push("/test/reaction")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 p-4">
      <Card className="max-w-lg w-full bg-black/40 backdrop-blur-md border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-white">Get Ready to Test Your Skills</CardTitle>
          <CardDescription className="text-center text-purple-200">
            You'll complete 5 quick tests to measure your gaming abilities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-purple-200">
              <span>Progress</span>
              <span>0/5 Tests</span>
            </div>
            <Progress value={0} className="h-2 bg-purple-950" />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-900/30">
              <div className="bg-purple-600 p-2 rounded-full">
                <Gamepad2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white">Test Order:</h3>
                <p className="text-sm text-purple-200">Reaction → Target → Memory → Tracking → Multi-tasking</p>
              </div>
            </div>

            <div className="text-sm text-purple-200 space-y-2">
              <p>Each test takes about 30 seconds to complete.</p>
              <p>For the most accurate results, play in a quiet environment with minimal distractions.</p>
              <p>Ready your mouse and keyboard - you'll need quick reflexes!</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={startTest}
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            {loading ? (
              <span className="flex items-center">
                Loading<span className="animate-pulse">...</span>
              </span>
            ) : (
              <span className="flex items-center">
                Begin First Test <ChevronRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
