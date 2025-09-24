import secrets, time
from typing import List, Dict, Tuple

def rng_float():
    return secrets.randbelow(10**9)/1_000_000_000.0

def rng_choice(seq):
    return seq[secrets.randbelow(len(seq))]

def new_ref(prefix:str):
    return f"{prefix}_{int(time.time()*1000)}"

SYMBOLS = ["A","K","Q","J","10","9","🍀","💎","⭐","7"]
BASE_WEIGHTS = {"A":100,"K":100,"Q":100,"J":100,"10":100,"9":100,"🍀":50,"💎":25,"⭐":10,"7":5}
PAYOUTS = {
    "A":[0.2,0.6,2.0],"K":[0.2,0.6,2.0],"Q":[0.2,0.5,1.5],"J":[0.2,0.5,1.2],
    "10":[0.1,0.4,1.0],"9":[0.1,0.4,1.0],"🍀":[0.5,2.0,5.0],"💎":[1.0,3.0,10.0],"⭐":[2.0,6.0,20.0],"7":[5.0,15.0,50.0]}
PAYLINES = [
    [0,0,0,0,0],[1,1,1,1,1],[2,2,2,2,2],[0,1,2,1,0],[2,1,0,1,2],
    [0,0,1,0,0],[2,2,1,2,2],[1,0,1,2,1],[1,2,1,0,1],[0,1,1,1,2],
]

def spin_reels(target_rtp:float)->List[List[str]]:
    weights = BASE_WEIGHTS.copy()
    for sym in ["🍀","💎","⭐","7"]:
        weights[sym] = max(1, int(weights[sym] * (1.0 + (target_rtp-0.96)*2)))
    reels = []
    for _ in range(5):
        column = []
        bag = []
        for s,w in weights.items():
            bag += [s]*w
        for _r in range(3):
            column.append(rng_choice(bag))
        reels.append(column)
    return reels

def evaluate_slots(reels:List[List[str]], stake:float)->Tuple[float, List[dict]]:
    rows = [[reels[c][r] for c in range(5)] for r in range(3)]
    total = 0.0
    wins = []
    for idx, line in enumerate(PAYLINES):
        symbols = [rows[row][col] for col,row in enumerate(line)]
        first = symbols[0]
        count = 1
        for i in range(1,5):
            if symbols[i]==first: count+=1
            else: break
        if count>=3 and first in PAYOUTS:
            mult = PAYOUTS[first][count-3]
            amt = round(stake*mult,2)
            total+=amt
            wins.append({"line":idx,"symbol":first,"count":count,"amount":amt})
    return round(total,2), wins

def roulette_spin(european:bool=True)->Dict:
    if european:
        pockets = [str(i) for i in range(37)]
        win = rng_choice(pockets)
        color = "green" if win=="0" else ("red" if int(win) in {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36} else "black")
        return {"pocket":win,"color":color, "wheel":"european"}
    else:
        pockets = [str(i) for i in range(1,37)] + ["0","00"]
        win = rng_choice(pockets)
        color = "green" if win in ["0","00"] else ("red" if int(win) in {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36} else "black")
        return {"pocket":win,"color":color, "wheel":"american"}

def fresh_shoe(decks:int=6):
    ranks = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
    shoe = []
    for _ in range(decks):
        for r in ranks:
            for _s in range(4): shoe.append(r)
    for i in range(len(shoe)-1, 0, -1):
        j = secrets.randbelow(i+1)
        shoe[i], shoe[j] = shoe[j], shoe[i]
    return shoe

def bj_value(hand:List[str]):
    total = 0; aces = 0
    for c in hand:
        if c=="A": aces+=1; total+=11
        elif c in ["K","Q","J","10"]: total+=10
        else: total+=int(c)
    while total>21 and aces>0: total-=10; aces-=1
    return total

def baccarat_deal():
    shoe = fresh_shoe(8)
    player = [shoe.pop(),shoe.pop()]
    banker = [shoe.pop(),shoe.pop()]
    return shoe, player, banker

def baccarat_total(hand:List[str]):
    conv = {"A":1,"K":0,"Q":0,"J":0,"10":0}
    s = 0
    for c in hand:
        s += conv.get(c, int(c) if c.isdigit() else 0)
    return s%10

def crash_multiplier(target_rtp:float)->float:
    u = rng_float()
    fair = 1.0/(1.0-u)
    fair = min(fair, 100.0)
    edge = max(0.0, 1.0 - target_rtp)
    m = fair*(1.0-edge)
    return round(max(1.01, m), 2)
