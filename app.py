from flask import Flask, request, jsonify
from analysis import get_binance_klines, analyze_next_candle

app = Flask(__name__)

# دعم الزوجين فقط
ALLOWED_PAIRS = ["BTCUSDT", "ETHUSDT"]

@app.route("/signal")
def signal():
    symbol = request.args.get("symbol", "BTCUSDT")
    interval = request.args.get("interval", "5m")
    
    if symbol not in ALLOWED_PAIRS:
        return jsonify({"error": "هذا الزوج غير مدعوم"}), 400
    
    df = get_binance_klines(symbol, interval)
    s = analyze_next_candle(df)
    return jsonify({"symbol": symbol, "signal": s})

if __name__ == "__main__":
    app.run(debug=True)
