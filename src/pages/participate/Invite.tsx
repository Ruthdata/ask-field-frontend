import "@/styles/referral.css";
import CopyLink from "@/components/referral/CopyLink";
import { useGetParticipantReferralsQuery } from "@/redux/api/referralApi";
import { inviteMessage, whatsappShare } from "@/lib/referral";
import { formatMoney } from "@/lib/study";
import { DISPLAY } from "./studies/studyText";

const STATUS_WORD = { joined: "Signed up", qualified: "Verified", "not-eligible": "Not eligible" } as const;
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

/** Refer a friend (participants): your link, your place in the queue, the Trusted member badge, who joined. */
export default function Invite() {
  const { data, isLoading, isError, refetch } = useGetParticipantReferralsQuery(undefined, { refetchOnMountOrArgChange: 30 });
  const r = data?.data;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 text-[#120e22]">
      <h1 style={DISPLAY} className="m-0 text-[30px] font-bold leading-none tracking-tight">Invite friends</h1>
      {isLoading && <div className="h-60 animate-pulse rounded-[20px] bg-gray-100" aria-busy="true" aria-label="Loading" />}
      {isError && (
        <div role="alert" className="rounded-2xl bg-orange-50 px-4 py-3 text-orange-900">
          We couldn't load your invites. <button type="button" className="font-semibold underline" onClick={() => refetch()}>Try again</button>
        </div>
      )}
      {r && !r.on && <p className="m-0 text-[15px] text-[#4b4664]">Invites are paused right now. Check back soon.</p>}
      {r && r.on && (
        <>
          <p className="m-0 text-[15px] leading-normal text-[#4b4664]">
            Share your link with friends in {r.waitlist.status === "waiting" ? r.waitlist.country : "your country"}.{" "}
            {r.waitlist.status === "waiting" ? "Every friend who joins moves you up the waitlist, and more when they get verified." : "When a friend you invited gets verified, you become a Trusted member."}
            {r.reward && ` You also get ${formatMoney(r.reward.amount, r.currency)} when a friend finishes ${r.reward.afterStudies} approved studies.`}
          </p>

          {r.waitlist.status === "waiting" && (
            <section aria-label="Your place in the queue" className="flex flex-col gap-1 rounded-[20px] bg-[#120e22] p-[18px] text-white">
              <span className="font-mono text-[12px] text-[#f0c93a]">Waitlist · {r.waitlist.country}</span>
              <b style={DISPLAY} className="text-[34px] leading-none tracking-tight">#{r.waitlist.position}</b>
              <span className="text-[14px] text-[#bdb6de]">of {r.waitlist.total} waiting. We'll email you when there's room.</span>
            </section>
          )}

          {r.trustedMember && (
            <div role="status" className="flex items-center gap-3 rounded-[20px] border-[1.5px] border-[#f0c93a] bg-[#fff8dc] px-4 py-3">
              <span className="ref-badge">★ Trusted member</span>
              <span className="text-[14.5px] text-[#4b4664]">A friend you invited is verified. The badge shows on your profile.</span>
            </div>
          )}

          <section aria-labelledby="inv-link" className="flex flex-col gap-3 rounded-[20px] border border-[#ebe9f2] bg-white p-[18px]">
            <h2 id="inv-link" className="m-0 text-[18px] font-semibold">Your invite link</h2>
            <CopyLink link={r.link} />
            <div className="ref-share">
              <a className="wa" href={whatsappShare(inviteMessage(r.link))} target="_blank" rel="noreferrer">Share on WhatsApp</a>
            </div>
          </section>

          <section aria-labelledby="inv-friends" className="flex flex-col gap-1 rounded-[20px] border border-[#ebe9f2] bg-white p-[18px]">
            <h2 id="inv-friends" className="m-0 text-[18px] font-semibold">Friends who joined ({r.totals.invited})</h2>
            {r.friends.length === 0 ? (
              <p className="m-0 text-[15px] text-[#4b4664]">No one yet. Friends who sign up with your link appear here.</p>
            ) : (
              <ul className="ref-friends">
                {r.friends.map((f, i) => (
                  <li key={`${f.name}-${i}`}>
                    <span className="who"><b>{f.name}</b><span className="when">Joined {date(f.joinedAt)}{f.rewarded ? " · reward paid" : ""}</span></span>
                    <span className={`ref-tag ${f.status}`}>{STATUS_WORD[f.status]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="ref-fine">Only invite people you know. Each person can have one joinStudy account; second accounts are found at verification and don't count.</p>
        </>
      )}
    </div>
  );
}
