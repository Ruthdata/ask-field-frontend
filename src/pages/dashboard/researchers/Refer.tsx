import "@/styles/referral.css";
import { Link } from "react-router-dom";
import CopyLink from "@/components/referral/CopyLink";
import { useGetMyReferralsQuery } from "@/redux/api/referralApi";
import { emailShare, linkedinShare, whatsappShare } from "@/lib/referral";
import { formatMoney, percent } from "@/lib/study";

const STATUS_WORD = { joined: "Signed up", qualified: "Ran a study", "not-eligible": "Not eligible" } as const;
const date = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

/** Refer a friend (researchers): your link, how it works, what you've earned, and who joined. */
export default function Refer() {
  const { data, isLoading, isError, refetch } = useGetMyReferralsQuery();
  const r = data?.data;

  if (isLoading) return <div className="ja-page" aria-busy="true"><div className="ja-skeleton" /><div className="ja-skeleton" style={{ height: 280 }} /></div>;
  if (isError || !r) {
    return (
      <div className="ja-page">
        <div className="ja-error" role="alert">We couldn't load your referrals. <button type="button" className="ja-link" onClick={() => refetch()}>Try again</button></div>
      </div>
    );
  }
  if (!r.on) {
    return (
      <div className="ja-page">
        <h1 className="ja-h1">Refer a friend</h1>
        <p className="ja-lede">Referrals are paused right now. Check back soon.</p>
      </div>
    );
  }

  const cur = r.currency;
  const t = r.terms;
  const message = `I use joinStudy to recruit research participants in Africa. Sign up with my link and your first study is at the ${percent(t.friendFeeRate)} fee: ${r.link}`;

  return (
    <div className="ja-page">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          <h1 className="ja-h1">Refer a friend</h1>
          {r.trusted && <span className="ref-badge" title="Shown on your studies">★ Trusted researcher</span>}
        </div>
        <p className="ja-lede">
          Know a researcher who needs participants? Their first study is at the {percent(t.friendFeeRate)} fee, and you earn credit when they run it.
        </p>
      </div>

      <section aria-labelledby="ref-link-h" className="ja-card dark" style={{ gap: 16 }}>
        <h2 id="ref-link-h" style={{ fontFamily: "var(--body)", fontWeight: 600, fontSize: 17, letterSpacing: 0 }}>Your invite link</h2>
        <CopyLink link={r.link} dark />
        <div className="ref-share" aria-label="Share">
          <a href={emailShare("Recruit participants with joinStudy", message)}>Email</a>
          <a href={linkedinShare(r.link)} target="_blank" rel="noreferrer">LinkedIn</a>
          <a className="wa" href={whatsappShare(message)} target="_blank" rel="noreferrer">WhatsApp</a>
        </div>
        <span style={{ fontSize: 14, color: "var(--on-night-2)" }}>Your code: <b style={{ color: "#fff", fontFamily: "var(--mono)" }}>{r.code}</b></span>
      </section>

      <section aria-labelledby="ref-how-h" className="ja-card" style={{ gap: 14 }}>
        <h2 id="ref-how-h" className="ja-h2">How it works</h2>
        <ol className="ref-steps">
          <li><span className="n" aria-hidden="true">1</span><b>Share your link</b><span>With colleagues at other organisations who run surveys, interviews or tests.</span></li>
          <li><span className="n" aria-hidden="true">2</span><b>They save on their first study</b><span>They pay the {percent(t.friendFeeRate)} fee instead of {percent(t.standardFeeRate)} on their first study.</span></li>
          <li><span className="n" aria-hidden="true">3</span><b>You earn credit</b><span>{percent(t.share)} of the fees they pay in their first {t.windowDays} days, up to {formatMoney(t.friendCap, cur)} per friend. It's used on your next study.</span></li>
        </ol>
      </section>

      <section aria-label="What you've earned" className="ref-stats">
        <div className="ref-stat"><span className="k">Invited</span><span className="v">{r.totals.invited}</span><span className="s">{r.totals.paid} ran a study</span></div>
        <div className="ref-stat"><span className="k">Credit earned</span><span className="v">{formatMoney(r.totals.earned, cur)}</span><span className="s">{formatMoney(r.totals.thisYear, cur)} of {formatMoney(t.yearCap, cur)} this year</span></div>
        <div className="ref-stat">
          <span className="k">Referral credit left</span>
          <span className="v">{formatMoney(r.totals.available, cur)}</span>
          <span className="s">{r.totals.nextExpiry ? `${formatMoney(r.totals.nextExpiry.amount, cur)} expires ${date(r.totals.nextExpiry.at)}` : `Lasts ${t.creditMonths} months`}</span>
        </div>
      </section>

      <section aria-labelledby="ref-friends-h" className="ja-card" style={{ gap: 8 }}>
        <h2 id="ref-friends-h" className="ja-h2">People you invited</h2>
        {r.friends.length === 0 ? (
          <p className="ja-muted" style={{ fontSize: 15 }}>No one yet. When someone signs up with your link, they'll appear here.</p>
        ) : (
          <ul className="ref-friends">
            {r.friends.map((f, i) => (
              <li key={`${f.name}-${i}`}>
                <span className="who">
                  <b>{f.name}</b>
                  <span className="when">Joined {date(f.joinedAt)}{f.earned > 0 ? ` · you earned ${formatMoney(f.earned, cur)}` : ""}</span>
                </span>
                <span className={`ref-tag ${f.status}`}>{STATUS_WORD[f.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ref-terms-h" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <h2 id="ref-terms-h" style={{ fontFamily: "var(--body)", fontWeight: 600, fontSize: 15, letterSpacing: 0 }}>The small print</h2>
        <p className="ref-fine">
          Credit is added after your friend's first study is paid for, and only for fees on work they approve. It can't be cashed out and expires {t.creditMonths} months after it's added; we email you 30 days before. Referral credit is used before other credit. Invites between people at the same organisation (same work email domain, same organisation name or the same card) don't count. Up to {formatMoney(t.yearCap, cur)} a year. Credit shows on <Link to="/dashboard/researcher/wallet">Payments</Link>.
        </p>
      </section>
    </div>
  );
}
