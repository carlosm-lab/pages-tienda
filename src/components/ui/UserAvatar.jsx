const FALLBACK_BG = '94a3b8';
const FALLBACK_COLOR = 'fff';

function getFallbackUrl(user, size = 128) {
  const name = user?.user_metadata?.full_name || user?.email || 'U';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${FALLBACK_BG}&color=${FALLBACK_COLOR}&size=${size}`;
}

export default function UserAvatar({ user, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-[clamp(2rem,5vw,2.5rem)] h-[clamp(2rem,5vw,2.5rem)]',
    lg: 'w-10 h-10',
  };

  const src = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || getFallbackUrl(user);

  return (
    <img
      src={src}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = getFallbackUrl(user);
      }}
      referrerPolicy="no-referrer"
      className={`${sizeClasses[size] || sizeClasses.md} rounded-full border border-slate-200 dark:border-white/5 object-cover ${className}`}
      alt="Avatar"
    />
  );
}
