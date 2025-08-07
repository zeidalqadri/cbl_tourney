import MatchList from '@/components/MatchList'
import Image from 'next/image'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-cbl-charcoal via-gray-800 to-cbl-charcoal text-white p-4 shadow-xl">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                  <Image
                    src="/mss-logo.png"
                    alt="Majlis Sukan Sekolah Melaka"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
                <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center">
                  <Image
                    src="/cbl-logo.png"
                    alt="CBL Fastbreak"
                    width={44}
                    height={44}
                    className="object-contain"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-display tracking-wide gradient-text">
                  Majlis Sukan Sekolah Melaka Basketball 2025
                </h1>
                <p className="text-sm text-gray-300 font-medium tracking-wider">
                  U-12 • August 4-7, 2025 • Melaka
                </p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="font-display text-2xl text-mss-turquoise">107</div>
                <div className="text-gray-400">TEAMS</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl text-cbl-orange">129</div>
                <div className="text-gray-400">MATCHES</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              Welcome to MSS Melaka Basketball Tournament 2025
            </h2>
            <p className="text-gray-600 mb-6">
              The official tournament tracking system for U-12 Basketball Championship
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-gradient-to-br from-mss-turquoise/10 to-transparent p-6 rounded-lg">
                <div className="text-3xl font-bold text-mss-turquoise">107</div>
                <div className="text-gray-600 mt-2">Teams Participating</div>
              </div>
              <div className="bg-gradient-to-br from-cbl-orange/10 to-transparent p-6 rounded-lg">
                <div className="text-3xl font-bold text-cbl-orange">129</div>
                <div className="text-gray-600 mt-2">Total Matches</div>
              </div>
              <div className="bg-gradient-to-br from-score-burst/10 to-transparent p-6 rounded-lg">
                <div className="text-3xl font-bold text-score-burst">4</div>
                <div className="text-gray-600 mt-2">Days of Competition</div>
              </div>
            </div>
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Tournament Dates:</strong> August 4-7, 2025
              </p>
              <p className="text-sm text-gray-700 mt-2">
                <strong>Location:</strong> Melaka, Malaysia
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}