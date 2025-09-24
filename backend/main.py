import json, asyncio, time
from typing import Optional, Dict, Any
from fastapi import FastAPI, Depends, HTTPException, Header, Request, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select, desc
import httpx

from config import settings
from models import Base, GameConfig, GameRound
from utils import new_ref, spin_reels, evaluate_slots, roulette_spin, fresh_shoe, bj_value, baccarat_deal, baccarat_total, crash_multiplier

engine = create_async_engine(settings.SQLALCHEMY_DATABASE_URI, future=True, echo=False)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with SessionLocal() as s:
        for gk,rtp in [("slots",0.96),("roulette",0.974),("blackjack",0.985),("baccarat",0.989),("crash",0.96)]:
            res = await s.execute(select(GameConfig).where(GameConfig.game_key==gk))
            if not res.scalar_one_or_none():
                s.add(GameConfig(game_key=gk, target_rtp=rtp, volatility=1.0, min_bet=1.0, max_bet=1000.0, meta_json={}))
        await s.commit()

async def get_current_user_id(request: Request, x_user_id: Optional[str]=Header(default=None)):
    if x_user_id: return x_user_id
    auth = request.headers.get(settings.AUTH_HEADER)
    if not auth: raise HTTPException(401, "Missing auth")
    return "demo-user"

async def wallet_debit(user_id:str, amount:float, currency:str, ref:str, meta:dict)->None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = settings.WALLET_BASE_URL.rstrip("/") + settings.WALLET_BET_URL
            r = await client.post(url, json={"user_id":user_id,"amount":amount,"currency":currency,"ref":ref,"meta":meta})
            if r.status_code>=300: raise HTTPException(400, f"Wallet debit failed: {r.text}")
    except httpx.ConnectError:
        pass

async def wallet_credit(user_id:str, amount:float, currency:str, ref:str, meta:dict)->None:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = settings.WALLET_BASE_URL.rstrip("/") + settings.WALLET_CREDIT_URL
            r = await client.post(url, json={"user_id":user_id,"amount":amount,"currency":currency,"ref":ref,"meta":meta})
            if r.status_code>=300: raise HTTPException(400, f"Wallet credit failed: {r.text}")
    except httpx.ConnectError:
        pass

async def wallet_balance(user_id:str):
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            url = settings.WALLET_BASE_URL.rstrip("/") + settings.WALLET_BAL_URL + f"?user_id={user_id}"
            r = await client.get(url)
            if r.status_code>=300: raise HTTPException(400, f"Wallet balance failed: {r.text}")
            return r.json()
    except httpx.ConnectError:
        return {"balance": 1000, "currency": "USD"}

app = FastAPI(title="Kryzel Casino Suite Pro", version="0.3.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.CORS_ORIGINS, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def on_startup():
    await init_db()

class StakeReq(BaseModel):
    stake: float
    currency: str = "USD"
    params: Dict[str, Any] = {}

class SpinResp(BaseModel):
    ref: str
    stake: float
    payout: float
    result: Dict[str, Any]

@app.get("/casino/health")
async def health(): return {"ok":True}

@app.get("/casino/wallet/balance")
async def get_balance(user_id: str = Depends(get_current_user_id)):
    return await wallet_balance(user_id)

# --- Slots
from sqlalchemy import select
@app.post("/casino/slots/spin", response_model=SpinResp)
async def slots_spin(req: StakeReq, user_id: str = Depends(get_current_user_id)):
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key=="slots"))).scalar_one()
        if not (conf.min_bet <= req.stake <= conf.max_bet): raise HTTPException(400, "Stake out of bounds")
        ref = new_ref("slots")
        await wallet_debit(user_id, req.stake, req.currency, ref, {"game":"slots"})
        reels = spin_reels(conf.target_rtp)
        payout, wins = evaluate_slots(reels, req.stake)
        result = {"reels":reels, "wins":wins}
        s.add(GameRound(game_key="slots", user_id=user_id, stake=req.stake, currency=req.currency, payout=payout, ref=ref, result_json=result))
        await s.commit()
    if payout>0: await wallet_credit(user_id, payout, req.currency, ref, {"game":"slots","type":"payout"})
    return SpinResp(ref=ref, stake=req.stake, payout=payout, result=result)

