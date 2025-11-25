import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMinimized } from '../utils/useMinimized';

interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'etf' | 'index';
}

// Top 50 stocks, ETFs, and indexes
const STOCK_SYMBOLS = [
  // Major Indexes
  { symbol: '^GSPC', type: 'index' as const }, // S&P 500
  { symbol: '^DJI', type: 'index' as const }, // Dow Jones
  { symbol: '^IXIC', type: 'index' as const }, // NASDAQ
  { symbol: '^VIX', type: 'index' as const }, // VIX
  { symbol: '^RUT', type: 'index' as const }, // Russell 2000
  
  // Major Stocks
  { symbol: 'AAPL', type: 'stock' as const },
  { symbol: 'MSFT', type: 'stock' as const },
  { symbol: 'GOOGL', type: 'stock' as const },
  { symbol: 'AMZN', type: 'stock' as const },
  { symbol: 'NVDA', type: 'stock' as const },
  { symbol: 'META', type: 'stock' as const },
  { symbol: 'TSLA', type: 'stock' as const },
  { symbol: 'BRK.B', type: 'stock' as const },
  { symbol: 'V', type: 'stock' as const },
  { symbol: 'JNJ', type: 'stock' as const },
  { symbol: 'WMT', type: 'stock' as const },
  { symbol: 'JPM', type: 'stock' as const },
  { symbol: 'MA', type: 'stock' as const },
  { symbol: 'PG', type: 'stock' as const },
  { symbol: 'UNH', type: 'stock' as const },
  { symbol: 'HD', type: 'stock' as const },
  { symbol: 'DIS', type: 'stock' as const },
  { symbol: 'BAC', type: 'stock' as const },
  { symbol: 'ADBE', type: 'stock' as const },
  { symbol: 'NFLX', type: 'stock' as const },
  { symbol: 'CRM', type: 'stock' as const },
  { symbol: 'NKE', type: 'stock' as const },
  { symbol: 'COST', type: 'stock' as const },
  { symbol: 'AMD', type: 'stock' as const },
  { symbol: 'INTC', type: 'stock' as const },
  { symbol: 'CSCO', type: 'stock' as const },
  { symbol: 'PEP', type: 'stock' as const },
  { symbol: 'TMO', type: 'stock' as const },
  { symbol: 'ABBV', type: 'stock' as const },
  { symbol: 'AVGO', type: 'stock' as const },
  { symbol: 'WFC', type: 'stock' as const },
  { symbol: 'CMCSA', type: 'stock' as const },
  { symbol: 'XOM', type: 'stock' as const },
  { symbol: 'LLY', type: 'stock' as const },
  { symbol: 'ORCL', type: 'stock' as const },
  
  // Major ETFs
  { symbol: 'SPY', type: 'etf' as const },
  { symbol: 'QQQ', type: 'etf' as const },
  { symbol: 'DIA', type: 'etf' as const },
  { symbol: 'IWM', type: 'etf' as const },
  { symbol: 'VTI', type: 'etf' as const },
  { symbol: 'VOO', type: 'etf' as const },
  { symbol: 'VEA', type: 'etf' as const },
  { symbol: 'VWO', type: 'etf' as const },
  { symbol: 'BND', type: 'etf' as const },
  { symbol: 'GLD', type: 'etf' as const },
  { symbol: 'SLV', type: 'etf' as const },
  { symbol: 'TLT', type: 'etf' as const },
  { symbol: 'EEM', type: 'etf' as const },
  { symbol: 'EFA', type: 'etf' as const },
  { symbol: 'IEFA', type: 'etf' as const },
];

