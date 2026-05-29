import { useState } from "react";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  globalReachCards,
  journeys,
  participantSteps,
  researcherSteps,
  trustCards,
} from "./homeFeatureContent";
import type { StepContent } from "./homeFeatureContent";

function InfoCard({
  title,
  copy,
  icon: Icon,
}: {
  title: string;
  copy: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
      <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
        <Icon className="h-5 w-5" />
      </span>
      <h3 className="text-xl font-bold text-gray-950">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">{copy}</p>
    </div>
  );
}

function StepList({ steps }: { steps: StepContent[] }) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {steps.map((step, index) => (
        <div
          key={step.title}
          className="grid grid-cols-[48px_1fr] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:grid-cols-[64px_1fr]"
        >
          <span className="flex items-center justify-center bg-amber-100 text-base font-bold text-gray-950">
            {index + 1}.
          </span>
          <div className="px-4 py-3 sm:px-5">
            <h4 className="text-sm font-bold text-gray-800 sm:text-base">
              {step.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-gray-700 sm:text-sm">
              {step.copy}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function JourneyShowcase() {
  return (
    <div className="bg-[#3E3E3E] px-4 py-14 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold leading-tight text-white sm:text-4xl">
          What Some Of Our Customers Say About Our Services
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          {journeys.map((journey) => (
            <article
              key={journey.title}
              id={
                journey.title === "For Researchers"
                  ? "for-researchers"
                  : "for-participants"
              }
              className="overflow-hidden rounded-3xl bg-[#FFF3CF] shadow-sm"
            >
              <img
                src={journey.image}
                alt=""
                className="h-52 w-full object-cover"
                loading="lazy"
              />
              <div className="p-5 sm:p-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {journey.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-gray-900">
                  {journey.copy}
                </p>
                <Link
                  to={journey.to}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#E8DFC2] px-6 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-[#ded2ad]"
                >
                  {journey.button}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProcessToggle() {
  const [active, setActive] = useState<"researchers" | "participants">(
    "researchers",
  );
  const steps = active === "researchers" ? researcherSteps : participantSteps;

  return (
    <div id="how-it-works" className="bg-gray-50 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
            How JoinStudy works
          </h2>
          <div className="mx-auto mt-7 grid max-w-xs grid-cols-2 rounded-full bg-white p-1 shadow-sm">
            {[
              ["researchers", "For researchers"],
              ["participants", "For Participants"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setActive(value as "researchers" | "participants")
                }
                className={`rounded-full px-4 py-2 text-xs transition-colors ${
                  active === value
                    ? "bg-gray-200 text-gray-900"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <StepList steps={steps} />
      </div>
    </div>
  );
}

export default function AskFieldFeatures() {
  return (
    <>
      <JourneyShowcase />
      <ProcessToggle />

      <section className="bg-white px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mt-20 rounded-4xl bg-[#FFF9E8] px-5 py-12 sm:px-8 lg:px-10">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
                Global recruitment, stronger access to underrepresented
                communities
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                joinStudy supports global participant recruitment while helping
                researchers reach communities often underrepresented in
                traditional research panels - including participants across
                Africa, Asia, Latin America, diaspora communities, and other
                global contexts.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {globalReachCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          </div>

          <div id="trust-ethics" className="mt-20">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
                Trust, consent, and fair participation
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                joinStudy is designed to make research participation more
                transparent, respectful, and inclusive. Researchers should
                clearly explain study purpose, eligibility, time commitment,
                compensation, and data use. Participants choose which studies to
                apply for and should understand what they are joining before
                they participate.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {trustCards.map((card) => (
                <InfoCard key={card.title} {...card} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
