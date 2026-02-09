const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const crypto = require("crypto");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./db.sqlite");

// تسجيل مستخدم جديد
app.post("/register", (req, res) => {
  const { account, phone, pin } = req.body;
  const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

  db.run(
    "INSERT INTO users (account, phone, pin, balance) VALUES (?, ?, ?, ?)",
    [account, phone, hashedPin, 0],
    function (err) {
      if (err) return res.json({ status: "error", message: err.message });
      res.json({ status: "success", message: "تم إنشاء الحساب" });
    }
  );
});

// تسجيل الدخول
app.post("/login", (req, res) => {
  const { account, pin } = req.body;
  const hashedPin = crypto.createHash("sha256").update(pin).digest("hex");

  db.get(
    "SELECT * FROM users WHERE account = ? AND pin = ?",
    [account, hashedPin],
    (err, row) => {
      if (err || !row) return res.json({ status: "error", message: "بيانات غير صحيحة" });
      res.json({ status: "success", balance: row.balance });
    }
  );
});

// تحويل الرصيد
app.post("/transfer", (req, res) => {
  const { from, to, amount } = req.body;
  db.get("SELECT * FROM users WHERE account = ?", [from], (err, sender) => {
    if (!sender) return res.json({ status: "error", message: "الحساب المرسل غير موجود" });
    if (sender.balance < amount) return res.json({ status: "error", message: "رصيد غير كاف" });

    db.get("SELECT * FROM users WHERE account = ?", [to], (err, receiver) => {
      if (!receiver) return res.json({ status: "error", message: "الحساب المستقبل غير موجود" });

      db.run("UPDATE users SET balance = balance - ? WHERE account = ?", [amount, from]);
      db.run("UPDATE users SET balance = balance + ? WHERE account = ?", [amount, to]);
      db.run(
        "INSERT INTO transactions (from_account, to_account, amount, date) VALUES (?, ?, ?, ?)",
        [from, to, amount, new Date().toISOString()]
      );

      res.json({ status: "success", message: "تم التحويل بنجاح" });
    });
  });
});

// سجل العمليات
app.get("/transactions/:account", (req, res) => {
  const account = req.params.account;
  db.all(
    "SELECT * FROM transactions WHERE from_account = ? OR to_account = ? ORDER BY date DESC",
    [account, account],
    (err, rows) => {
      res.json(rows);
    }
  );
});

app.listen(3000, () => console.log("Server running on port 3000"));
