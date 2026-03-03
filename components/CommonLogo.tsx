import React from 'react'

type Variant = 'home' | 'focus' | 'reflect' | 'default'

export default function CommonLogo({
  variant = 'default',
  isHidden = false,
}: { variant?: Variant; isHidden?: boolean }) {
  if (isHidden) return null;

  const base = "absolute z-50 transition-all duration-300 ease-out pointer-events-auto";
  const safe = "pt-safe";

  const classes =
    variant === 'home'
      ? `w-full flex justify-center mb-8 pt-8 transition-all duration-300 ease-out`
      : `w-full flex justify-start px-8 mb-2 pt-8 transition-all duration-300 ease-out`;

  const imgClasses =
    variant === 'home'
      ? "w-32 md:w-48 lg:w-64 h-auto object-contain"
      : "w-24 md:w-32 lg:w-40 h-auto object-contain";

  return (
    <div className={classes} aria-hidden={isHidden ? 'true' : 'false'} tabIndex={-1}>
      <img
        src="/logo.png"
        alt="MiniHack ロゴ"
        className={imgClasses}
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          console.error('Logo image not found at /public/logo.png')
        }}
      />
    </div>
  )
}