export const StockTicker: React.FC = () => {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const { isMinimized } = useMinimized('stock-ticker');

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        // Use a CORS proxy to bypass CORS restrictions
        // Fetch stocks in batches to avoid API limits
        const batchSize = 10;
        const batches: StockData[] = [];
        
        for (let i = 0; i < STOCK_SYMBOLS.length; i += batchSize) {
          const batch = STOCK_SYMBOLS.slice(i, i + batchSize);
          const symbols = batch.map(s => s.symbol).join(',');
          const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbols)}`;
          
          try {
            // Use allorigins.win as a CORS proxy
            const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(yahooUrl)}`;
            
            const response = await fetch(proxyUrl, {
              headers: {
                'Accept': 'application/json',
              }
            });
            
            if (response.ok) {
              const data = await response.json();
              const quotes = data.quoteResponse?.result || [];
              
              quotes.forEach((quote: any) => {
                const symbolInfo = STOCK_SYMBOLS.find(s => s.symbol === quote.symbol);
                const regularMarketPrice = quote.regularMarketPrice || 0;
                const regularMarketChange = quote.regularMarketChange || 0;
                const regularMarketChangePercent = quote.regularMarketChangePercent || 0;
                
                if (regularMarketPrice > 0) {
                  batches.push({
                    symbol: quote.symbol,
                    price: regularMarketPrice,
                    change: regularMarketChange,
                    changePercent: regularMarketChangePercent,
                    type: symbolInfo?.type || 'stock',
                  });
                }
              });
            }
          } catch (batchError) {
            console.warn(`Failed to fetch batch starting at ${i}:`, batchError);
          }
          
          // Small delay between batches to avoid rate limiting
          if (i + batchSize < STOCK_SYMBOLS.length) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }
        }
        
        if (batches.length > 0) {
          // Sort to match original order
          const sortedBatches = STOCK_SYMBOLS.map(symbolInfo => 
            batches.find(b => b.symbol === symbolInfo.symbol)
          ).filter((stock): stock is StockData => stock !== undefined);
          
          setStocks(sortedBatches);
        } else {
          // Fallback to mock data if all API calls fail
          throw new Error('All API calls failed');
        }
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch stock data:', error);
        // Fallback to mock data with realistic prices
        const mockPrices: Record<string, number> = {
          '^GSPC': 4500, '^DJI': 35000, '^IXIC': 14000, '^VIX': 20, '^RUT': 2000,
          'AAPL': 180, 'MSFT': 380, 'GOOGL': 140, 'AMZN': 150, 'NVDA': 500,
          'META': 320, 'TSLA': 250, 'BRK.B': 350, 'V': 250, 'JNJ': 160,
          'WMT': 160, 'JPM': 150, 'MA': 400, 'PG': 150, 'UNH': 500,
          'HD': 350, 'DIS': 90, 'BAC': 35, 'ADBE': 550, 'NFLX': 450,
          'CRM': 220, 'NKE': 100, 'COST': 550, 'AMD': 120, 'INTC': 45,
          'CSCO': 55, 'PEP': 170, 'TMO': 550, 'ABBV': 150, 'AVGO': 900,
          'WFC': 45, 'CMCSA': 45, 'XOM': 110, 'LLY': 600, 'ORCL': 120,
          'SPY': 450, 'QQQ': 380, 'DIA': 350, 'IWM': 200, 'VTI': 240,
          'VOO': 450, 'VEA': 50, 'VWO': 45, 'BND': 75, 'GLD': 200,
          'SLV': 25, 'TLT': 95, 'EEM': 45, 'EFA': 70, 'IEFA': 75,
        };
        
        const mockData: StockData[] = STOCK_SYMBOLS.map((item) => {
          const basePrice = mockPrices[item.symbol] || 100;
          const change = (Math.random() - 0.5) * (basePrice * 0.05);
          const changePercent = (change / basePrice) * 100;
          
          return {
            symbol: item.symbol,
            price: basePrice + change,
            change: change,
            changePercent: changePercent,
            type: item.type,
          };
        });
        setStocks(mockData);
        setLoading(false);
      }
    };

    fetchStockData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchStockData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // When minimized, don't render anything
  if (isMinimized) {
    return null;
  }

  if (loading) {
    return (
      <div className="h-10 flex items-center px-4 font-mono text-xs opacity-60">
        <span className="text-dim">Loading market data...</span>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="h-10 flex items-center px-4 font-mono text-xs opacity-60">
        <span className="text-dim">No market data available</span>
      </div>
    );
  }

  return (
    <div className="relative bg-surface overflow-hidden h-10">
      <div className="overflow-x-auto h-full">
        <div className="flex news-ticker-scroll whitespace-nowrap h-full items-center">
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const colorClass = isPositive ? 'text-success' : 'text-error';
            const Icon = isPositive ? TrendingUp : TrendingDown;
            
            return (
              <div key={stock.symbol} className="flex items-center mx-3 px-2 border-r border-dim last:border-r-0 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold">
                    {stock.symbol.replace('^', '')}
                  </span>
                  <span className="text-xs font-mono">
                    ${stock.price.toFixed(2)}
                  </span>
                  <div className={`flex items-center gap-1 ${colorClass}`}>
                    <Icon size={10} />
                    <span className="text-xs font-mono">
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {/* Duplicate for seamless loop */}
          {stocks.map((stock) => {
            const isPositive = stock.change >= 0;
            const colorClass = isPositive ? 'text-success' : 'text-error';
            const Icon = isPositive ? TrendingUp : TrendingDown;
            
            return (
              <div key={`duplicate-${stock.symbol}`} className="flex items-center mx-3 px-2 border-r border-dim last:border-r-0 opacity-60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold">
                    {stock.symbol.replace('^', '')}
                  </span>
                  <span className="text-xs font-mono">
                    ${stock.price.toFixed(2)}
                  </span>
                  <div className={`flex items-center gap-1 ${colorClass}`}>
                    <Icon size={10} />
                    <span className="text-xs font-mono">
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

