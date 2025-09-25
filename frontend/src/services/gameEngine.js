// Real Game Engine - No Backend Needed
class CasinoGameEngine {
  constructor() {
    this.wallet = this.loadWallet();
    this.gameHistory = this.loadGameHistory();
  }

  // Wallet Management
  loadWallet() {
    const saved = localStorage.getItem('casino-wallet');
    return saved ? JSON.parse(saved) : { balance: 1000, currency: 'USD' };
  }

  saveWallet() {
    localStorage.setItem('casino-wallet', JSON.stringify(this.wallet));
  }

  async getBalance() {
    return { balance: this.wallet.balance, currency: this.wallet.currency };
  }

  async debit(amount) {
    if (this.wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }
    this.wallet.balance -= amount;
    this.saveWallet();
    return { success: true, newBalance: this.wallet.balance };
  }

  async credit(amount) {
    this.wallet.balance += amount;
    this.saveWallet();
    return { success: true, newBalance: this.wallet.balance };
  }

  // Game History
  loadGameHistory() {
    const saved = localStorage.getItem('casino-game-history');
    return saved ? JSON.parse(saved) : [];
  }

  saveGameHistory() {
    localStorage.setItem('casino-game-history', JSON.stringify(this.gameHistory));
  }

  // Real Random Number Generation
  generateRandom(min = 0, max = 1) {
    return Math.random() * (max - min) + min;
  }

  generateRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Roulette Game Logic
  async spinRoulette(bets) {
    // Debit total bet amount
    const totalBet = bets.reduce((sum, bet) => sum + bet.amount, 0);
    await this.debit(totalBet);

    // Generate winning number (0-36)
    const winningNumber = this.generateRandomInt(0, 36);
    
    // Calculate winnings
    let totalWinnings = 0;
    const results = [];

    for (const bet of bets) {
      let won = false;
      let payout = 0;

      switch (bet.type) {
        case 'straight':
          won = bet.value === winningNumber;
          payout = won ? bet.amount * 35 : 0;
          break;
        case 'red':
          won = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(winningNumber);
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'black':
          won = ![0, ...this.getRedNumbers()].includes(winningNumber);
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'even':
          won = winningNumber !== 0 && winningNumber % 2 === 0;
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'odd':
          won = winningNumber % 2 === 1;
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'low':
          won = winningNumber >= 1 && winningNumber <= 18;
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'high':
          won = winningNumber >= 19 && winningNumber <= 36;
          payout = won ? bet.amount * 2 : 0;
          break;
        case 'dozen':
          const dozen = Math.ceil(winningNumber / 12);
          won = bet.value === dozen && winningNumber > 0;
          payout = won ? bet.amount * 3 : 0;
          break;
        case 'column':
          const column = ((winningNumber - 1) % 3) + 1;
          won = bet.value === column && winningNumber > 0;
          payout = won ? bet.amount * 3 : 0;
          break;
      }

      totalWinnings += payout;
      results.push({
        bet: bet,
        won: won,
        payout: payout
      });
    }

    // Credit winnings
    if (totalWinnings > 0) {
      await this.credit(totalWinnings);
    }

    // Save game history
    this.gameHistory.push({
      game: 'roulette',
      timestamp: Date.now(),
      bets: bets,
      winningNumber: winningNumber,
      winnings: totalWinnings,
      totalBet: totalBet
    });
    this.saveGameHistory();

    return {
      result: {
        spin: {
          pocket: winningNumber
        }
      },
      winnings: totalWinnings,
      balance: this.wallet.balance,
      results: results
    };
  }

