import {
  Check,
  ChevronDown,
  Copy,
  Info,
  X,
} from "lucide-react";
import { useState } from "react";

type FundingMethod = "instant" | "bank";
type WalletModalStep = "select" | "instant" | "bankForm" | "bankDetails";

type WalletModalsProps = {
  step: WalletModalStep | null;
  setStep: (step: WalletModalStep | null) => void;
};

const TextInput = ({
  label,
  placeholder,
  value,
  required = true,
  className = "",
}: {
  label: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  className?: string;
}) => (
  <label className={`block text-xs text-gray-950 ${className}`}>
    {label}
    {required && <span className="text-red-500">*</span>}
    <input
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      className="mt-2 w-full rounded-lg bg-gray-50 px-4 py-3 text-xs outline-none placeholder:text-gray-400"
    />
  </label>
);

const AmountInput = () => (
  <div>
    <label className="text-xs text-gray-950">Amount</label>
    <div className="mt-2 flex overflow-hidden rounded-lg bg-gray-50">
      <span className="flex items-center px-4 text-[11px] text-gray-950">
        NGN
      </span>
      <input
        type="number"
        placeholder="Enter amount"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-xs outline-none placeholder:text-gray-400"
      />
    </div>
    <p className="mt-2 flex items-center gap-1 text-[11px] text-gray-400">
      <Info size={13} />
      You must add at least NGN 5000.00
    </p>
  </div>
);

