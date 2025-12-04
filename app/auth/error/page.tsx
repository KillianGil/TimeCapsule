import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { TimeCapsuleLogo } from "@/components/icons"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <TimeCapsuleLogo className="w-10 h-10 text-primary" />
        <span className="text-2xl font-bold text-foreground">TimeCapsule</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-destructive">Erreur d'authentification</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {params?.error ? `Code d'erreur: ${params.error}` : "Une erreur inattendue s'est produite."}
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
