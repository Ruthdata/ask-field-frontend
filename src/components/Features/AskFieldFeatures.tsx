import { ClipboardCheck, ShieldCheck } from "lucide-react";
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

function StepList({
  title,
  steps,
  icon: Icon,
}: {
  title: string;
  steps: StepContent[];
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 sm:p-7 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-2xl font-bold text-gray-950">{title}</h3>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-950 text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div>
              <h4 className="font-semibold text-gray-950">{step.title}</h4>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {step.copy}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AskFieldFeatures() {
  return (
    <section className="bg-white px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-14 text-center">
          <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
            Choose how you want to use joinStudy
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {journeys.map((journey) => {
            const Icon = journey.icon;

            return (
              <div
                key={journey.title}
                id={
                  journey.title === "For Researchers"
                    ? "for-researchers"
                    : "for-participants"
                }
                className="flex h-full flex-col rounded-3xl border border-gray-200 bg-[#FFF9E8] p-6 shadow-sm sm:p-8"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-500 shadow-sm">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-950">
                  {journey.title}
                </h3>
                <p className="mt-4 flex-1 text-base leading-relaxed text-gray-700">
                  {journey.copy}
                </p>
                <Link
                  to={journey.to}
                  className="mt-7 inline-flex w-fit items-center justify-center rounded-full bg-gray-950 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  {journey.button}
                </Link>
              </div>
            );
          })}
        </div>

        <div id="how-it-works" className="mt-20">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-950 sm:text-4xl">
              How joinStudy works
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <StepList
              title="For Researchers"
              steps={researcherSteps}
              icon={ClipboardCheck}
            />
            <StepList
              title="For Participants"
              steps={participantSteps}
              icon={ShieldCheck}
            />
          </div>
        </div>

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
              transparent, respectful, and inclusive. Researchers should clearly
              explain study purpose, eligibility, time commitment, compensation,
              and data use. Participants choose which studies to apply for and
              should understand what they are joining before they participate.
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
  );
}
