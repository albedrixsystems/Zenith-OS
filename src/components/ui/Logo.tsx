interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'full' | 'icon'
  className?: string
}

const sizes = {
  sm: { icon: 28, text: 'text-base' },
  md: { icon: 36, text: 'text-xl' },
  lg: { icon: 48, text: 'text-2xl' },
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const s = sizes[size]

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F4511E" />
            <stop offset="100%" stopColor="#FF8C42" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="14" fill="url(#logo-bg)" />
        {/* Z letterform — matching uploaded logo style */}
        <path
          d="M13 17 L37 17 M37 17 L19 47 M19 47 L43 47"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* P/OS mark on right */}
        <path
          d="M44 20 L44 44"
          stroke="white"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <rect
          x="44"
          y="20"
          width="8"
          height="13"
          rx="4"
          stroke="white"
          strokeWidth="4"
          fill="none"
        />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold tracking-tight text-navy-900 ${s.text}`}>
            Zenith<span style={{ color: '#F4511E' }}>OS</span>
          </span>
          {size === 'lg' && (
            <span className="text-xs text-slate-500 font-medium mt-0.5 tracking-wide">
              by Zenith Creative
            </span>
          )}
        </div>
      )}
    </div>
  )
}
