import { LeadForm, PublicPage } from "@components/marketing/PublicPage";

export default function FoundingLabs() {
  return (
    <PublicPage
      label="Founding labs"
      title="Help shape joinStudy from day one."
      lede="The first research teams get priority recruiting, founding pricing and a direct line to us while we build. In return, we ask for honest feedback after your first study."
    >
      <LeadForm
        type="founding-lab"
        submitLabel="Apply as a founding lab"
        success={<><b>Thanks, your application is in.</b> We&apos;ll reply within two working days to plan your first study.</>}
        fields={[
          { name: "name", label: "Your name", required: true, maps: "name" },
          { name: "email", label: "Work email", type: "email", required: true, maps: "email" },
          { name: "org", label: "Lab or organisation", required: true, maps: "organization" },
          { name: "method", label: "What do you want to run first?", type: "select", options: ["Survey", "Interviews", "Focus groups", "Product test", "AI evaluation"] },
          { name: "who", label: "Who do you need to reach?", type: "textarea", required: true, maps: "message", placeholder: "For example: 300 adults in Lagos and Kano who use mobile money" },
          { name: "when", label: "When do you want to start?", type: "select", options: ["This month", "Next 3 months", "Later this year", "Just exploring"] },
        ]}
      />
    </PublicPage>
  );
}
