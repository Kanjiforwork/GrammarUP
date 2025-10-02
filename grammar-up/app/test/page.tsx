import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function Page() {
  return (
    <main className="min-h-dvh grid place-items-center p-8">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Hello shadcn + Tailwind v4</h1>
        <Button>Click me</Button>
      </Card>
    </main>
  )
}
