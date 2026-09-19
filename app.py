from flask import Flask, render_template, jsonify, request, session
import random
import os

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "change-this-secret-key")

STARTING_CREDITS = 1000

def credits():
    if "credits" not in session:
        session["credits"] = STARTING_CREDITS
    return int(session["credits"])

@app.get("/")
def index():
    return render_template("index.html", credits=credits())

@app.post("/api/reset")
def reset():
    session["credits"] = STARTING_CREDITS
    return jsonify(ok=True, credits=STARTING_CREDITS)

@app.post("/api/dice")
def dice():
    data = request.get_json(silent=True) or {}
    try:
        amount = int(data.get("amount", 0))
        guess = int(data.get("guess", 50))
    except (TypeError, ValueError):
        return jsonify(ok=False, error="Enter valid numbers."), 400

    if amount < 1:
        return jsonify(ok=False, error="Amount must be at least 1 credit."), 400
    if amount > credits():
        return jsonify(ok=False, error="Not enough demo credits."), 400
    if not 1 <= guess <= 99:
        return jsonify(ok=False, error="Guess must be from 1 to 99."), 400

    roll = random.randint(1, 100)
    won = roll >= guess
    balance = credits() - amount

    # Demo arcade points only. No cash value or payouts.
    if won:
        profit = amount
        balance += amount + profit

    session["credits"] = balance
    return jsonify(ok=True, credits=balance, result=roll, won=won,
                   message=f"Rolled {roll}. " + ("You won demo credits!" if won else "Try again."))

@app.post("/api/coinflip")
def coinflip():
    data = request.get_json(silent=True) or {}
    try:
        amount = int(data.get("amount", 0))
    except (TypeError, ValueError):
        return jsonify(ok=False, error="Enter a valid amount."), 400

    choice = str(data.get("choice", "heads")).lower()
    if choice not in {"heads", "tails"}:
        return jsonify(ok=False, error="Choose heads or tails."), 400
    if amount < 1:
        return jsonify(ok=False, error="Amount must be at least 1 credit."), 400
    if amount > credits():
        return jsonify(ok=False, error="Not enough demo credits."), 400

    result = random.choice(["heads", "tails"])
    won = result == choice
    balance = credits() - amount
    if won:
        balance += amount * 2

    session["credits"] = balance
    return jsonify(ok=True, credits=balance, result=result, won=won,
                   message=f"It landed on {result}. " + ("You won demo credits!" if won else "Not this time."))

@app.post("/api/mines")
def mines():
    data = request.get_json(silent=True) or {}
    try:
        amount = int(data.get("amount", 0))
    except (TypeError, ValueError):
        return jsonify(ok=False, error="Enter a valid amount."), 400

    if amount < 1:
        return jsonify(ok=False, error="Amount must be at least 1 credit."), 400
    if amount > credits():
        return jsonify(ok=False, error="Not enough demo credits."), 400

    # Simple 3x3 arcade reveal: choose one safe tile at random.
    mine = random.randrange(9)
    revealed = random.randrange(9)
    won = revealed != mine

    balance = credits() - amount
    if won:
        balance += amount * 2

    session["credits"] = balance
    return jsonify(ok=True, credits=balance, result="safe" if won else "mine",
                   mine=mine, revealed=revealed, won=won,
                   message=("Safe tile! You earned demo credits." if won else "Boom — mine!"))


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), debug=True)
