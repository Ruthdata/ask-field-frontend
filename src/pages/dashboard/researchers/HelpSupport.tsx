import {
  BookOpen,
  ChevronRight,
  CircleQuestionMark,
  LifeBuoy,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";

const quickLinks = [
  "Creating and publishing a study",
  "Understanding participant screening",
  "Wallet funding and refunds",
  "AI Task Builder CSV setup",
];

const HelpSupport = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="max-w-6xl space-y-5">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-950">
                Help & Support
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                Find answers, read guides, or contact the AskField support team.
              </p>
            </div>

            <label className="flex w-full items-center gap-2 rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-500 lg:w-96">
              <Search size={16} />
              <input
                type="search"
                placeholder="Search help articles"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
              />
            </label>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <BookOpen size={20} className="text-gray-700" />
            <h2 className="mt-5 text-base font-semibold text-gray-950">
              Help Centre
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Browse step-by-step guides for studies, surveys, funding, and
              participants.
            </p>
            <button
              type="button"
              className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-gray-950"
            >
              View guides <ChevronRight size={15} />
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <MessageCircle size={20} className="text-gray-700" />
            <h2 className="mt-5 text-base font-semibold text-gray-950">
              Live Chat
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Chat with support for account, wallet, or launch questions during
              business hours.
            </p>
            <button
              type="button"
              className="mt-5 rounded-3xl bg-[#3E3E3E] px-5 py-2.5 text-sm text-white"
            >
              Start chat
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <Mail size={20} className="text-gray-700" />
            <h2 className="mt-5 text-base font-semibold text-gray-950">
              Email Support
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Send detailed requests and attachments to the team for follow-up.
            </p>
            <button
              type="button"
              className="mt-5 rounded-3xl border border-gray-300 px-5 py-2.5 text-sm text-gray-800"
            >
              Contact support
            </button>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-950">
              Popular articles
            </h2>

            <div className="mt-4 divide-y divide-gray-100">
              {quickLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  className="flex w-full items-center justify-between py-4 text-left text-sm text-gray-800"
                >
                  <span>{link}</span>
                  <ChevronRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
            <LifeBuoy size={20} className="text-gray-700" />
            <h2 className="mt-5 text-base font-semibold text-gray-950">
              Support ticket
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">
              Need help with a specific project? Create a ticket and include
              your project or survey name.
            </p>
            <label className="mt-5 block text-xs text-gray-700">
              Issue summary
              <input
                type="text"
                placeholder="What do you need help with?"
                className="mt-2 w-full rounded-lg bg-gray-50 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              />
            </label>
            <label className="mt-4 block text-xs text-gray-700">
              Details
              <textarea
                placeholder="Add context for support"
                className="mt-2 h-28 w-full resize-none rounded-lg bg-gray-50 px-4 py-3 text-sm outline-none placeholder:text-gray-400"
              />
            </label>
            <button
              type="button"
              className="mt-4 w-full rounded-3xl bg-[#3E3E3E] px-5 py-3 text-sm text-white"
            >
              Submit ticket
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-yellow-100 bg-yellow-50 p-5">
          <div className="flex items-start gap-3">
            <CircleQuestionMark size={18} className="mt-0.5 text-yellow-600" />
            <p className="text-sm leading-6 text-gray-700">
              Support responses are usually sent within one business day. Urgent
              wallet and launch issues are prioritised.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpSupport;
