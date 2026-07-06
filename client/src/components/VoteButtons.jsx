import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Optimistic upvote/downvote control. Calls onVote(direction) which should
 * return a promise; on failure the local state is rolled back.
 */
const VoteButtons = ({ score, voteState = 0, onVote, size = 'md', disabled = false }) => {
  const [localScore, setLocalScore] = useState(score);
  const [localVote, setLocalVote] = useState(voteState);
  const [busy, setBusy] = useState(false);

  const handleVote = async (direction) => {
    if (disabled || busy) return;
    const nextDirection = localVote === direction ? 0 : direction;
    const prevScore = localScore;
    const prevVote = localVote;

    // optimistic update
    const delta = nextDirection - prevVote;
    setLocalScore(prevScore + delta);
    setLocalVote(nextDirection);
    setBusy(true);

    try {
      const { data } = await onVote(nextDirection);
      if (data && typeof data.score === 'number') {
        setLocalScore(data.score);
        setLocalVote(data.voteState);
      }
    } catch (err) {
      setLocalScore(prevScore);
      setLocalVote(prevVote);
    } finally {
      setBusy(false);
    }
  };

  const dims = size === 'sm' ? { btn: 26, font: '0.78rem' } : { btn: 32, font: '0.85rem' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => handleVote(1)}
        aria-label="Upvote"
        aria-pressed={localVote === 1}
        style={{
          width: dims.btn,
          height: dims.btn,
          borderRadius: '50%',
          border: 'none',
          background: localVote === 1 ? 'var(--cherry)' : 'var(--pink)',
          color: localVote === 1 ? '#fff' : 'var(--burgundy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
      >
        ▲
      </motion.button>
      <span
        style={{
          fontWeight: 800,
          fontSize: dims.font,
          color:
            localVote === 1 ? 'var(--cherry)' : localVote === -1 ? 'var(--burgundy)' : 'var(--ink)',
          minWidth: 24,
          textAlign: 'center',
        }}
      >
        {localScore}
      </span>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => handleVote(-1)}
        aria-label="Downvote"
        aria-pressed={localVote === -1}
        style={{
          width: dims.btn,
          height: dims.btn,
          borderRadius: '50%',
          border: 'none',
          background: localVote === -1 ? 'var(--burgundy)' : 'var(--pink)',
          color: localVote === -1 ? '#fff' : 'var(--burgundy)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background-color 0.15s ease',
        }}
      >
        ▼
      </motion.button>
    </div>
  );
};

export default VoteButtons;
