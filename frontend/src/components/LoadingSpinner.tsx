"use client";

import React from 'react';
import Image from 'next/image';

const LoadingSpinner = ({ fullPage = false }) => {
    return (
        <div className={`flex flex-col items-center justify-center ${fullPage ? 'fixed inset-0 z-[9999] bg-white/80 backdrop-blur-sm' : 'py-12 w-full'}`}>
            <div className="relative flex items-center justify-center">
                {/* Outer pulsing ring */}
                <div className="absolute w-24 h-24 rounded-full border-4 border-blue-100 animate-pulse"></div>

                {/* Spinning gradient ring */}
                <div className="w-16 h-16 rounded-full border-4 border-transparent border-t-[#010080] border-r-[#010080]/30 animate-spin"></div>

                {/* Central Logo/Icon */}
                <div className="absolute flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#010080] flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-xs">B</span>
                    </div>
                </div>
            </div>

            <div className="mt-6 text-center">
                <h3 className="text-lg font-bold text-[#010080] animate-pulse">Loading...</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Preparing your data</p>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default LoadingSpinner;