# --- Roulette
@app.post("/casino/roulette/spin", response_model=SpinResp)
async def roulette_play(req: StakeReq, user_id: str = Depends(get_current_user_id)):
    bets = req.params.get("bets", [])
    if not bets: raise HTTPException(400, "No bets provided")
    total_stake = sum(b.get("amount",0) for b in bets)
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key=="roulette"))).scalar_one()
        if not (conf.min_bet <= total_stake <= conf.max_bet): raise HTTPException(400, "Total stake out of bounds")
        ref = new_ref("roulette")
        await wallet_debit(user_id, total_stake, req.currency, ref, {"game":"roulette"})
        spin = roulette_spin(european=True)
        payout = 0.0
        for b in bets:
            t = b.get("type"); amt = b.get("amount",0)
            if t=="single":
                if str(b.get("value"))==spin["pocket"]: payout += amt*36
            elif t=="color":
                if b.get("value")==spin["color"]: payout += amt*2
            elif t=="even_odd":
                if spin["pocket"]!="0":
                    val = int(spin["pocket"])%2==0 and "even" or "odd"
                    if b.get("value")==val: payout += amt*2
            elif t=="dozen": payout += amt*3 if int(spin["pocket"]) in b.get("numbers",[]) else 0
            # NOTE: splits/corners/lines/streets can be handled client-side into numbers[] and treated uniformly:
            elif t in ["split","corner","line","street"]:
                if int(spin["pocket"]) in b.get("numbers",[]): 
                    mult = {"split":18,"street":12,"corner":9,"line":6}[t]
                    payout += amt*mult
        payout = round(payout,2)
        result = {"spin":spin,"bets":bets}
        s.add(GameRound(game_key="roulette", user_id=user_id, stake=total_stake, currency=req.currency, payout=payout, ref=ref, result_json=result))
        await s.commit()
    if payout>0: await wallet_credit(user_id, payout, req.currency, ref, {"game":"roulette","type":"payout"})
    return SpinResp(ref=ref, stake=total_stake, payout=payout, result=result)

# --- Blackjack (basic flow; advanced UI client-side)
class BJActionReq(StakeReq):
    action: str
    state: Optional[Dict[str,Any]] = None

@app.post("/casino/blackjack/play", response_model=SpinResp)
async def blackjack(req: BJActionReq, user_id: str = Depends(get_current_user_id)):
    ref = req.params.get("ref") or new_ref("blackjack")
    payout=0.0; result={}
    if req.action=="deal":
        async with SessionLocal() as s:
            conf = (await s.execute(select(GameConfig).where(GameConfig.game_key=="blackjack"))).scalar_one()
            if not (conf.min_bet <= req.stake <= conf.max_bet): raise HTTPException(400, "Stake out of bounds")
            await wallet_debit(user_id, req.stake, req.currency, ref, {"game":"blackjack"})
        deck = fresh_shoe(6)
        player = [deck.pop(), deck.pop()]
        dealer = [deck.pop(), deck.pop()]
        pv, dv = bj_value(player), bj_value(dealer)
        result = {"deck":deck, "player":player, "dealer":[dealer[0],"🂠"], "dealer_real":dealer, "pv":pv, "dv":dv, "ref":ref}
        if pv==21: payout = round(req.stake*2.5,2); result["final"]=True
    elif req.action in ["hit","stand","double"]:
        state = req.state or {}
        deck = state.get("deck")
        if not deck: deck = fresh_shoe(6)
        player = state.get("player", [])
        dealer = state.get("dealer_real", [])
        if req.action=="hit":
            player.append(deck.pop()); pv, dv = bj_value(player), bj_value(dealer)
            result = {"deck":deck,"player":player,"dealer":[dealer[0],"🂠"],"dealer_real":dealer,"pv":pv,"dv":dv,"ref":ref,"final": pv>21}
        else:
            if req.action=="double":
                await wallet_debit(user_id, req.stake, req.currency, ref, {"game":"blackjack","type":"double"})
                player.append(deck.pop()); req.stake *= 2
            pv = bj_value(player)
            while bj_value(dealer) < 17: dealer.append(deck.pop())
            dv = bj_value(dealer)
            if pv>21: payout=0.0
            elif dv>21 or pv>dv: payout = round(req.stake*2,2)
            elif pv==dv: payout = round(req.stake*1,2)
            else: payout=0.0
            result = {"deck":deck,"player":player,"dealer":dealer,"dealer_real":dealer,"pv":pv,"dv":dv,"ref":ref,"final": True}
    async with SessionLocal() as s:
        s.add(GameRound(game_key="blackjack", user_id=user_id, stake=req.stake, currency=req.currency, payout=payout, ref=ref, result_json=result))
        await s.commit()
    if payout>0: await wallet_credit(user_id, payout, req.currency, ref, {"game":"blackjack","type":"payout"})
    return SpinResp(ref=ref, stake=req.stake, payout=payout, result=result)

