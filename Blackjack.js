/* ====================== */
/* 1. Deck and Game State */
/* ====================== */
const deck = ["2♠","2♥","2♦","2♣" ,"3♠","3♥","3♦","3♣" ,"4♠","4♥","4♦","4♣"
  ,"5♠","5♥","5♦","5♣" ,"6♠","6♥","6♦","6♣" ,"7♠","7♥","7♦","7♣"
  ,"8♠","8♥","8♦","8♣" ,"9♠","9♥","9♦","9♣" ,"10♠","10♥","10♦","10♣"
  ,"J♠","J♥","J♦","J♣" ,"Q♠","Q♥","Q♦","Q♣" ,"K♠","K♥","K♦","K♣" ,"A♠","A♥","A♦","A♣" ];
const usedCards = [];
let isPlayerTurn = true;

let playerValueDisplay = document.getElementById("P-Value");
let dealerValueDisplay = document.getElementById("D-Value");

/* ====================== */
/* 2. Button Wiring       */
/* ====================== */
const startBtn = document.getElementById("startRound");
const hitBtn = document.getElementById("hitButton");
const stayBtn = document.getElementById("stayButton");

startBtn.addEventListener("click", startRound);
stayBtn.addEventListener("click",stay);
hitBtn.addEventListener("click", async () => {
  if (isPlayerTurn) {
    await hit();
    playerValue=calculateHandValue(document.getElementById("playersHand"));
    playerValueDisplay.innerHTML=playerValue;
    if (playerValue >= 21) {
      endRound();
    }
  }
});
hitBtn.disabled = true;
stayBtn.disabled = true;

/* ====================== */
/* 3. Core Game Functions */
/* ====================== */
async function startRound() {
  hitBtn.disabled = false;
  stayBtn.disabled = false;
  startBtn.disabled = true;
  playerValueDisplay.innerHTML="0";
  dealerValueDisplay.innerHTML="0";
  isPlayerTurn = true; // Reset the turn to the player
  console.log("round started");
  await resetHands();
  await hit(); // Player's first card
    playerValue=calculateHandValue(document.getElementById("playersHand"));
    playerValueDisplay.innerHTML=playerValue;
  await new Promise((resolve) => setTimeout(resolve, 200)); // Small delay
  await hit(); // Player's second card
    playerValue=calculateHandValue(document.getElementById("playersHand"));
    playerValueDisplay.innerHTML=playerValue;
}

function endRound() {
  const playerValue = calculateHandValue(document.getElementById("playersHand"));
  const dealerValue = calculateHandValue(document.getElementById("dealersHand"));

  /* outcomes */
  if (playerValue === 21) {
    console.log("Player wins by hitting BlackJack!")
  } else if (playerValue > 21) {
    console.log("Player busts! Dealer wins.");
  } else if (dealerValue > 21) {
    console.log("Dealer busts! Player wins.");
  } else if (playerValue > dealerValue) {
    console.log("Player wins!");
  } else if (dealerValue > playerValue) {
    console.log("Dealer wins!");
  } else {
    console.log("It's a tie!");
  }

  // Reset for next round
  isPlayerTurn = true;
  usedCards.length = 0;
  hitBtn.disabled = true;
  stayBtn.disabled = true;
  startBtn.disabled = false;
}

