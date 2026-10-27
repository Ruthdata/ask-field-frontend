import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

/** Stripe's card form (Payment Element). Used to launch a study (Stage 5) and to add places (Stage 6). */
export function StripeCard({ publishableKey, clientSecret, amountLabel, returnUrl }: { publishableKey: string; clientSecret: string; amountLabel: string; returnUrl: string }) {
  const [stripePromise] = useState(() => loadStripe(publishableKey));
  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe", variables: { colorPrimary: "#120e22", borderRadius: "12px" } } }}>
      <StripeForm amountLabel={amountLabel} returnUrl={returnUrl} />
    </Elements>
  );
}
function StripeForm({ amountLabel, returnUrl }: { amountLabel: string; returnUrl: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState("");
  const submit = async () => {
    if (!stripe || !elements) return;
    setBusy(true);
    setProblem("");
    const { error } = await stripe.confirmPayment({ elements, confirmParams: { return_url: returnUrl } });
    if (error) setProblem(error.message || "The card was declined.");
    setBusy(false);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <PaymentElement />
      <span className="jp-hint">Card details go straight to the payment provider. joinStudy never sees or stores them.</span>
      {problem && <div className="jp-note bad" role="alert">{problem}</div>}
      <div className="jp-actions"><button type="button" className="jp-btn" onClick={submit} disabled={!stripe || busy}>{busy ? "Paying…" : `Pay ${amountLabel}`}</button></div>
    </div>
  );
}
