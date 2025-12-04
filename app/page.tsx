import Link from "next/link"
import { Button } from "@/components/ui/button"
import { TimeCapsuleLogo, CapsuleIcon, LockIcon, UsersIcon } from "@/components/icons"

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <TimeCapsuleLogo className="w-8 h-8 text-primary" />
          <span className="text-xl font-semibold text-foreground">TimeCapsule</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Connexion</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Inscription</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm">
            <LockIcon className="w-4 h-4" />
            <span>Messages verrouillés dans le temps</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance leading-tight">
            Envoyez des messages
            <br />
            <span className="text-primary">vers le futur</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
            Créez des capsules temporelles vidéo pour vous-même ou vos proches. Verrouillez vos souvenirs et
            redécouvrez-les quand le moment sera venu.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/auth/sign-up">Commencer gratuitement</Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent" asChild>
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CapsuleIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Capsules Vidéo</h3>
            <p className="text-muted-foreground text-sm">
              Enregistrez des messages vidéo jusqu'à 60 secondes avec localisation et musique.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <LockIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Verrouillage Temporel</h3>
            <p className="text-muted-foreground text-sm">
              Définissez une date de déverrouillage. Personne ne peut ouvrir avant.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <UsersIcon className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Partagez avec vos proches</h3>
            <p className="text-muted-foreground text-sm">
              Envoyez des capsules à vos amis pour des occasions spéciales.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border p-6 text-center text-muted-foreground text-sm">
        <p>TimeCapsule - Vos souvenirs, protégés par le temps.</p>
      </footer>
    </div>
  )
}
