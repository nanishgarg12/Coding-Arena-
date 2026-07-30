export function calculateWinner(participants) {
  const ranked = [...participants].sort((a, b) => {
    if (a.disqualified !== b.disqualified) return a.disqualified ? 1 : -1;
    if (a.accepted !== b.accepted) return a.accepted ? -1 : 1;
    const aTime = a.completedAt ? new Date(a.completedAt).getTime() : Number.MAX_SAFE_INTEGER;
    const bTime = b.completedAt ? new Date(b.completedAt).getTime() : Number.MAX_SAFE_INTEGER;
    if (aTime !== bTime) return aTime - bTime;
    return a.attempts - b.attempts;
  });
  return ranked[0];
}
