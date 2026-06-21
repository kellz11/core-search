import { CreateLaunchForm } from "@/components/CreateLaunchForm";

export default function CreatePage() {
  return (
    <section className="narrow">
      <p className="eyebrow">new launch</p>
      <h1>Create a SOL curve that graduates into CORE.</h1>
      <p className="muted">The token mint is created first with Metaplex metadata. The launch transaction mints the fixed supply into the curve vault and permanently revokes mint authority.</p>
      <CreateLaunchForm />
    </section>
  );
}
