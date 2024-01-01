import {
  BINANCE_LISTING_URL,
  GATE_MARKET_HISTORY_URL,
  KUCOIN_KLINE_URL,
  KUCOIN_MARKET_HISTORY_URL,
} from "../config.js";
import axios from 'axios';
import logger from '../logger.js';
import { ProxyPool } from './proxy/proxyPool.js';

const headers = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-US,en;q=0.9,zh-TW;q=0.8,zh;q=0.7,zh-CN;q=0.6",
  "Cache-Control": "no-cache",
  "Dnt": "1",
  "Sec-Ch-Ua": `"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"`,
  "Sec-Ch-Ua-Mobile": "?0",
  "Sec-Ch-Ua-Platform": "macOS",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "Clienttype": "web"
}

const proxyPool = new ProxyPool()

const fetch = async (url: string): Promise<any> => {
  const proxy = proxyPool.rotateProxy()
  if (proxy.inUse || proxy.isBlocked()) {
    return null
  }
  proxy.inUse = true

  try {
    logger.debug(`[API] Sending request to ${proxy.host}:${proxy.port}`, true)
    const proxyConfig = {
      host: proxy.host,
      port: proxy.port,
      protocol: 'http'
    }
    const response = await axios.get(url, { headers, proxy: proxyConfig })
    if (response?.data) {
      proxy.rankUp()
    } else {
      proxy.rankDown()
    }
    return response
  } catch (error) {
    logger.debug(`[API] ${error}`)
    proxy.rankDown()
  } finally {
    proxy.inUse = false
  }
}


const binanceUrls = {
  getBinanceListingAnnouncementUrl: () => {
    const queries = ["catalogId=48", "pageNo=1", `pageSize=1`];
    const params = queries.join("&")

    return `${BINANCE_LISTING_URL}?${params}`;
  }
}

const kuCoinUrls = {
  getMarketHistoryUrl: (t1, t2) => `${KUCOIN_MARKET_HISTORY_URL}?symbol=${t1}-${t2}`,
  getKlineUrl: (t1, t2, startAt, endAt) => `${KUCOIN_KLINE_URL}?type=1min&symbol=${t1}-${t2}&startAt=${startAt}&endAt=${endAt}`
};

const gateUrls = {
  getMarketHistoryUrl: ({ t1, t2, from, to }) => {
    const params = `currency_pair=${t1}_${t2}&from=${from}&to=${to}`;
    return `${GATE_MARKET_HISTORY_URL}?${params}`;
  }
};

export const kuCoinApi = {
  getMarketHistory: (t1, t2 = "USDT") => {
    return fetch(kuCoinUrls.getMarketHistoryUrl(t1, t2))
  },
  getKline: (t1, t2, startAt, endAt) => {
    return fetch(kuCoinUrls.getKlineUrl(t1, t2, startAt, endAt))
  }
};

export const gateApi = {
  getMarketHistory: ({ t1, t2 = "USDT", from, to }) => {
    return fetch(gateUrls.getMarketHistoryUrl({ t1, t2, from, to }))
  },
};

export const binanceApi = {
  getListingAnnouncement: (): Promise<any> => {
    return fetch(binanceUrls.getBinanceListingAnnouncementUrl());
  }
};