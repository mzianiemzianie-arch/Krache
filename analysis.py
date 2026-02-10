import requests
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator

def get_binance_klines(symbol="BTCUSDT", interval="5m", limit=100):
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    data = requests.get(url).json()
    df = pd.DataFrame(data, columns=[
        "OpenTime","Open","High","Low","Close","Volume","CloseTime",
        "QuoteAssetVolume","NumberOfTrades","TBBAV","TBQAV","Ignore"
    ])
    df = df[["Open","High","Low","Close","Volume"]].astype(float)
    return df

def analyze_next_candle(df):
    df['EMA'] = EMAIndicator(df['Close'], window=10).ema_indicator()
    df['RSI'] = RSIIndicator(df['Close'], window=14).rsi()
    
    last = df.iloc[-1]
    
    score = 0
    if last['RSI'] < 30:
        score += 1
    elif last['RSI'] > 70:
        score -= 1
        
    if last['Close'] > last['EMA']:
        score += 1
    else:
        score -= 1
    
    return "صعود" if score > 0 else "هبوط"
