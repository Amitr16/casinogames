# Kryzel Casino Suite — PRO

This package integrates the advanced UI/designs directly into the working casino:
- **Roulette Felt** with full-grid hotspots (singles now; extend to splits/corners/lines using JSON maps)
- **Blackjack+** actions (split/insurance/surrender UI)
- **Baccarat** roadmaps (bead road renderer)
- **Slots** reel editor page for designers/dev math
- **Crash** WebSocket live loop demo
- **Admin** KPIs using `/casino/history`

## Run
Backend:
```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8888
```
Frontend:
```
cd frontend
npm i
npm run dev  # http://localhost:5173
```
Mount frontend under your sportsbook `/casino`. Set `window.CASINO_API` or serve via reverse proxy.

## Notes
- Extend roulette payouts on the server by treating complex bets as `numbers[]` with the right multipliers.
- Blackjack advanced actions currently act as UI wires; server still supports deal/hit/stand/double. Add endpoints for split/insurance/surrender when ready.
- Crash WS is a demo stream; tie it to server round IDs for production.
