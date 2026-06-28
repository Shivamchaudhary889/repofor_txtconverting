const STYLE_HUMAN = "notionists-neutral";
const STYLE_BOT = "bottts-neutral";

const PALETTE = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c0f5e1";

export function getAvatar(seed: string, opts?: { bot?: boolean }) {
  const style = opts?.bot ? STYLE_BOT : STYLE_HUMAN;
  const safe = encodeURIComponent(seed || "user");
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${safe}&backgroundColor=${PALETTE}&radius=50`;
}

export function avatarInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
