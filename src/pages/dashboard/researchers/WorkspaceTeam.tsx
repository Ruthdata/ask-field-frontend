import {
  Mail,
  MoreVertical,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

const teamMembers = [
  {
    name: "Maxwell Ninja",
    email: "maxwell@askfield.co",
    role: "Owner",
    status: "Active",
    initials: "MN",
  },
  {
    name: "Research Ops",
    email: "ops@askfield.co",
    role: "Admin",
    status: "Pending",
    initials: "RO",
  },
];

const WorkspaceTeam = () => {
  return (
    <div className="min-h-screen bg-gray-50 px-2 sm:px-3 lg:px-4 py-6">
      <div className="max-w-6xl space-y-5">
        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-950">
                Workspace Team
              </h1>
              <p className="mt-3 text-sm text-gray-500">
                Invite teammates, manage roles, and control who can launch or
                review studies.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-3xl bg-[#3E3E3E] px-6 py-3 text-sm text-white"
            >
              <Plus size={16} />
              Invite member
            </button>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Users size={18} className="text-gray-600" />
              <p className="mt-4 text-xs text-gray-500">Total members</p>
              <strong className="mt-2 block text-2xl font-semibold text-gray-950">
                2
              </strong>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <ShieldCheck size={18} className="text-gray-600" />
              <p className="mt-4 text-xs text-gray-500">Admins</p>
              <strong className="mt-2 block text-2xl font-semibold text-gray-950">
                1
              </strong>
            </div>
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
              <Mail size={18} className="text-gray-600" />
              <p className="mt-4 text-xs text-gray-500">Pending invites</p>
              <strong className="mt-2 block text-2xl font-semibold text-gray-950">
                1
              </strong>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-gray-950">
              Team members
            </h2>
            <label className="flex w-full items-center gap-2 rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-500 sm:w-72">
              <Search size={15} />
              <input
                type="search"
                placeholder="Search members"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
              />
            </label>
          </div>

          <div className="mt-5 overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-3 rounded-xl bg-gray-100 px-4 py-3 text-xs font-medium text-gray-500">
                <span>Member</span>
                <span>Role</span>
                <span>Status</span>
                <span />
              </div>

              <div className="mt-2 space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.email}
                    className="grid grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                        {member.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-950">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">{member.role}</span>
                    <span
                      className={`w-fit rounded-2xl px-3 py-1 text-xs font-medium ${
                        member.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-50 text-yellow-600"
                      }`}
                    >
                      {member.status}
                    </span>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-white"
                      aria-label={`Open actions for ${member.name}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WorkspaceTeam;
