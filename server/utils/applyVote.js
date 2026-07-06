/**
 * Applies an upvote/downvote toggle to a document that has upvotes[]/downvotes[] arrays.
 * Mirrors Reddit's vote behavior: voting the same direction again removes the vote,
 * voting the opposite direction switches it.
 * @param {import('mongoose').Document} doc
 * @param {string} userId
 * @param {1|-1} direction
 * @returns {number} new score
 */
export const applyVote = (doc, userId, direction) => {
  const uid = String(userId);
  const hasUpvoted = doc.upvotes.some((id) => String(id) === uid);
  const hasDownvoted = doc.downvotes.some((id) => String(id) === uid);

  doc.upvotes = doc.upvotes.filter((id) => String(id) !== uid);
  doc.downvotes = doc.downvotes.filter((id) => String(id) !== uid);

  if (direction === 1 && !hasUpvoted) {
    doc.upvotes.push(userId);
  } else if (direction === -1 && !hasDownvoted) {
    doc.downvotes.push(userId);
  }
  // If direction matches existing vote, it was already cleared above (toggle off)

  doc.score = doc.upvotes.length - doc.downvotes.length;
  return doc.score;
};

export const getVoteState = (doc, userId) => {
  if (!userId) return 0;
  const uid = String(userId);
  if (doc.upvotes.some((id) => String(id) === uid)) return 1;
  if (doc.downvotes.some((id) => String(id) === uid)) return -1;
  return 0;
};
