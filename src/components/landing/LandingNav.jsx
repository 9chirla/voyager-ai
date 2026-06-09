import { useNavigate } from 'react-router-dom';

const navStyle = {
  background: 'rgba(5, 5, 15, 0.7)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
};

const wordmarkStyle = {
  letterSpacing: '0.25em',
  color: '#c9a84c',
  fontWeight: 300,
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '0.75rem',
};

const ctaStyle = {
  background: 'transparent',
  color: '#c9a84c',
  fontFamily: "'Inter', system-ui, sans-serif",
  fontSize: '0.82rem',
  fontWeight: 500,
  letterSpacing: '0.08em',
  padding: '10px 24px',
  borderRadius: '100px',
  border: '1.5px solid rgba(201, 168, 76, 0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
};

/**
 * Minimal fixed navigation for the landing page.
 */
export default function LandingNav() {
  const navigate = useNavigate();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={navStyle}
      aria-label="Landing navigation"
    >
      <span className="landing-wordmark" style={wordmarkStyle}>
        VOYAGER
      </span>
      <button
        type="button"
        onClick={() => navigate('/app')}
        className="landing-ghost-cta"
        style={ctaStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(201, 168, 76, 0.1)';
          e.currentTarget.style.borderColor = '#c9a84c';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 168, 76, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.borderColor = 'rgba(201, 168, 76, 0.7)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        Start planning
      </button>
    </nav>
  );
}
