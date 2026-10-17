import { LeadForm, PublicPage } from "@components/marketing/PublicPage";

export default function AiPilot() {
  return (
    <PublicPage
      label="For AI teams"
      title="Start an evaluation pilot."
      lede="Tell us what you want evaluated. We'll set up skill-tested native speakers, reviewer checks and agreement scoring, then send you a plan and quote within two working days."
    >
      <LeadForm
        type="ai-pilot"
        submitLabel="Request pilot"
        success={<><b>Thanks, we have your pilot request.</b> We&apos;ll email a plan and quote within two working days.</>}
        fields={[
          { name: "name", label: "Your name", required: true, maps: "name" },
          { name: "email", label: "Work email", type: "email", required: true, maps: "email" },
          { name: "org", label: "Organisation", required: true, maps: "organization" },
          { name: "task", label: "Task", type: "select", options: ["Pick the better reply", "Rate replies", "Correct and rewrite", "Not sure yet"] },
          { name: "languages", label: "Languages", required: true, placeholder: "For example: Yoruba, Hausa, Swahili", hint: "Live now: Yoruba, Igbo, Hausa, Nigerian Pidgin. Next: Twi, Swahili." },
          { name: "items", label: "Roughly how many items?", type: "select", options: ["200 items", "500 items", "1,000 items", "5,000+ items"] },
          { name: "goal", label: "What should evaluators look for?", type: "textarea", maps: "message", hint: "You can share full guidelines later.", placeholder: "For example: pick the reply a native speaker finds more accurate and natural; flag anything unsafe." },
        ]}
      />
    </PublicPage>
  );
}