# --- Baccarat
@app.post("/casino/baccarat/play", response_model=SpinResp)
async def baccarat(req: StakeReq, user_id: str = Depends(get_current_user_id)):
    bet_on = req.params.get("bet_on","player")
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key=="baccarat"))).scalar_one()
        if not (conf.min_bet <= req.stake <= conf.max_bet): raise HTTPException(400, "Stake out of bounds")
        ref = new_ref("baccarat")
        await wallet_debit(user_id, req.stake, req.currency, ref, {"game":"baccarat","side":bet_on})
        shoe, player, banker = baccarat_deal()
        pt, bt = baccarat_total(player), baccarat_total(banker)
        winner = "player" if pt>bt else ("banker" if bt>pt else "tie")
        payout = 0.0
        if winner=="player" and bet_on=="player": payout = round(req.stake*2,2)
        elif winner=="banker" and bet_on=="banker": payout = round(req.stake*1.95,2)
        elif winner=="tie" and bet_on=="tie": payout = round(req.stake*9,2)
        result = {"player":player,"banker":banker,"player_total":pt,"banker_total":bt,"winner":winner}
        s.add(GameRound(game_key="baccarat", user_id=user_id, stake=req.stake, currency=req.currency, payout=payout, ref=ref, result_json=result))
        await s.commit()
    if payout>0: await wallet_credit(user_id, payout, req.currency, ref, {"game":"baccarat","type":"payout"})
    return SpinResp(ref=ref, stake=req.stake, payout=payout, result=result)

# --- Crash (REST one-shot still available)
@app.post("/casino/crash/play", response_model=SpinResp)
async def crash(req: StakeReq, user_id: str = Depends(get_current_user_id)):
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key=="crash"))).scalar_one()
        if not (conf.min_bet <= req.stake <= conf.max_bet): raise HTTPException(400, "Stake out of bounds")
        ref = new_ref("crash")
        await wallet_debit(user_id, req.stake, req.currency, ref, {"game":"crash"})
        multiplier = crash_multiplier(conf.target_rtp)
        auto = req.params.get("auto_cashout", None)
        payout = 0.0
        # Auto cashout only triggers if the multiplier reached or exceeded the auto cashout value
        if auto and multiplier >= auto: payout = round(req.stake*auto,2)
        result = {"multiplier":multiplier, "auto_cashout":auto}
        s.add(GameRound(game_key="crash", user_id=user_id, stake=req.stake, currency=req.currency, payout=payout, ref=ref, result_json=result))
        await s.commit()
    if payout>0: await wallet_credit(user_id, payout, req.currency, ref, {"game":"crash","type":"payout"})
    return SpinResp(ref=ref, stake=req.stake, payout=payout, result=result)

# --- History (for Admin KPIs)
@app.get("/casino/history")
async def history(limit:int=100, user_id: str = Depends(get_current_user_id)):
    async with SessionLocal() as s:
        res = await s.execute(select(GameRound).order_by(desc(GameRound.id)).limit(limit))
        rows = res.scalars().all()
        return [
          {"game_key":r.game_key,"user_id":r.user_id,"stake":r.stake,"payout":r.payout,"ref":r.ref,"created_at":r.created_at.isoformat(),"result":r.result_json}
          for r in rows
        ]

@app.get("/casino/admin/config/{game_key}")
async def get_game_config(game_key: str, user_id: str = Depends(get_current_user_id)):
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key==game_key))).scalar_one_or_none()
        if not conf: raise HTTPException(404, "Game config not found")
        return {"target_rtp": conf.target_rtp, "volatility": conf.volatility, "min_bet": conf.min_bet, "max_bet": conf.max_bet}

@app.post("/casino/admin/config/{game_key}")
async def update_game_config(game_key: str, config: dict, user_id: str = Depends(get_current_user_id)):
    async with SessionLocal() as s:
        conf = (await s.execute(select(GameConfig).where(GameConfig.game_key==game_key))).scalar_one_or_none()
        if not conf: raise HTTPException(404, "Game config not found")
        conf.target_rtp = config.get("target_rtp", conf.target_rtp)
        conf.volatility = config.get("volatility", conf.volatility)
        conf.min_bet = config.get("min_bet", conf.min_bet)
        conf.max_bet = config.get("max_bet", conf.max_bet)
        await s.commit()
        return {"success": True}

# --- Crash WebSocket loop (per-connection stream)
@app.websocket("/ws/crash")
async def crash_ws(ws: WebSocket):
    await ws.accept()
    try:
        # Each client gets its own simulated round
        x = 1.0
        t = time.time()
        # simple target multiplier
        target = 1.0/(1.0-0.5)  # demo curve bias
        crashed = False
        while not crashed:
            await asyncio.sleep(0.05)  # ~20fps
            x += 0.02 + (x*0.01)
            await ws.send_json({"type":"tick","x":round(x,2)})
            if x> (1.0/(1.0-0.01)):  # random-ish crash limiter
                crashed = True
        await ws.send_json({"type":"crash","x":round(x,2)})
    except WebSocketDisconnect:
        return
