import './globals.css'
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-jetbrains'
})

export const metadata = {
  title: 'MiniHack',
  description: 'Minimal focused development environment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="h-full">
      <body className={`${inter.variable} ${jetbrainsMono.variable} h-screen bg-black text-white font-mono overflow-hidden m-0 p-0`}>
        <div className="h-screen flex flex-col items-center relative">
          {children}
        </div>
      </body>
    </html>
  )
}