function calculateHandValue(handElement) {
  const cards = Array.from(handElement.children).map(li => li.textContent);
  let value = 0;
  let aces = 0;

  /* value scoring */
  cards.forEach(card => {
    const rank = card.slice(0, -1); // Remove the suit ("A♠" -> "A")
    if (rank === "J" || rank === "Q" || rank === "K") {
      value += 10; /* face cards */
    } else if (rank === "A") {
      value += 11; /* aces */
      aces++;
    } else {
      value += parseInt(rank, 10); /* numbered cards */
    }
  });

  // Adjust Aces if value exceeds 21
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

/* ====================== */
/* 4. Player and Dealer Actions */
/* ====================== */
function hit() {
  console.log("*hits*");
  return new Promise((resolve) => {
    const drawnCard = generateRandomCard();
    usedCards.push(drawnCard);
    console.log("drawn cards: " + usedCards);

    const playerHand = document.getElementById("playersHand");
    const playerCard = document.createElement("li");
    playerCard.textContent = drawnCard;
    playerHand.append(playerCard);

    // Force a reflow to ensure the initial state is applied
    void playerCard.offsetHeight; /* without it animation is broken because
    li is getting added and DOM doesnt have time to calculate before animation start*/

    /* animation */
    playerCard.style.opacity = '100%';
    playerCard.style.transform = 'translate(0, 0)';
    playerCard.style.rotate = '0deg';

    // Wait for the animation to finish
    playerCard.addEventListener('transitionend', () => {
      resolve();
    }, { once: true });
  });
}

function stay() {
  console.log("*stays*");
  isPlayerTurn = false;
  dealerTurn();
}

function hitDealer() {
  return new Promise((resolve) => {
    const drawnCard = generateRandomCard();
    usedCards.push(drawnCard);
    console.log("dealer draws: " + drawnCard);

    const dealersHand = document.getElementById("dealersHand");
    const dealerCard = document.createElement("li");
    dealerCard.textContent = drawnCard;
    dealersHand.append(dealerCard);

    // Force a reflow to ensure the initial state is applied
    void dealerCard.offsetHeight;

    /* animation */
    dealerCard.style.opacity = '100%';
    dealerCard.style.transform = 'translate(0, 0)';
    dealerCard.style.rotate = '0deg';

    // Wait for the animation to finish
    dealerCard.addEventListener('transitionend', () => {
      resolve(); // Resolve the Promise after the animation completes
    }, { once: true });
  });
}

async function dealerTurn() {
  console.log("Dealer's turn starts");
  const dealersHand = document.getElementById("dealersHand");
  let dealerValue = calculateHandValue(dealersHand);

  // Dealer draws cards until their hand value is 17 or higher
  while (dealerValue < 17) {
    await hitDealer(); // Draw a card for the dealer
    dealerValue = calculateHandValue(dealersHand); // Recalculate dealer's hand value
    dealerValueDisplay.innerHTML=dealerValue;
    console.log("Dealer's hand value:", dealerValue);
  }

  endRound(); // End the round after the dealer finishes their turn
}

/* ====================== */
/* 5. Helper Functions    */
/* ====================== */
function generateRandomCard() {
  if (usedCards.length === deck.length || usedCards.length > deck.length) {
    console.log("no more cards left.");
    endRound();
    return null;
  } else {
    console.log("generating random card");
    const randomCard = deck[Math.floor(Math.random() * deck.length)];
    console.log(randomCard);
    if (usedCards.includes(randomCard)) {
      console.log("card is out");
      return generateRandomCard();
    } else {
      return randomCard;
    }
  }
}

function resetHands() {
  return new Promise((resolve) => {
    const playersHand = document.getElementById('playersHand');
    const cards = playersHand.children;
    const dealersHand = document.getElementById('dealersHand');
    const dealercards = dealersHand.children;

    Array.from(dealercards).forEach((card, index) => {
      setTimeout(() => {
        /* dissintigrate animation */
        card.style.opacity = '0';
        card.style.rotate = '15deg';
        card.style.transform = 'translate(200%, -200%)';
      }, index * 100);
    });

    setTimeout(() => {
      dealersHand.innerHTML = '';
    }, (dealercards.length) * 100);

    Array.from(cards).forEach((card, index) => {
      setTimeout(() => {
        /* dissintigrate animation */
        card.style.opacity = '0';
        card.style.rotate = '15deg';
        card.style.transform = 'translate(200%, -200%)';
      }, index * 100);
    });

    setTimeout(() => {
      playersHand.innerHTML = '';
      resolve();
    }, (cards.length + 1) * 100);
  });
}
/*
//TODO: CALLBACKS:
venter på at en function blir gjort ferdig før den kjører

sync program kjører:
prossess 1
prossess 2
prossess 3

async kan:
prossess 2
prossess 3
prossess 1
hvor prossess 1 tar tid

//TODO: PROMISE:
kan returnere success eller failure
sender tilbake en value

success = resolve (resolver promisen)
failure = reject (rejecter promisen)

hvis den ikke får en eller annen kommer feilmelding i compileren

//TODO: .THEN og .CATCH:
to ting man kan bruke på en promise

if resolve: .then
if reject: .catch

//TODO: AWAIT:
den venter på at noe executer før den fortsetter

await openLaptop();

//TODO: RECURSION:
function som caller seg selv

base case: a condition to stop the recursion
otherwise så blir den infinite

recursive calls: a function calls itself to reduce the problem
disse kan man kalle subproblems og de må reache en base case, otherwise infinite (error)

 */

