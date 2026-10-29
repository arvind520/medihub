import { useAuth, SignInButton, UserButton } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const benefits = [
  {
    number: "01",
    title: "Tell us what you need",
    description:
      "Share your hospital visit details and the kind of support that would make the day easier.",
  },
  {
    number: "02",
    title: "Meet your companion",
    description:
      "A verified local helper can accept your request and coordinate with you directly.",
  },
  {
    number: "03",
    title: "Focus on what matters",
    description:
      "Get a little extra support with the queues, directions and details of your visit.",
  },
];

function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none">
        <path
          d="M16 27s-10-6.1-10-13.2A5.8 5.8 0 0 1 16 10a5.8 5.8 0 0 1 10 3.8C26 20.9 16 27 16 27Z"
          fill="currentColor"
          opacity=".18"
        />
        <path
          d="M16 26s-9-5.7-9-12.1A5 5 0 0 1 16 10a5 5 0 0 1 9 3.9C25 20.3 16 26 16 26Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 12v8m-4-4h8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

function HeroArtwork() {
  return (
    <div className="hero-art" aria-label="A caring companion supporting a hospital visit">
      <div className="art-orbit art-orbit-one" />
      <div className="art-orbit art-orbit-two" />
      <div className="art-sun" />
      <div className="art-plant art-plant-left">
        <span />
        <span />
        <span />
      </div>
      <div className="art-plant art-plant-right">
        <span />
        <span />
        <span />
      </div>
      <div className="art-building">
        <div className="building-cross">+</div>
        <div className="building-windows">
          <span />
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="building-door" />
      </div>
      <div className="art-path" />
      <div className="art-person art-person-helper">
        <div className="person-head" />
        <div className="person-body">
          <span className="person-badge">+</span>
        </div>
        <div className="person-leg person-leg-left" />
        <div className="person-leg person-leg-right" />
      </div>
      <div className="art-person art-person-patient">
        <div className="person-head" />
        <div className="person-body">
          <span className="person-badge">+</span>
        </div>
        <div className="person-leg person-leg-left" />
        <div className="person-leg person-leg-right" />
        <div className="person-cane" />
      </div>
      <div className="art-note art-note-top">
        <span className="note-icon">✓</span>
        <span>
          <strong>Here for you</strong>
          <small>Every step of the way</small>
        </span>
      </div>
      <div className="art-note art-note-bottom">
        <span className="note-heart">♡</span>
        <span>
          <strong>Care, made closer</strong>
          <small>Support when it matters</small>
        </span>
      </div>
    </div>
  );
}

export default function Home() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <main className="loading-screen">
        <span className="loading-mark">
          <BrandMark />
        </span>
        <p>Making care a little easier</p>
      </main>
    );
  }

  return (
    <div className="landing-page">
      <header className="site-header">
        <Link className="brand-lockup" to="/" aria-label="MediHelp home">
          <BrandMark />
          <span>MediHelp</span>
        </Link>
        <nav className="site-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#our-promise">Our promise</a>
          {isSignedIn ? (
            <>
              <Link className="nav-dashboard" to="/dashboard">
                My dashboard
                <span aria-hidden="true">→</span>
              </Link>
              <UserButton />
            </>
          ) : (
            <SignInButton mode="modal">
              <button className="nav-sign-in" type="button">
                Sign in
              </button>
            </SignInButton>
          )}
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="eyebrow-dot" />
              A helping hand for your hospital visit
            </div>
            <h1>
              Care feels
              <br />
              better <span>together.</span>
            </h1>
            <p className="hero-description">
              Hospital visits can be a lot to manage. Find a caring companion
              for the queues, directions and little things that make a big
              difference.
            </p>
            <div className="hero-actions">
              {isSignedIn ? (
                <Link className="button-primary" to="/dashboard">
                  Find support <span aria-hidden="true">→</span>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="button-primary" type="button">
                    Find support <span aria-hidden="true">→</span>
                  </button>
                </SignInButton>
              )}
              <a className="button-secondary" href="#how-it-works">
                See how it works
              </a>
            </div>
            <div className="hero-trust">
              <span className="trust-check" aria-hidden="true">
                ✓
              </span>
              <span>Thoughtful support, right when you need it</span>
            </div>
          </div>
          <HeroArtwork />
        </section>

        <section className="promise-strip" id="our-promise">
          <div className="promise-item">
            <span className="promise-icon promise-icon-green" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3 19 6v5c0 4.7-3 8-7 10-4-2-7-5.3-7-10V6l7-3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <path
                  d="m9 12 2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <strong>Verified companions</strong>
              <small>Helpers are reviewed before they join</small>
            </span>
          </div>
          <div className="promise-divider" />
          <div className="promise-item">
            <span className="promise-icon promise-icon-peach" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 20s-7-4.3-7-9.3A4 4 0 0 1 12 8a4 4 0 0 1 7 2.7c0 5-7 9.3-7 9.3Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>
              <strong>People-first care</strong>
              <small>Support that respects your comfort</small>
            </span>
          </div>
          <div className="promise-divider" />
          <div className="promise-item">
            <span className="promise-icon promise-icon-blue" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <rect
                  x="4"
                  y="5"
                  width="16"
                  height="15"
                  rx="2.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                />
                <path
                  d="M8 3v4m8-4v4M4 10h16m-11 4h6"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span>
              <strong>Clear from the start</strong>
              <small>Know what to expect at every step</small>
            </span>
          </div>
        </section>

        <section className="steps-section" id="how-it-works">
          <div className="section-intro">
            <span className="section-kicker">A little help, made simple</span>
            <h2>More peace of mind, in three steps.</h2>
            <p>
              From your first request to the end of your visit, we make it
              easier to find the support that feels right for you.
            </p>
          </div>
          <div className="steps-grid">
            {benefits.map((benefit) => (
              <article className="step-card" key={benefit.number}>
                <span className="step-number">{benefit.number}</span>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="companion-cta">
          <div>
            <span className="section-kicker">Make a difference nearby</span>
            <h2>Be someone’s helping hand.</h2>
            <p>
              Join a community that helps people feel more supported through
              their hospital visits.
            </p>
          </div>
          {isSignedIn ? (
            <Link className="cta-link" to="/select-role">
              Become a companion <span aria-hidden="true">→</span>
            </Link>
          ) : (
            <SignInButton mode="modal">
              <button className="cta-link" type="button">
                Become a companion <span aria-hidden="true">→</span>
              </button>
            </SignInButton>
          )}
          <span className="cta-decoration" aria-hidden="true">
            +
          </span>
        </section>
      </main>

      <footer className="site-footer">
        <Link className="brand-lockup" to="/">
          <BrandMark />
          <span>MediHelp</span>
        </Link>
        <p>Making hospital visits a little easier, together.</p>
        <span className="footer-note">Care starts with being there.</span>
      </footer>
    </div>
  );
}
