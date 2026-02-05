import React from 'react';
import * as tokenIcons from '@web3icons/react';

/**
 * Map token symbols to their icon component names
 * This handles variations in naming (e.g., WETH vs ETH, WBTC vs BTC)
 */
const TOKEN_ICON_MAP: Record<string, string> = {
  // Common tokens
  'WETH': 'TokenWETH',
  'ETH': 'TokenWETH',
  'WBTC': 'TokenWBTC',
  'BTC': 'TokenWBTC',
  'AAVE': 'TokenAAVE',
  'USDC': 'TokenUSDC',
  'USDT': 'TokenUSDT',
  'DAI': 'TokenDAI',
  'LINK': 'TokenLINK',
  'EURS': 'TokenEURS',
  'IUSDC': 'TokenUSDC',
  'IUSDC': 'TokenUSDC',
  // Add more mappings as needed
};

/**
 * Get the token icon component by symbol
 * @param symbol Token symbol (e.g., 'WETH', 'WBTC')
 * @param size Icon size in pixels (default: 24)
 * @returns React component or null if not found
 */
export function getTokenIcon(symbol: string | undefined | null, size: number = 24): React.ReactElement | null {
  if (!symbol) return null;

  const upperSymbol = symbol.toUpperCase().trim();
  const iconName = TOKEN_ICON_MAP[upperSymbol] || `Token${upperSymbol}`;

  try {
    // The library exports icons as default exports: export { default as TokenWETH }
    // So they're available directly as tokenIcons.TokenWETH
    let IconComponent = (tokenIcons as any)[iconName];
    
    // If not found, try accessing through tokenIcons.tokenIcons (alternative export)
    if (!IconComponent && (tokenIcons as any).tokenIcons) {
      IconComponent = (tokenIcons as any).tokenIcons[iconName];
    }
    
    if (IconComponent) {
      // Icons are default exports, so we might need to access .default
      const Component = IconComponent.default || IconComponent;
      if (Component && (typeof Component === 'function' || React.isValidElement(Component))) {
        return React.createElement(Component, { 
          size: size,
          className: 'inline-block'
        });
      }
    }

    // Fallback: try with just the symbol (TokenSYMBOL)
    let FallbackIcon = (tokenIcons as any)[`Token${upperSymbol}`];
    if (!FallbackIcon && (tokenIcons as any).tokenIcons) {
      FallbackIcon = (tokenIcons as any).tokenIcons[`Token${upperSymbol}`];
    }
    
    if (FallbackIcon) {
      const Component = FallbackIcon.default || FallbackIcon;
      if (Component && (typeof Component === 'function' || React.isValidElement(Component))) {
        return React.createElement(Component, { 
          size: size,
          className: 'inline-block'
        });
      }
    }
  } catch (error) {
    // Silently fail - we'll show a fallback
    console.debug(`Icon not found for token: ${symbol}`, error);
  }

  return null;
}

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
  const icon = getTokenIcon(symbol, size);
  
  if (!icon) {
    // Fallback: show first letter of symbol
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.5 }}
      >
        {symbol ? symbol[0]?.toUpperCase() : '?'}
      </div>
    );
  }

  return React.cloneElement(icon, { className: `${icon.props.className || ''} ${className}`.trim() });
}

