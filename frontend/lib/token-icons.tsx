'use client';

import React from 'react';
import {
  TokenETH,
  TokenWBTC,
  TokenAAVE,
  TokenUSDC,
  TokenUSDT,
  TokenDAI,
  TokenLINK,
  TokenEURS,
  TokenGHO,
  TokenBTC,
} from '@web3icons/react';

// Map token symbols to their icon components
const TOKEN_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  // ETH variants
  'WETH': TokenETH,
  'ETH': TokenETH,
  // BTC variants  
  'WBTC': TokenWBTC,
  'BTC': TokenBTC,
  // Stablecoins
  'USDC': TokenUSDC,
  'IUSDC': TokenUSDC,
  'USDT': TokenUSDT,
  'DAI': TokenDAI,
  'EURS': TokenEURS,
  // DeFi tokens
  'AAVE': TokenAAVE,
  'LINK': TokenLINK,
  'GHO': TokenGHO,
};

/**
 * TokenIcon component that displays a token icon
 */
export function TokenIcon({ 
  symbol, 
  size = 24, 
  className = '' 
}: { 
  symbol: string | undefined | null; 
  size?: number; 
  className?: string;
}) {
  if (!symbol) {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        ?
      </div>
    );
  }

  const upperSymbol = symbol.toUpperCase().trim();
  const IconComponent = TOKEN_ICON_COMPONENTS[upperSymbol];
  
  if (!IconComponent) {
    // Fallback: show first letter of symbol
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {symbol[0]?.toUpperCase() || '?'}
      </div>
    );
  }

  // Render the icon component
  return <IconComponent size={size} className={className} />;
}
