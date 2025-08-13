'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Bir şeyler yanlış gitti!</h2>
            <p className="text-muted-foreground">Beklenmeyen bir hata oluştu.</p>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => reset()}
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}