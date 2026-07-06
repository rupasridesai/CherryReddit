import { motion } from 'framer-motion';

const Loader = ({ label = 'Loading…', size = 40 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '32px 0' }}>
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: '4px solid var(--pink)',
        borderTopColor: 'var(--cherry)',
      }}
      aria-hidden="true"
    />
    <span style={{ color: 'var(--burgundy)', fontWeight: 600, fontSize: '0.9rem' }}>{label}</span>
  </div>
);

export default Loader;
