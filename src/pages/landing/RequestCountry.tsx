import { LeadForm, PublicPage } from "@components/marketing/PublicPage";

export default function RequestCountry() {
  return (
    <PublicPage
      label="Request a country"
      title="Need participants somewhere new?"
      lede="Anyone can join from anywhere, but we open local recruiting and payouts country by country. Tell us where you need people and we'll use your request to decide what opens next."
    >
      <LeadForm
        type="request-country"
        submitLabel="Send request"
        success={<><b>Request received.</b> We&apos;ll email you when local recruiting opens there, or sooner if we can run your study by hand.</>}
        fields={[
          { name: "country", label: "Country", required: true, maps: "country", placeholder: "For example: Ethiopia" },
          { name: "who", label: "Who do you need there?", type: "textarea", maps: "message", placeholder: "Age, language, region, occupation…" },
          { name: "size", label: "Roughly how many people?", type: "select", options: ["Under 50", "50 to 300", "300 to 1,000", "More than 1,000"] },
          { name: "email", label: "Your email", type: "email", required: true, maps: "email" },
        ]}
      />
    </PublicPage>
  );
}
