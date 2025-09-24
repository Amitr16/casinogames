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
    "A":[2.0,5.0,10.0],"K":[1.5,4.0,8.0],"Q":[1.2,3.0,6.0],"J":[1.0,2.5,5.0],
    "10":[0.8,2.0,4.0],"9":[0.6,1.5,3.0],"🍀":[3.0,8.0,15.0],"💎":[5.0,12.0,25.0],"⭐":[8.0,20.0,40.0],"7":[15.0,35.0,100.0]}
PAYLINES = [
    [1,1,1,1,1]  # Only middle row (index 1) counts as winning payline
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
        # European roulette wheel order (same as frontend)
        wheel_order = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26]
        win = rng_choice(wheel_order)
        color = "green" if win==0 else ("red" if win in {1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36} else "black")
        return {"pocket":str(win),"color":color, "wheel":"european"}
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
