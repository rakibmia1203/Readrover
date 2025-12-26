import { Card, CardContent, Badge } from "@/components/ui";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/80 p-8 shadow-soft">
        <Badge tone="dark">Legal</Badge>
        <h1 className="mt-3 text-2xl font-semibold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600">Replace this text with your client’s final policy.</p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3 text-sm text-slate-700">
          <p>We collect information you provide during checkout and account creation (name, email, phone, address) to process orders and provide customer support.</p>
          <p>We do not sell personal data. Data may be shared with delivery partners solely for shipping.</p>
          <p>Contact support to request data deletion.</p>
        </CardContent>
      </Card>
    </div>
  );
}
