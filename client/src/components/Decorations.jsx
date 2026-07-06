import { motion } from 'framer-motion';

// A small hand-drawn-feeling pair of cherries, used as an ambient floating accent.
export const CherryDoodle = ({ size = 48, style = {}, floatDelay = 0 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    style={{ position: 'absolute', ...style }}
    aria-hidden="true"
    animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
    transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
  >
    <path d="M34 6 C34 20, 30 26, 26 34" stroke="#6F1D2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M34 6 C36 16, 42 22, 46 28" stroke="#6F1D2A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <circle cx="22" cy="42" r="12" fill="#D73A49" stroke="#6F1D2A" strokeWidth="1.5" />
    <circle cx="46" cy="36" r="12" fill="#EAA6C8" stroke="#6F1D2A" strokeWidth="1.5" />
    <ellipse cx="18" cy="37" rx="3" ry="1.8" fill="#ffffff" opacity="0.55" />
    <ellipse cx="42" cy="31" rx="3" ry="1.8" fill="#ffffff" opacity="0.55" />
  </motion.svg>
);

// A candy swirl accent
export const CandyDoodle = ({ size = 40, style = {}, floatDelay = 0 }) => (
  <motion.svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    style={{ position: 'absolute', ...style }}
    aria-hidden="true"
    animate={{ y: [0, 6, 0], rotate: [0, -6, 0] }}
    transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: floatDelay }}
  >
    <circle cx="32" cy="32" r="16" fill="#F7D6E6" stroke="#6F1D2A" strokeWidth="1.5" />
    <path
      d="M32 16 A16 16 0 0 1 48 32 A16 16 0 0 1 32 48 A16 16 0 0 1 16 32"
      fill="none"
      stroke="#D73A49"
      strokeWidth="3"
      strokeLinecap="round"
    />
    <path d="M8 20 L18 26" stroke="#6F1D2A" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M56 44 L46 38" stroke="#6F1D2A" strokeWidth="2.5" strokeLinecap="round" />
  </motion.svg>
);

export default { CherryDoodle, CandyDoodle };
