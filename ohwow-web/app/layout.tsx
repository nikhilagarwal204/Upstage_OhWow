import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Head from "next/head"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Oh Wow - Discover 1 million national landmarks and local gems in America",
  description: "'Oh Wow' is an interactive travel app that engages the explorer in you with stories and facts to help you discover the world (and your home) at your own pace, no matter where you go.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Head>
        {/* Meta Tags for Facebook & Google Analytics */}
        <meta name="facebook-domain-verification" content="9ian7lmyvkjixzajhxcjk6msirnbul" />
        <meta name="google-site-verification" content="s7ZvUEL4_8rPlEURAkQfQx_RRVZ_JvYm6YUzIi8lLMA" />
        {/* Meta Keywords Tag */}
        <meta
          name="keywords"
          content="genai, travel, world, adventure, stories, tourist, tourism, explore, explorer, discovery, discover, facts, history, culture, geography, geology, nature, science, technology, education, learning, fun, interactive, interactive learning, interactive education, interactive fun, interactive travel, interactive tourism, interactive tourist, interactive explorer, interactive discovery, interactive discover, interactive facts, interactive history, interactive culture, interactive geography, interactive geology, interactive nature, interactive science, interactive technology, interactive learning, interactive education, interactive fun, interactive travel, interactive tourism, interactive tourist, interactive explorer, interactive discovery, interactive discover, interactive facts, interactive history, interactive culture, interactive geography, interactive geology, interactive nature, interactive science, interactive technology"
        />
        {/* Canonical Tag */}
        <link rel="canonical" href="https://www.ohwowapp.com/" />
        {/* Viewport & Other Important Meta Tag */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="content-language" content="en-us" />
        <meta httpEquiv="content-type" content="text/html;charset=UTF-8" />
        <meta name="revisit-after" content="7 days" />
        {/* Open Graph Tags */}
        <meta property="og:locale" content="en_US" />
        <meta property="og:title" content="Oh Wow - Discover 1 million national landmarks and local gems in America" />
        <meta
          property="og:description"
          content="'Oh Wow' is an interactive travel app that engages the explorer in you with stories and facts to help you discover the world (and your home) at your own pace, no matter where you go."
        />
        <meta property="og:url" content="https://www.ohwowapp.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Explore the World with Your Ears, Hands-Free" />
        {/* Robots Meta Tag */}
        <meta name="robots" content="index, follow" />
        {/* Geo Tags */}
        <meta name="geo.position" content="36.77;-119.41" />
        <meta name="geo.placename" content="United States" />
      </Head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
