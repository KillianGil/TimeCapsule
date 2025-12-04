import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { TimeCapsuleLogo } from "@/components/icons"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <TimeCapsuleLogo className="w-10 h-10 text-primary" />
        <span className="text-2xl font-bold text-foreground">TimeCapsule</span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Inscription réussie !</CardTitle>
          <CardDescription>Vérifiez votre boîte mail</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <TimeCapsuleLogo className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground">
            Un email de confirmation a été envoyé à votre adresse. Cliquez sur le lien pour activer votre compte et
            commencer à créer vos capsules temporelles.
          </p>
          <Button variant="outline" asChild className="w-full bg-transparent">
            <Link href="/auth/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