const ModalShell = ({
  children,
  wide = false,
  onClose,
}: {
  children: React.ReactNode;
  wide?: boolean;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 py-8 backdrop-blur-[1px]">
    <div
      className={`relative max-h-[calc(100vh-5rem)] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl ${
        wide ? "w-full max-w-3xl" : "w-full max-w-4xl"
      }`}
    >
      {children}
    </div>
    <button
      type="button"
      onClick={onClose}
      className="fixed bottom-10 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white text-white"
      aria-label="Close modal"
    >
      <X size={18} />
    </button>
  </div>
);

const AddFundsModal = ({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: (method: FundingMethod) => void;
}) => {
  const [method, setMethod] = useState<FundingMethod>("instant");

  return (
    <ModalShell onClose={onClose}>
      <h2 className="text-3xl font-bold text-gray-950">Add Funds</h2>
      <p className="mt-4 text-xs text-gray-950">
        Select your preferred method for adding funds to your wallet.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {[
          {
            key: "instant" as const,
            title: "Instant Pay (Debit or Credit Card)",
            body: "Funds are credited to your wallet immediately.",
          },
          {
            key: "bank" as const,
            title: "Bank Transfer (Up to 7 Days)",
            body: "Funds will be added once the transfer is confirmed (may take up to 7 days).",
          },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setMethod(option.key)}
            className="min-h-28 rounded-xl border border-gray-100 bg-gray-50 p-4 text-left"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                method === option.key
                  ? "border-gray-900 bg-gray-900"
                  : "border-gray-300 bg-white"
              }`}
            >
              {method === option.key && <Check size={10} className="text-white" />}
            </span>
            <h3 className="mt-4 pl-8 text-sm font-semibold text-gray-950">
              {option.title}
            </h3>
            <p className="mt-3 pl-8 text-xs leading-5 text-gray-950">
              {option.body}
            </p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onContinue(method)}
        className="mt-5 w-full rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white md:w-[380px]"
      >
        Continue to Funding
      </button>
    </ModalShell>
  );
};

const InstantPayModal = ({ onClose }: { onClose: () => void }) => (
  <ModalShell onClose={onClose} wide>
    <h2 className="text-3xl font-bold text-gray-950">Instant Pay</h2>

    <section className="mt-4 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Card Details</h3>
      <div className="mt-3 border-t border-gray-100 pt-3">
        <TextInput label="Card Number" placeholder="Enter card number" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextInput label="Expiration Date" placeholder="Enter expiration date" />
          <TextInput label="CVV" />
        </div>
      </div>
    </section>

    <section className="mt-3 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Billing Address</h3>
      <div className="mt-3 grid gap-4 border-t border-gray-100 pt-3 sm:grid-cols-2">
        <TextInput label="First Name" value="Ugochukwu" />
        <TextInput label="Last Name" value="Ekemzie" />
      </div>
      <TextInput
        label="Organisation (optional)"
        value="AskField Corporation"
        className="mt-4"
      />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <TextInput label="Line 1" placeholder="Enter valid mobile number" />
        <TextInput
          label="Line 2 (Optional)"
          placeholder="Enter valid mobile number"
        />
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <TextInput label="City" placeholder="Enter city of residence" />
        <label className="block text-xs text-gray-950">
          Country<span className="text-red-500">*</span>
          <button
            type="button"
            className="mt-2 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-xs"
          >
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 rounded-full bg-green-600" />
              Nigeria
            </span>
            <ChevronDown size={14} />
          </button>
        </label>
        <TextInput label="Postal Code" placeholder="Enter postal code" />
      </div>
      <label className="mt-4 flex gap-3 text-[11px] leading-4 text-gray-950">
        <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300" />
        Your card and billing details are securely stored with our payment
        provider. We cannot access or view card information.
      </label>
    </section>

    <section className="mt-3 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Amount</h3>
      <p className="mt-3 max-w-xl text-xs leading-5 text-gray-950">
        Check that you have the required amount for your study. You can request a
        refund for any amount you don&apos;t use. Learn about our refund policy.
      </p>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <AmountInput />
      </div>
    </section>

    <button
      type="button"
      className="mt-4 w-full rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white sm:w-[380px]"
    >
      Confirm payment
    </button>
  </ModalShell>
);

const BankTransferFormModal = ({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) => (
  <ModalShell onClose={onClose} wide>
    <h2 className="text-3xl font-bold text-gray-950">Bank Transfer</h2>

    <section className="mt-4 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Amount</h3>
      <p className="mt-3 max-w-xl text-xs leading-5 text-gray-950">
        Check that you have the required amount for your study. You can request a
        refund for any amount you don&apos;t use. Learn about our refund policy.
      </p>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <AmountInput />
      </div>
    </section>

    <section className="mt-3 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">
        Approval Reference (Optional)
      </h3>
      <p className="mt-3 text-xs leading-5 text-gray-950">
        Some organizations require approval before requesting an invoice.
        Approvals are typically known as purchase orders or POs, but may have
        another name.
      </p>
      <input
        type="text"
        className="mt-4 w-full rounded-lg bg-gray-50 px-4 py-4 text-xs outline-none"
      />
    </section>

    <button
      type="button"
      onClick={onConfirm}
      className="mt-5 w-full rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white sm:w-[380px]"
    >
      Confirm payment
    </button>
  </ModalShell>
);

const CopyValue = ({ value }: { value: string }) => (
  <button
    type="button"
    onClick={() => navigator.clipboard?.writeText(value)}
    className="inline-flex items-center gap-2 text-xs text-gray-950 underline"
  >
    Copy <Copy size={14} />
  </button>
);

const Detail = ({
  label,
  value,
  copy = false,
}: {
  label: string;
  value: string;
  copy?: boolean;
}) => (
  <div>
    <p className="text-xs text-gray-950">{label}</p>
    <div className="mt-3 flex items-center gap-4">
      <strong className="text-[11px] text-gray-950">{value}</strong>
      {copy && <CopyValue value={value} />}
    </div>
  </div>
);

const BankDetailsModal = ({ onClose }: { onClose: () => void }) => (
  <ModalShell onClose={onClose} wide>
    <h2 className="text-3xl font-bold text-gray-950">Bank Transfer</h2>

    <section className="mt-4 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Payment Details</h3>
      <div className="mt-4 grid gap-5 border-t border-gray-100 pt-4 sm:grid-cols-2">
        <Detail label="Account Number" value="9079810777" copy />
        <Detail label="Account Name" value="EMMANUEL UMOREN UDEMEOBONG" />
        <Detail label="Bank Name" value="OPAY DIGITAL SERVICES" />
        <Detail
          label="Address"
          value="NO. 23D ODUAH ESTATE, IKEJA, LAGOS STATE, NIG."
        />
        <Detail label="IBAN" value="GB27LOYD30198314203060" copy />
        <Detail label="Swift Code" value="LOYDGB21576" copy />
        <Detail label="Amount" value="NGN 50,000" />
      </div>
    </section>

    <section className="mt-3 rounded-xl border border-gray-100 p-4">
      <h3 className="text-sm font-medium text-gray-950">Next Steps</h3>
      <p className="mt-3 text-xs leading-5 text-gray-950">
        We have emailed you an invoice to{" "}
        <strong>umorenemmanuel4@gmail.com</strong>. You can now begin the
        transfer from your bank. Please allow up to seven days for your transfer
        to be received by Prolific. We will email you as soon as we receive your
        money.
      </p>
    </section>

    <button
      type="button"
      onClick={onClose}
      className="mt-4 w-full rounded-3xl bg-[#3E3E3E] px-6 py-3 text-xs text-white sm:w-[380px]"
    >
      Confirm payment
    </button>
  </ModalShell>
);

const WalletModals = ({ step, setStep }: WalletModalsProps) => {
  if (!step) return null;

  if (step === "select") {
    return (
      <AddFundsModal
        onClose={() => setStep(null)}
        onContinue={(method) =>
          setStep(method === "instant" ? "instant" : "bankForm")
        }
      />
    );
  }

  if (step === "instant") {
    return <InstantPayModal onClose={() => setStep(null)} />;
  }

  if (step === "bankForm") {
    return (
      <BankTransferFormModal
        onClose={() => setStep(null)}
        onConfirm={() => setStep("bankDetails")}
      />
    );
  }

  return <BankDetailsModal onClose={() => setStep(null)} />;
};

export type { WalletModalStep };
export default WalletModals;
