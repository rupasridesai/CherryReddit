const EmptyState = ({ emoji = '🍒', title, subtitle, action }) => (
  <div
    className="card"
    style={{
      padding: '48px 32px',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12,
    }}
  >
    <span style={{ fontSize: '2.4rem' }} aria-hidden="true">{emoji}</span>
    <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
    {subtitle && <p style={{ color: 'var(--ink)', opacity: 0.75, maxWidth: 380, margin: 0 }}>{subtitle}</p>}
    {action}
  </div>
);

export default EmptyState;
