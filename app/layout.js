import './globals.css'

export const metadata = {
  title: 'Muscle Art Fitness - Smart Attendance System',
  description: 'QR-based gym attendance tracking system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}