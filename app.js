const express = require('express');
const axios = require('axios');
const app = express();
const port = 3500;

// List of real BTC price providers
const btcProviders = [
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd",
  "https://api.coinbase.com/v2/prices/spot?currency=USD",
  "https://api.kraken.com/0/public/Ticker?pair=XBTUSD",
  "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT",
  "https://www.bitstamp.net/api/v2/ticker/btcusd/",
  "https://api.gemini.com/v1/pubticker/btcusd",
  "https://api-pub.bitfinex.com/v2/ticker/tBTCUSD",
  "https://api.coinpaprika.com/v1/tickers/btc-bitcoin",
  "https://api.blockchain.com/v3/exchange/tickers/BTC-USD",
  "https://api.huobi.pro/market/detail/merged?symbol=btcusdt",
  "https://www.okx.com/api/v5/market/ticker?instId=BTC-USDT",
  "https://api.kucoin.com/api/v1/market/orderbook/level1?symbol=BTC-USDT",
];

let providerQueue = [...btcProviders];
let currentBTCValue = "Fetching...";

// Shuffle providers list
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Get next provider (reshuffle if needed)
function getNextProvider() {
  if (providerQueue.length === 0) {
    providerQueue = [...btcProviders];
    shuffleArray(providerQueue);
  }
  return providerQueue.shift();
}

// Fetch BTC value from next provider
async function fetchBTCValue() {
  const providerURL = getNextProvider();
  console.log(`Fetching BTC price from: ${providerURL}`);

  try {
    const response = await axios.get(providerURL);
    let btcValue = null;

    if (providerURL.includes("coingecko")) {
      btcValue = response.data.bitcoin.usd;
    } else if (providerURL.includes("coinbase")) {
      btcValue = response.data.data.amount;
    } else if (providerURL.includes("kraken")) {
      btcValue = response.data.result.XXBTZUSD.c[0];
    } else if (providerURL.includes("binance")) {
      btcValue = response.data.price;
    } else if (providerURL.includes("bitstamp")) {
      btcValue = response.data.last;
    } else if (providerURL.includes("gemini")) {
      btcValue = response.data.last;
    } else if (providerURL.includes("bitfinex")) {
      btcValue = response.data[6];
    } else if (providerURL.includes("coinpaprika")) {
      btcValue = response.data.quotes.USD.price;
    } else if (providerURL.includes("blockchain")) {
      btcValue = response.data.last_trade_price;
    } else if (providerURL.includes("huobi")) {
      btcValue = response.data.tick.close;
    } else if (providerURL.includes("okx")) {
      btcValue = response.data.data[0].last;
    } else if (providerURL.includes("kucoin")) {
      btcValue = response.data.data.price;
    } else {
      btcValue = (25000 + Math.random() * 50000).toFixed(2); // fallback random
    }

    if (btcValue) {
      currentBTCValue = parseFloat(btcValue).toFixed(2);
      console.log(`Updated BTC Value: $${currentBTCValue}`);
    } else {
      console.error("Could not parse BTC value from response.");
    }

  } catch (error) {
    console.error(`Failed to fetch from ${providerURL}:`, error.message);
  }
}

// Express endpoint
app.get('/btc-value', (req, res) => {
  res.json({ btc: currentBTCValue });
});

// Start server and fetching loop
app.listen(port, () => {
  console.log(`BTC server running at http://localhost:${port}`);
  shuffleArray(providerQueue);
  fetchBTCValue(); // Initial fetch immediately
  setInterval(fetchBTCValue, 30000); // Then every 30 seconds
});
