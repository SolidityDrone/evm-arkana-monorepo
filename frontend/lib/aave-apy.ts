/**
 * Aave v3 APY fetching using GraphQL API
 * API: https://api.v3.aave.com/graphql
 * 
 * Note: Uses mainnet token addresses for APY data since testnet may not have APY history
 */

export interface APYSample {
  avgRate: {
    value: string;
  };
  date: string;
}

export interface SupplyAPYHistoryResponse {
  data: {
    supplyAPYHistory: APYSample[];
  };
}

/**
 * Mapping of token symbols to their mainnet addresses (Ethereum mainnet)
 * Used to fetch APY data from mainnet even when on testnet
 */
const MAINNET_TOKEN_ADDRESSES: Record<string, string> = {
  'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'WBTC': '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
  'AAVE': '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
  'USDC': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  'DAI': '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  'USDT': '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  'LINK': '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  'UNI': '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
  'MKR': '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  'SNX': '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
  'CRV': '0xD533a949740bb3306d119CC777fa900bA034cd52',
  '1INCH': '0x111111111117dC0aa78b770fA6A738034120C302',
  'BAL': '0xba100000625a3754423978a60c9317c58a424e3D',
  'ENS': '0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72',
  'GUSD': '0x056Fd409E1d7A124BD7017459dFEa2F400bC1D54',
  'BUSD': '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
  'TUSD': '0x0000000000085d4780B73119b644AE5ecd22b376',
  'FRAX': '0x853d955aCEf822Db058eb8505911ED77F175b99e',
  'LUSD': '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
  'sUSD': '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
  'ENJ': '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
  'REN': '0x408e41876cCCDC0F92210600ef50372656052a38',
  'BAT': '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
  'ZRX': '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
  'YFI': '0x0bc529c00C6401aEF6D220BE8c6Ea1667F6Ad93e',
  'MANA': '0x0F5D2fB29fb7d3CFeE444a200298f468908cC942',
  'SAND': '0x3845badAde8e6dDD04Fc552C4c4F5a9bad5e97f3',
  'MATIC': '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
  'stETH': '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
  'rETH': '0xae78736Cd615f374D3085123A210448E74Fc6393',
  'wstETH': '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
};

/**
 * Get mainnet address for a token symbol
 * @param symbol Token symbol (e.g., 'WBTC', 'WETH')
 * @returns Mainnet address or null if not found
 */
function getMainnetAddress(symbol: string): string | null {
  const upperSymbol = symbol.toUpperCase();
  const address = MAINNET_TOKEN_ADDRESSES[upperSymbol];
  if (address) {
    console.log(`📊 APY: Found mainnet address for ${upperSymbol}: ${address}`);
  } else {
    console.warn(`⚠️ APY: No mainnet address found for token symbol: ${upperSymbol}`);
  }
  return address || null;
}

/**
 * Fetch supply APY history for a token
 * @param tokenSymbol The token symbol (e.g., 'WBTC', 'WETH') - uses mainnet address
 * @param days Number of days of history to fetch (default: 7)
 * @returns Array of APY samples with dates and average rates
 */
export async function fetchSupplyAPYHistory(
  tokenSymbol: string,
  days: number = 7
): Promise<APYSample[]> {
  // Get mainnet address from symbol
  const mainnetAddress = getMainnetAddress(tokenSymbol);
  if (!mainnetAddress) {
    console.warn(`⚠️ APY: No mainnet address found for token symbol: ${tokenSymbol}`);
    return [];
  }
  
  console.log(`📊 APY: Fetching APY for ${tokenSymbol} using mainnet address ${mainnetAddress}`);
  
  const endTimestamp = Math.floor(Date.now() / 1000);
  const startTimestamp = endTimestamp - (days * 24 * 60 * 60);

  const query = `
    query GetSupplyAPYHistory($request: SupplyAPYHistoryRequest!) {
      supplyAPYHistory(request: $request) {
        avgRate {
          value
        }
        date
      }
    }
  `;

  const variables = {
    request: {
      underlyingAsset: mainnetAddress.toLowerCase(),
      fromTimestamp: startTimestamp,
      toTimestamp: endTimestamp,
    },
  };

  try {
    console.log(`📊 APY: Querying Aave GraphQL API with variables:`, variables);
    
    const response = await fetch('https://api.v3.aave.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ APY: HTTP error! status: ${response.status}, body: ${errorText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SupplyAPYHistoryResponse = await response.json();
    
    console.log(`📊 APY: GraphQL response for ${tokenSymbol}:`, result);

    if (result.data?.supplyAPYHistory) {
      console.log(`✅ APY: Found ${result.data.supplyAPYHistory.length} APY samples for ${tokenSymbol}`);
      return result.data.supplyAPYHistory;
    }

    console.warn(`⚠️ APY: No APY history data in response for ${tokenSymbol}`);
    return [];
  } catch (error) {
    console.error(`❌ APY: Error fetching supply APY history for ${tokenSymbol}:`, error);
    throw error;
  }
}

/**
 * Get current supply APY (most recent value)
 * @param tokenSymbol The token symbol (e.g., 'WBTC', 'WETH') - uses mainnet address
 * @returns Current APY as a percentage string, or null if unavailable
 */
export async function getCurrentSupplyAPY(
  tokenSymbol: string
): Promise<string | null> {
  try {
    const history = await fetchSupplyAPYHistory(tokenSymbol, 1);
    if (history.length > 0) {
      // Get the most recent APY
      const latest = history[history.length - 1];
      // Convert from decimal (e.g., 0.05) to percentage (5%)
      const apyValue = parseFloat(latest.avgRate.value);
      return (apyValue * 100).toFixed(2);
    }
    return null;
  } catch (error) {
    console.error('Error fetching current supply APY:', error);
    return null;
  }
}

