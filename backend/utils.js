export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export function createRoomCode() {
  return `CA-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function rankFromElo(elo = 1000) {
  if (elo >= 2400) return "Grandmaster";
  if (elo >= 2100) return "Master";
  if (elo >= 1800) return "Diamond";
  if (elo >= 1500) return "Platinum";
  if (elo >= 1250) return "Gold";
  if (elo >= 1050) return "Silver";
  return "Bronze";
}
