import { Link } from "react-router-dom";
import WorldMap from "@components/marketing/WorldMap";
import { LanguageWord, SampleTask } from "@components/marketing/HomeBits";
import { researcherSignup, ROUTES, SUPPORT_EMAIL } from "@/lib/site";

const Arrow = () => <span className="go arrow" aria-hidden="true">→</span>;

export default function Homepage() {
  return (
    <main id="top" className="mk mk-home">
          <section className="hero">
            <div className="wrap">
              <div className="hero-top">
                <div>
                  <h1>Reach the people your research is <em>missing.</em></h1>
                  <p className="lede">Anyone, anywhere can run a study or take part. We specialise in the people most research misses, starting in Africa.</p>
                </div>
                <WorldMap />
              </div>
              <div className="routes">
                <Link className="route" to={researcherSignup("hero")}><span className="label">Researchers</span><h3>Run a study</h3><p>Surveys, interviews, focus groups, product tests.</p><Arrow /></Link>
                <Link className="route" to={ROUTES.aiPilot}><span className="label">AI teams</span><h3>Evaluate a model</h3><p>Native speakers, in the languages your evals skip.</p><Arrow /></Link>
                <Link className="route earn" to={ROUTES.participantSignup}><span className="label">Participants</span><h3>Get paid for your view</h3><p>Real money, wherever you live.</p><Arrow /></Link>
              </div>
              <Link className="used" to={ROUTES.foundingLabs}><span className="label">Now onboarding founding labs</span><b>The first research teams get priority recruiting and founding pricing.</b><span className="apply">Apply <span className="arrow">→</span></span></Link>
            </div>
          </section>
  
          <section id="why">
            <div className="wrap ev">
              <div>
                <div className="big" aria-hidden="true">89<span>%</span></div>
                <h2>of the world is still missing from top psychology research.</h2>
                <p className="sub">Samples remain WEIRD: Western, Educated, Industrialized, Rich and Democratic. Findings, products and AI built on them don&apos;t travel.</p>
              </div>
              <div>
                <div className="grid100" role="img" aria-label="100 dots: 11 represented, 89 missing">
                  {Array.from({ length: 100 }, (_, i) => <i key={i} className={i < 11 ? 'in' : ''} />)}
                </div>
                <div className="ev-key"><span><i style={{ background: 'var(--lilac)' }} />represented, 11%</span><span><i style={{ background: 'var(--sun)' }} />missing, 89%</span></div>
                <p className="cite">Thalmayer, Toscanelli &amp; Arnett (2021), <a href="https://doi.org/10.1037/amp0000622">American Psychologist 76(1)</a></p>
              </div>
            </div>
          </section>
  
          <section className="methods" id="methods">
            <div className="wrap">
              <div className="m-head">
                <div><span className="label">For researchers</span><h2 className="h2">Every method. One verified pool.</h2></div>
                <p className="sub">You pay once. We recruit, verify, schedule and pay every participant locally.</p>
              </div>
              <div className="mlist">
                {[
                  ['Surveys', 'Bring a link from Qualtrics, Google Forms or any survey tool.', false, 'survey'],
                  ['Interviews', 'Screen and shortlist, then book across time zones with WhatsApp reminders.', true, 'interview'],
                  ['Focus groups', 'Groups recruited with a no-show buffer. Local-language moderators on request.', true, 'focus-group'],
                  ['Product tests', 'Watch real people use your app on the phones and networks they have.', false, 'product-test']
                ].map(([t, d, n, m]) => (
                  <Link key={t as string} to={researcherSignup("method-card", m as string)} className="m"><h3>{t}{n && <small>new</small>}</h3><p>{d}</p><span className="dot" aria-hidden="true" /></Link>
                ))}
              </div>
              <ol className="flow">
                <li><h3>Launch</h3><p>Pick countries, languages, quotas and pay.</p></li>
                <li><h3>We verify</h3><p>Every participant once, before their first study: a phone code and a selfie check for one person, one account. Attention flags on every study.</p></li>
                <li><h3>Approve</h3><p>Pay only for approved work. Export with quality flags.</p></li>
              </ol>
            </div>
          </section>
  
          <section className="ai" id="ai">
            <div className="wrap ai-grid">
              <div>
                <span className="label">For AI teams</span>
                <h2>Does your model speak <LanguageWord />?</h2>
                <p className="sub">Skill-tested native speakers rate, rank and correct your model&apos;s outputs, with reviewer checks on every batch.</p>
                <Link className="btn btn-ink" to={ROUTES.aiPilot}>Start a pilot <span className="arrow">→</span></Link>
              </div>
              <SampleTask />
            </div>
          </section>
  
          <section className="earn-sec" id="earn">
            <div className="wrap earn-grid">
              <div>
                <span className="label">For participants</span>
                <h2 className="h2">Your view is worth paying for.</h2>
                <ul className="promises"><li>Real money, never gift cards</li><li>Pay and time shown before you start</li><li>Take part from anywhere in the world</li></ul>
                <Link className="btn btn-sun" to={ROUTES.participantSignup}>Start earning <span className="arrow">→</span></Link>
              </div>
              <div className="wstack" aria-label="Example wallets">
                <div className="wal k"><div className="r"><span>Kenya · KES</span><span className="pill">next</span></div><div className="amt sm">Opening next</div><div className="r"><span>M-Pesa</span></div></div>
                <div className="wal g"><div className="r"><span>Ghana · GHS</span><span className="pill">next</span></div><div className="amt sm">Opening next</div><div className="r"><span>Mobile money</span></div></div>
                <div className="wal n"><div className="r"><span>Nigeria · NGN</span><span>example</span></div><div className="amt">₦10,800</div><div className="r"><span>2 studies approved</span><span>Cash out →</span></div></div>
              </div>
            </div>
          </section>
  
          <section>
            <div className="wrap trust">
              <div><span className="ic" style={{ background: 'var(--sun)' }}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M4 9.5l3.2 3.2L14 5.8" fill="none" stroke="#120e22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></span><h3>Real, verified people</h3><p>One person, one account. Every participant is verified with a phone code and a selfie before their first study. A duplicate found later is removed and refunded.</p></div>
              <div><span className="ic" style={{ background: 'var(--lilac)' }}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><rect x="3" y="5" width="12" height="9" rx="2" fill="none" stroke="#120e22" strokeWidth="1.8" /><path d="M3 8.5h12" stroke="#120e22" strokeWidth="1.8" /></svg></span><h3>Open to everyone</h3><p>Run a study from any country. Take part from any country. Fair pay floors published for each.</p></div>
              <div><span className="ic" style={{ background: 'var(--night)' }}><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="3" fill="#f0c93a" /></svg></span><h3>Built by researchers</h3><p>Designed around ethics review, fair pay and data quality from day one.</p></div>
            </div>
          </section>
  
          <section className="faqsec" id="faq" style={{ paddingTop: 0 }}>
            <div className="wrap faq">
              <div>
                <span className="label">FAQ</span>
                <h2 className="h2">Questions, answered.</h2>
                <p className="sub">Anything else? Write to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
              </div>
              <div className="qa">
                <details id="pricing"><summary>How much does a study cost?<i aria-hidden="true" /></summary><p>You set what participants earn, at or above our fair-pay floor for their country, plus a platform fee. You see the full cost before you launch, and you only pay for approved work.</p></details>
                <details><summary>How fast will my study fill?<i aria-hidden="true" /></summary><p>It depends on who you need and where. We show an estimated fill time when you set up your study, and we tell you early if a group will be hard to reach.</p></details>
                <details><summary>Will it work with my ethics review?<i aria-hidden="true" /></summary><p>Yes. We provide consent language and a summary of how participant data is collected, stored and paid, ready to attach to your IRB or ethics application.</p></details>
                <details><summary>How do you keep data safe?<i aria-hidden="true" /></summary><p>Participants are verified, but you see only what your study collects. We never sell participant data, and we follow the data protection laws where participants live, including Nigeria&apos;s NDPA and the EU&apos;s GDPR.</p></details>
                <details><summary>Who can take part, and how are they paid?<i aria-hidden="true" /></summary><p>Any adult, anywhere, can sign up. Studies are matched to people who fit. Participants are paid real money after approval, in local currency where local payouts are live.</p></details>
              </div>
            </div>
          </section>
  
          <section className="close">
            <div className="wrap">
              <span className="label">One last question</span>
              <h2>Ready<span aria-hidden="true" /></h2>
              <div className="ends">
                <Link className="end" to={researcherSignup("closing")}><span><b>I&apos;m asking</b><small>Launch a study or an AI pilot</small></span><span className="o" aria-hidden="true" /></Link>
                <Link className="end" to={ROUTES.participantSignup}><span><b>I&apos;m answering</b><small>Get paid for your view</small></span><span className="o" aria-hidden="true" /></Link>
              </div>
            </div>
          </section>
        </main>
  );
}
