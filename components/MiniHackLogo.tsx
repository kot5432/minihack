import React from 'react'

export default function MiniHackLogo() {
    return (
        <div className="flex items-center select-none">
            <img
                src="/logo.png"
                alt="MiniHack Logo"
                className="h-10 w-auto object-contain"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    console.error('Logo image not found at /public/logo.png');
                }}
            />
        </div>
    )
}
