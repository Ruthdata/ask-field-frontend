import { Archive, MailPlus, Search, Send, Star } from "lucide-react";
import { useState } from "react";

const conversations = [
  {
    id: "launch",
    title: "Study launch review",
    sender: "AskField Support",
    time: "10:24 AM",
    preview: "Your Mobile Banking UX Study is ready for a final launch check.",
    unread: true,
  },
  {
    id: "wallet",
    title: "Wallet funding update",
    sender: "Finance Team",
    time: "Yesterday",
    preview: "Your bank transfer invoice has been created successfully.",
    unread: false,
  },
  {
    id: "participants",
    title: "Participant quality note",
    sender: "Research Ops",
    time: "Apr 29",
    preview: "We flagged a response pattern you may want to review.",
    unread: false,
  },
];

const Messages = () => {
  const [activeId, setActiveId] = useState(conversations[0].id);
  const active = conversations.find((conversation) => conversation.id === activeId);

  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="max-w-7xl rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-950">Messages</h1>
            <p className="mt-3 text-sm text-gray-500">
              Keep track of support, finance, and project updates.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#3E3E3E] px-6 py-3 text-sm text-white"
          >
            <MailPlus size={16} />
            New message
          </button>
        </div>

        <div className="grid min-h-[620px] lg:grid-cols-[360px_1fr]">
          <aside className="border-b border-gray-100 p-4 lg:border-b-0 lg:border-r">
            <label className="flex items-center gap-2 rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-500">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search messages"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
              />
            </label>

            <div className="mt-4 space-y-2">
              {conversations.map((conversation) => {
                const isActive = conversation.id === activeId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setActiveId(conversation.id)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      isActive
                        ? "border-yellow-100 bg-yellow-50"
                        : "border-gray-100 bg-gray-50 hover:bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-950">
                          {conversation.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-gray-500">
                          {conversation.sender}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] text-gray-400">
                        {conversation.time}
                      </span>
                    </div>
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-gray-500">
                      {conversation.preview}
                    </p>
                    {conversation.unread && (
                      <span className="mt-3 inline-flex rounded-2xl bg-green-100 px-3 py-1 text-[11px] font-medium text-green-700">
                        New
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 p-5">
              <div>
                <h2 className="text-base font-semibold text-gray-950">
                  {active?.title}
                </h2>
                <p className="mt-1 text-xs text-gray-500">{active?.sender}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600"
                  aria-label="Star conversation"
                >
                  <Star size={16} />
                </button>
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-600"
                  aria-label="Archive conversation"
                >
                  <Archive size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-4 p-5">
              <div className="max-w-xl rounded-xl bg-gray-50 p-4">
                <p className="text-xs font-medium text-gray-500">
                  {active?.sender}
                </p>
                <p className="mt-3 text-sm leading-6 text-gray-800">
                  {active?.preview} Reply here if you need clarification or want
                  us to take another look.
                </p>
              </div>

              <div className="ml-auto max-w-xl rounded-xl bg-[#3E3E3E] p-4 text-white">
                <p className="text-xs font-medium text-white/70">You</p>
                <p className="mt-3 text-sm leading-6">
                  Thanks, I will review and get back to the team.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 p-4">
              <div className="flex items-end gap-3 rounded-xl bg-gray-50 p-3">
                <textarea
                  placeholder="Write a reply"
                  className="h-20 min-w-0 flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
                <button
                  type="button"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#3E3E3E] text-white"
                  aria-label="Send reply"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Messages;