  getRedNumbers() {
    return [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
  }

  // Blackjack Game Logic - Full Implementation
  async playBlackjack(action, stake = 0, currentState = null) {
    if (action === 'deal') {
      await this.debit(stake);
      
      // Deal initial cards
      const playerCards = [this.dealCard(), this.dealCard()];
      const dealerCards = [this.dealCard(), { ...this.dealCard(), faceDown: true }]; // Second card face down
      
      const playerValue = this.calculateHandValue(playerCards);
      const dealerValue = this.calculateHandValue([dealerCards[0]]); // Only show face-up card
      
      let gameState = 'playing';
      let final = false;
      
      // Check for natural blackjack
      if (playerValue === 21 && dealerCards[0].rank === 'ace') {
        gameState = 'insurance_available';
      } else if (playerValue === 21) {
        gameState = 'player_blackjack';
        final = true;
        // Dealer reveals hole card to check for blackjack
        const dealerFullValue = this.calculateHandValue(dealerCards, true); // Show all cards
        if (dealerFullValue === 21) {
          // Both have blackjack - push
          await this.credit(stake);
          return {
            player: playerCards,
            dealer: dealerCards.map(card => ({ ...card, faceDown: false })), // Reveal all cards
            pv: playerValue,
            dv: dealerFullValue,
            game_state: 'finished',
            stake: stake,
            final: true,
            result: 'push',
            payout: stake,
            ref: Date.now().toString()
          };
        } else {
          // Player wins with blackjack
          await this.credit(stake * 2.5);
          return {
            player: playerCards,
            dealer: dealerCards.map(card => ({ ...card, faceDown: false })), // Reveal all cards
            pv: playerValue,
            dv: dealerFullValue,
            game_state: 'finished',
            stake: stake,
            final: true,
            result: 'blackjack',
            payout: stake * 2.5,
            ref: Date.now().toString()
          };
        }
      }
      
      return {
        player: playerCards,
        dealer: dealerCards,
        pv: playerValue,
        dv: dealerValue,
        game_state: gameState,
        stake: stake,
        final: final,
        ref: Date.now().toString() // Reference for state tracking
      };
    }

    if (action === 'hit') {
      if (!currentState || !currentState.player) {
        throw new Error('No active game to hit on');
      }
      
      // Add new card to player
      const newCard = this.dealCard();
      const newPlayerCards = [...currentState.player, newCard];
      const newPlayerValue = this.calculateHandValue(newPlayerCards);
      
      let gameState = 'playing';
      let final = false;
      
      if (newPlayerValue > 21) {
        // Player busts
        gameState = 'bust';
        final = true;
      } else if (newPlayerValue === 21) {
        // Player has 21 - stand automatically
        return this.playBlackjack('stand', currentState.stake, {
          ...currentState,
          player: newPlayerCards,
          pv: newPlayerValue
        });
      }
      
      return {
        ...currentState,
        player: newPlayerCards,
        pv: newPlayerValue,
        game_state: gameState,
        final: final
      };
    }

    if (action === 'stand') {
      if (!currentState || !currentState.player) {
        throw new Error('No active game to stand on');
      }
      
      // Dealer plays
      const dealerResult = this.playDealerHand(currentState.dealer, currentState.pv);
      const finalDealerValue = this.calculateHandValue(dealerResult.dealerCards);
      
      // Determine winner
      let result = 'lose';
      let winnings = 0;
      
      // Check for Blackjack scenarios first
      const isPlayerBlackjack = currentState.pv === 21 && currentState.player.length === 2;
      const isDealerBlackjack = finalDealerValue === 21 && dealerResult.dealerCards.length === 2;
      
      if (isPlayerBlackjack && isDealerBlackjack) {
        result = 'push';
        winnings = currentState.stake;
      } else if (isPlayerBlackjack && !isDealerBlackjack) {
        result = 'blackjack';
        winnings = currentState.stake * 2.5;
      } else if (!isPlayerBlackjack && isDealerBlackjack) {
        result = 'lose';
        winnings = 0;
      } else if (currentState.pv > 21) {
        result = 'bust';
        winnings = 0;
      } else if (finalDealerValue > 21) {
        result = 'win';
        winnings = currentState.stake * 2;
      } else if (currentState.pv > finalDealerValue) {
        result = 'win';
        winnings = currentState.stake * 2;
      } else if (currentState.pv === finalDealerValue) {
        result = 'push';
        winnings = currentState.stake;
      } else {
        result = 'lose';
        winnings = 0;
      }
      
      if (winnings > 0) {
        await this.credit(winnings);
      }
      
      return {
        ...currentState,
        dealer: dealerResult.dealerCards,
        dv: finalDealerValue,
        game_state: 'finished',
        final: true,
        result: result,
        payout: winnings
      };
    }

    if (action === 'double') {
      if (!currentState || currentState.player.length !== 2) {
        throw new Error('Can only double on initial two cards');
      }
      
      await this.debit(currentState.stake);
      const newStake = currentState.stake * 2;
      
      // Deal one card and stand
      const newCard = this.dealCard();
      const newPlayerCards = [...currentState.player, newCard];
      const newPlayerValue = this.calculateHandValue(newPlayerCards);
      
      if (newPlayerValue > 21) {
        // Player busts on double
        await this.credit(0); // No winnings
        return {
          ...currentState,
          player: newPlayerCards,
          pv: newPlayerValue,
          stake: newStake,
          game_state: 'finished',
          final: true,
          result: 'bust',
          payout: 0
        };
      }
      
      // Auto-stand after double, dealer plays
      return this.playBlackjack('stand', newStake, {
        ...currentState,
        player: newPlayerCards,
        pv: newPlayerValue,
        stake: newStake
      });
    }

    if (action === 'split') {
      if (!currentState || currentState.player.length !== 2 || currentState.player[0].rank !== currentState.player[1].rank) {
        throw new Error('Can only split pairs');
      }
      
      await this.debit(currentState.stake);
      
      // Create two hands
      const leftHand = [currentState.player[0], this.dealCard()];
      const rightHand = [currentState.player[1], this.dealCard()];
      
      // For now, play left hand only (simplified)
      const leftValue = this.calculateHandValue(leftHand);
      
      return {
        ...currentState,
        player: leftHand,
        pv: leftValue,
        stake: currentState.stake * 2,
        game_state: 'playing',
        split_hands: {
          left: leftHand,
          right: rightHand
        }
      };
    }

    if (action === 'insurance') {
      const insuranceBet = currentState.stake / 2;
      await this.debit(insuranceBet);
      
      // Check if dealer has blackjack
      const dealerFullValue = this.calculateHandValue(currentState.dealer);
      if (dealerFullValue === 21) {
        // Insurance pays 2:1
        await this.credit(currentState.stake + insuranceBet * 2);
        return {
          ...currentState,
          stake: currentState.stake + insuranceBet,
          game_state: 'finished',
          final: true,
          result: 'insurance_win',
          payout: currentState.stake + insuranceBet * 2
        };
      } else {
        // Insurance lost, continue game
        return {
          ...currentState,
          stake: currentState.stake + insuranceBet,
          game_state: 'playing'
        };
      }
    }

    if (action === 'surrender') {
      const surrenderReturn = currentState.stake / 2;
      await this.credit(surrenderReturn);
      
      return {
        ...currentState,
        game_state: 'finished',
        final: true,
        result: 'surrender',
        payout: surrenderReturn
      };
    }
  }

  dealCard() {
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
    
    return {
      suit: suits[this.generateRandomInt(0, 3)],
      rank: ranks[this.generateRandomInt(0, 12)]
    };
  }

  calculateHandValue(cards, showFaceDown = false) {
    let value = 0;
    let aces = 0;

    for (const card of cards) {
      // Skip face-down cards unless explicitly showing them
      if (card.faceDown && !showFaceDown) continue;
      if (card.rank === 'hidden') continue;
      
      if (card.rank === 'ace') {
        aces++;
        value += 11;
      } else if (['jack', 'queen', 'king'].includes(card.rank)) {
        value += 10;
      } else {
        value += parseInt(card.rank);
      }
    }

    // Adjust for aces
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  playDealerHand(dealerCards, playerValue = null) {
    let cards = [...dealerCards];
    
    // Reveal the face-down card (hole card)
    cards = cards.map(card => ({ ...card, faceDown: false }));
    
    let value = this.calculateHandValue(cards, true); // Show all cards now
    
    // Dealer must hit on soft 17 and below
    while (value < 17 || (value === 17 && this.hasSoftAce(cards))) {
      cards.push(this.dealCard());
      value = this.calculateHandValue(cards, true);
    }
    
    return {
      dealerCards: cards,
      finalValue: value
    };
  }

  hasSoftAce(cards) {
    let value = 0;
    let hasAce = false;
    
    for (const card of cards) {
      if (card.rank === 'ace') hasAce = true;
      value += this.getCardValue(card);
    }
    
    return hasAce && value <= 21;
  }

  getCardValue(card) {
    if (card.rank === 'ace') return 11;
    if (['jack', 'queen', 'king'].includes(card.rank)) return 10;
    return parseInt(card.rank) || 0;
  }

  calculateBlackjackWinnings(gameResult, stake) {
    switch (gameResult.result) {
      case 'win': return stake * 2;
      case 'blackjack': return stake * 2.5;
      case 'push': return stake;
      default: return 0;
    }
  }

  // Baccarat Game Logic - Full Implementation with Third Card Rules
  async playBaccarat(betOn, stake = 0, currentState = null) {
    if (!currentState) {
      // Initial deal
      await this.debit(stake);
      
      const playerCards = [this.dealCard(), this.dealCard()];
      const bankerCards = [this.dealCard(), this.dealCard()];
      
      let playerTotal = this.calculateBaccaratTotal(playerCards);
      let bankerTotal = this.calculateBaccaratTotal(bankerCards);
      
      // Check for naturals (8 or 9) - if so, game is finished
      if (playerTotal >= 8 || bankerTotal >= 8) {
        // Game finished with naturals
        let winner = 'banker';
        if (playerTotal > bankerTotal) winner = 'player';
        else if (playerTotal === bankerTotal) winner = 'tie';
        
        let winnings = 0;
        if (betOn === winner) {
          if (winner === 'tie') winnings = stake * 8;
          else if (winner === 'banker' && betOn === 'banker') winnings = stake * 1.95;
          else winnings = stake * 2;
        }
        
        if (winnings > 0) {
          await this.credit(winnings);
        }
        
        return {
          player: playerCards,
          banker: bankerCards,
          player_total: playerTotal,
          banker_total: bankerTotal,
          winner: winner,
          winnings: winnings,
          stake: stake,
          game_state: 'finished',
          final: true,
          bet_on: betOn,
          ref: Date.now().toString()
        };
      }
      
      // Continue with third card rules
      let playerThirdCard = null;
      let bankerThirdCard = null;
      
      // Player third card rule
      if (playerTotal <= 5) {
        playerThirdCard = this.dealCard();
        playerCards.push(playerThirdCard);
        playerTotal = this.calculateBaccaratTotal(playerCards);
      }
      
      // Banker third card rule
      let bankerDraws = false;
      if (bankerTotal <= 2) {
        bankerDraws = true;
      } else if (bankerTotal === 3 && (!playerThirdCard || this.getBaccaratValue(playerThirdCard.rank) !== 8)) {
        bankerDraws = true;
      } else if (bankerTotal === 4 && playerThirdCard && [2,3,4,5,6,7].includes(this.getBaccaratValue(playerThirdCard.rank))) {
        bankerDraws = true;
      } else if (bankerTotal === 5 && playerThirdCard && [4,5,6,7].includes(this.getBaccaratValue(playerThirdCard.rank))) {
        bankerDraws = true;
      } else if (bankerTotal === 6 && playerThirdCard && [6,7].includes(this.getBaccaratValue(playerThirdCard.rank))) {
        bankerDraws = true;
      }
      
      if (bankerDraws) {
        bankerThirdCard = this.dealCard();
        bankerCards.push(bankerThirdCard);
        bankerTotal = this.calculateBaccaratTotal(bankerCards);
      }
      
      // Determine winner
      let winner = 'banker';
      if (playerTotal > bankerTotal) winner = 'player';
      else if (playerTotal === bankerTotal) winner = 'tie';
      
      // Calculate winnings
      let winnings = 0;
      if (betOn === winner) {
        if (winner === 'tie') winnings = stake * 8;
        else if (winner === 'banker' && betOn === 'banker') winnings = stake * 1.95;
        else winnings = stake * 2;
      }
      
      if (winnings > 0) {
        await this.credit(winnings);
      }
      
      return {
        player: playerCards,
        banker: bankerCards,
        player_total: playerTotal,
        banker_total: bankerTotal,
        winner: winner,
        winnings: winnings,
        stake: stake,
        game_state: 'finished',
        final: true,
        bet_on: betOn,
        player_third_card: playerThirdCard,
        banker_third_card: bankerThirdCard,
        ref: Date.now().toString()
      };
    }
    
    // This should never be reached since the game completes in one call
    throw new Error('Baccarat game should complete in one call');
  }

  calculateBaccaratTotal(cards) {
    let total = 0;
    for (const card of cards) {
      const value = this.getBaccaratValue(card.rank);
      total += value;
    }
    return total % 10;
  }

  getBaccaratValue(rank) {
    if (['jack', 'queen', 'king'].includes(rank)) return 0;
    if (rank === 'ace') return 1;
    return parseInt(rank);
  }

  // Crash Game Logic - Full Implementation
  async playCrash(stake, autoCashout = null, currentMultiplier = 1) {
    if (autoCashout && currentMultiplier >= autoCashout) {
      // Auto-cashout triggered
      const winnings = stake * currentMultiplier;
      await this.credit(winnings);
      
      return {
        action: 'auto_cashout',
        multiplier: currentMultiplier,
        winnings: winnings,
        stake: stake,
        auto_cashout: autoCashout
      };
    }

    // Generate crash point (1.00x to 1000x)
    const crashPoint = this.generateCrashPoint();
    
    // Check if player would have won or lost
    let result = 'lose';
    let winnings = 0;
    
    if (currentMultiplier < crashPoint) {
      // Player could have cashed out before crash
      if (autoCashout && autoCashout < crashPoint) {
        result = 'win';
        winnings = stake * autoCashout;
        await this.credit(winnings);
      }
    } else {
      // Player crashed
      result = 'crash';
    }
    
    // Simulate flight time
    const flightTime = Math.min(crashPoint * 100, 10000); // Max 10 seconds

    return {
      action: 'crash',
      crash_point: crashPoint,
      flight_time: flightTime,
      stake: stake,
      auto_cashout: autoCashout,
      result: result,
      winnings: winnings,
      multiplier: crashPoint
    };
  }

  // Manual cashout during flight
  async manualCashout(stake, currentMultiplier) {
    const winnings = stake * currentMultiplier;
    await this.credit(winnings);
    
    return {
      action: 'manual_cashout',
      multiplier: currentMultiplier,
      winnings: winnings,
      stake: stake
    };
  }

  generateCrashPoint() {
    // Realistic crash point distribution
    const r = Math.random();
    if (r < 0.1) return this.generateRandom(1, 2);      // 10% chance 1-2x
    if (r < 0.3) return this.generateRandom(2, 5);      // 20% chance 2-5x
    if (r < 0.6) return this.generateRandom(5, 10);     // 30% chance 5-10x
    if (r < 0.8) return this.generateRandom(10, 50);    // 20% chance 10-50x
    if (r < 0.95) return this.generateRandom(50, 200);  // 15% chance 50-200x
    return this.generateRandom(200, 1000);              // 5% chance 200-1000x
  }

  // Slots Game Logic
  async spinSlots(stake) {
    await this.debit(stake);

    // Generate 5 reels, each with 3 symbols
    const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7️⃣'];
    const reels = Array.from({length: 5}, () => 
      Array.from({length: 3}, () => symbols[this.generateRandomInt(0, 7)])
    );

    // Calculate winnings
    const winnings = this.calculateSlotsWinnings(reels, stake);
    
    if (winnings > 0) {
      await this.credit(winnings);
    }

    return {
      reels: reels,
      winnings: winnings,
      stake: stake,
      payout: winnings
    };
  }

  calculateSlotsWinnings(reels, stake) {
    // Get the middle row (index 1) from each reel
    const middleRow = reels.map(reel => reel[1]);
    
    // Check for three of a kind in the middle row
    if (middleRow[0] === middleRow[1] && middleRow[1] === middleRow[2]) {
      const symbol = middleRow[0];
      const multipliers = {
        '🍒': 2,
        '🍋': 5,
        '🍊': 10,
        '🍇': 15,
        '🔔': 20,
        '⭐': 50,
        '💎': 100,
        '7️⃣': 500
      };
      return stake * (multipliers[symbol] || 1);
    }

    // Check for two of a kind in the middle row
    if (middleRow[0] === middleRow[1] || middleRow[1] === middleRow[2] || middleRow[0] === middleRow[2]) {
      return stake * 1.5;
    }

    // Check for diagonal wins (top-left to bottom-right)
    const diagonal1 = [reels[0][0], reels[1][1], reels[2][2]];
    if (diagonal1[0] === diagonal1[1] && diagonal1[1] === diagonal1[2]) {
      const symbol = diagonal1[0];
      const multipliers = {
        '🍒': 2,
        '🍋': 5,
        '🍊': 10,
        '🍇': 15,
        '🔔': 20,
        '⭐': 50,
        '💎': 100,
        '7️⃣': 500
      };
      return stake * (multipliers[symbol] || 1);
    }

    // Check for diagonal wins (top-right to bottom-left)
    const diagonal2 = [reels[0][2], reels[1][1], reels[2][0]];
    if (diagonal2[0] === diagonal2[1] && diagonal2[1] === diagonal2[2]) {
      const symbol = diagonal2[0];
      const multipliers = {
        '🍒': 2,
        '🍋': 5,
        '🍊': 10,
        '🍇': 15,
        '🔔': 20,
        '⭐': 50,
        '💎': 100,
        '7️⃣': 500
      };
      return stake * (multipliers[symbol] || 1);
    }

    return 0;
  }

  // WebSocket Simulation for Crash
  simulateCrashWebSocket(onUpdate, onCrash) {
    const crashPoint = this.generateCrashPoint();
    let multiplier = 1.0;
    
    const interval = setInterval(() => {
      multiplier += this.generateRandom(0.01, 0.05);
      
      if (multiplier >= crashPoint) {
        clearInterval(interval);
        onCrash(crashPoint);
      } else {
        onUpdate(multiplier);
      }
    }, 100);

    return interval;
  }
}

// Export singleton instance
export default new CasinoGameEngine();
