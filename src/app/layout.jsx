import './globals.css'
import Providers from './providers'

export const metadata = {
  title: 'SaraWorld — Where Elegance meets Creativity',
  description: 'Handcrafted jewelry — Studs, Ear Rings & Hair Ornaments',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
