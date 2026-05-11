import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { useMemo, useState } from "react";

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

const PricingCalculator = () => {
  const [submissions, setSubmissions] = useState("10");
  const [rewardPerHour, setRewardPerHour] = useState("20");
  const [minutes, setMinutes] = useState("30");

  const totals = useMemo(() => {
    const submissionCount = Number(submissions) || 0;
    const hourlyReward = Number(rewardPerHour) || 0;
    const durationInHours = (Number(minutes) || 0) / 60;
    const participantReward = submissionCount * hourlyReward * durationInHours;
    const platformFees = participantReward * 0.3;

    return {
      participantReward,
      platformFees,
      total: participantReward + platformFees,
    };
  }, [minutes, rewardPerHour, submissions]);

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_195px]">
        <section className="rounded-xl border border-gray-100 bg-white p-5 sm:p-7 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-950">
            Pricing Calculator
          </h1>
          <p className="mt-4 text-sm text-gray-950">
            Use the calculator to estimate how much a study will cost to
            complete.
          </p>

          <div className="mt-6 rounded-xl border border-gray-100 p-4 sm:p-6">
            <label className="text-sm font-medium text-gray-950">
              Number of submissions
            </label>
            <input
              type="number"
              min="0"
              value={submissions}
              onChange={(event) => setSubmissions(event.target.value)}
              className="mt-3 w-full rounded-lg bg-gray-50 px-4 py-4 text-sm outline-none"
            />

            <label className="mt-5 block text-sm font-medium text-gray-950">
              Participant reward per hour
            </label>
            <div className="mt-3 flex overflow-hidden rounded-lg bg-gray-50">
              <span className="flex items-center px-4 text-xs text-gray-950">
                USD
              </span>
              <input
                type="number"
                min="0"
                value={rewardPerHour}
                onChange={(event) => setRewardPerHour(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none"
              />
              <span className="flex items-center px-4 text-sm text-gray-950">
                /hr
              </span>
            </div>

            <p className="mt-4 flex max-w-xl gap-2 text-xs leading-5 text-gray-400">
              <Info size={14} className="mt-0.5 shrink-0" />
              Hourly rate you want to pay participants for a submission. Hourly
              rates for Domain Experts and AI Taskers may be higher.
            </p>

            <label className="mt-4 block text-sm font-medium text-gray-950">
              Time per submission
            </label>
            <div className="mt-3 flex overflow-hidden rounded-lg bg-gray-50">
              <input
                type="number"
                min="0"
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
                className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none"
              />
              <span className="flex items-center px-4 text-sm text-gray-950">
                mins
              </span>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Participant Reward</span>
              <strong className="text-gray-950">
                {formatUsd(totals.participantReward)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Platform Fees</span>
              <strong className="text-gray-950">
                {formatUsd(totals.platformFees)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-500">Cost/Participants</span>
              <strong className="text-gray-950">
                {formatUsd(totals.total)}
              </strong>
            </div>
          </div>

          <p className="mt-10 text-[11px] text-gray-400">
            (VAT or sales tax may be applied)
          </p>

          <Link
            to="/dashboard/researcher/projects"
            className="mt-4 flex w-full items-center justify-center rounded-3xl border border-gray-900 px-4 py-3 text-sm text-gray-700"
          >
            Create a study
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default PricingCalculator;
