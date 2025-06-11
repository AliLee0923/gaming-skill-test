import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-violet-800 to-indigo-900 text-white p-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 animate-pulse">
            Test Your Gaming Power!
          </h1>
          <p className="text-xl md:text-2xl text-purple-200">
            Discover your true gaming potential with our scientifically* designed tests
          </p>
          <p className="text-sm text-purple-300 italic">*not actually scientific</p>
        </div>

        <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Test Your Gaming Skills:</h2>
          <ul className="space-y-2 text-left list-disc list-inside mb-6">
            <li>Reaction Time - How fast can you respond?</li>
            <li>Target Precision - Click with deadly accuracy</li>
            <li>Memory Mastery - Remember complex patterns</li>
            <li>Visual Tracking - Follow the unpredictable</li>
            <li>Multi-tasking - Handle multiple challenges at once</li>
          </ul>
          <p className="mb-6">Complete all tests to receive your Gaming Potential Score!</p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link href="/test/intro" className="w-full max-w-xs">
            <Button
              size="lg"
              className="w-full text-lg h-16 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
            >
              <Trophy className="mr-2 h-6 w-6" />
              Start Testing
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
