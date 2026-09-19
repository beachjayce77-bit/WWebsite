# Donut Chip Demo

A GitHub-ready Flask website with a dark, modern casino-inspired UI.

## Important
This project is a **play-money arcade demo**. The credits are fictional points with no cash value.
It intentionally does **not** include real-money deposits, withdrawals, payment processing, crypto payments, or cash prizes.

## Features
- Dark responsive game lobby
- Demo balance using Flask sessions
- Dice
- Coin Flip
- Mines-style 3x3 reveal
- Recent activity feed in the browser
- Reset balance button
- No external image assets required

## Run locally

```bash
python -m venv .venv
```

Windows:
```bash
.venv\Scripts\activate
```

macOS/Linux:
```bash
source .venv/bin/activate
```

Install:
```bash
pip install -r requirements.txt
```

Start:
```bash
python app.py
```

Open:
`http://127.0.0.1:5000`

## GitHub
Upload the whole folder to a GitHub repository.

GitHub itself stores the source code, but it does not execute a Flask server as a normal GitHub Pages site. Use a Python-capable host for the live app, or GitHub Codespaces for development.

Before public deployment, set a strong `SECRET_KEY` environment variable.
