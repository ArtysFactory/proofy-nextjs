'use client';

import Image from 'next/image';
import LocaleLink from '@/components/LocaleLink';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    className?: string;
    linkTo?: string;
}

const sizeClasses = {
    sm: 'h-8',      // 32px - navbar mobile
    md: 'h-10',     // 40px - navbar desktop
    lg: 'h-12',     // 48px - login/signup pages
    xl: 'h-16',     // 64px - hero section
};

export default function Logo({ 
    size = 'md', 
    showText = false, 
    className = '',
    linkTo = '/'
}: LogoProps) {
    const heightClass = sizeClasses[size];
    
    const logoContent = (
        <div className={`flex items-center gap-2 ${className}`}>
            <Image
                src="/images/logo-proof.png"
                alt="UnlmtdProof"
                width={size === 'xl' ? 200 : size === 'lg' ? 150 : size === 'md' ? 120 : 100}
                height={size === 'xl' ? 64 : size === 'lg' ? 48 : size === 'md' ? 40 : 32}
                className={`${heightClass} w-auto object-contain`}
                priority
            />
        </div>
    );
    
    if (linkTo) {
        return (
            <LocaleLink href={linkTo} className="flex items-center">
                {logoContent}
            </LocaleLink>
        );
    }
    
    return logoContent;
}
