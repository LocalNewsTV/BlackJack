let currentDeck = [];
/*********************************************************************
 *  Objects for storing Player and Dealer data for ease of access
 *  id: Access point for element
 *  money: players current balance
 *  hand: total value of all card in current round
 *  ace: number of aces in players card, to determine if Ace should be 1 or 11
 *  scoreBox: pointer for dealerScore element
 *********************************************************************/
const player = {
    id: "player",
    money: 1000,
    hand: 0,
    ace: 0,
    scoreBox: "playerScore",
    bet: 0
};
const dealer = {
    id:"dealer",
    hand: 0,
    ace: 0,
    scoreBox: "dealerScore"
}
const newE = (type) => document.createElement(type)
/**********************************************************************
 * createDeck() - returns a standard deck of 52 playing cards
 **********************************************************************/
const createDeck = () => {
    const suits = ["♠", "♥", "♦", "♣"];
    const vals = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "K", "Q"];
    const deck = [];
    for(const suit in suits){
        for(const val in vals){
            deck.push(vals[val] + suits[suit]);
        }
    }
    return deck;
}
/**********************************************************************
 * drawCard() - Basic draw function removes one card from deck, and returns it 
 ***********************************************************************/
const drawCard = () => {
    const pull = Math.floor(Math.random() * currentDeck.length);
    const drawCard = currentDeck[pull]
    currentDeck.splice(pull, 1)
    return drawCard; 
}

/**********************************************************************
 * tallyScore() - Logic behind what to do after a card draw, parses the cards for
 * their values, properly filtering for face cards and aces. if the player busts
 * it skips the dealers turn and cuts to determineWinner() 
 **********************************************************************/
tallyScore = (whoseTurn, card) => {
    cardVal = card
    if(Number.isNaN(parseInt(cardVal))){ //triggered by the card being a faceCard or Ace
        if(cardVal.includes("A")){ //Then we are an Ace
            cardVal = 11;
            whoseTurn.ace += 1;
        }
        else{
            cardVal = 10;
        }
    } 
    whoseTurn.hand += parseInt(cardVal)
    if(whoseTurn.hand > 21 && whoseTurn.ace > 0){
        whoseTurn.hand -= 10;
        whoseTurn.ace -= 0;
    }
    if(whoseTurn.hand > 21){
        $(`#${whoseTurn.scoreBox}`).html("BUST");
        if(whoseTurn.id == "player"){
            determineWinner();
        }
    }
    else
        $(`#${whoseTurn.scoreBox}`).html(whoseTurn.hand)
}
/**********************************************************************
 * hitAction() - runs the steps involved for drawing a card
 **********************************************************************/
const hitAction = (whoseTurn) => {
    const draw = drawCard();
    const body = createCardBody(draw);
    $(`#${whoseTurn.id}`).append(body);
    tallyScore(whoseTurn, draw);

}
/*********************************************************************
 * createCardBody() - Creates and returns a card container that will be 
 * appended to the DOM
 *********************************************************************/
const createCardBody = (type) => {
    const cardBody = newE('div');
    $(cardBody).addClass("card");
    const cardType = newE('p');
    $(cardType).html(type);
    if(type.includes("♥") || type.includes("♦"))
        $(cardType).css("color", "red");
    $(cardBody).append(cardType);
    return cardBody;
}

/**********************************************************************
 *  betEvent() - Triggered from players pressing the bet button
 *  Determines Bet amount, toggles menus - starts game
 **********************************************************************/
const betEvent = () => {
    $('#winner').css("background", "none");
    if(player.money < 0){
        refresh();
    }
    player.bet = $('#betAmount').val();
    player.money -= player.bet;
    $('#playerMoney').html(player.money);
    $('#playerBet').html(player.bet);
    $('#stay').removeAttr("disabled");
    $('#hit').removeAttr("disabled");
    $('#game').toggle();
    $('#nogame').toggle();
    newGame();
}
/**********************************************************************
 * determineWinner() - compares players hands to the dealer and 
 * checking for busts, cashes out the player if they won
 **********************************************************************/
const determineWinner = () => {
    let winnerText; 
    let theColor = "red";
    if((player.hand > dealer.hand || dealer.hand > 21) && player.hand <= 21){
        player.money += player.bet * 2;
        $('#playerMoney').html(player.money);
    }
    if(player.hand > 21){
        winnerText = "Player Busts";
    } else if(dealer.hand === player.hand){
        winnerText = "Dealer Push";
    } else if(player.hand > dealer.hand){
        winnerText = "Player Wins";
        theColor = "green";
    } else if(dealer.hand > 21){
        winnerText = "Dealer Busts";
        theColor = "green";
    } else{
        winnerText = "Dealer Wins";
    }
    $('#winner').css({"color": theColor, "background-color": "rgba(59, 59, 56, .8)"})
    $('#winner').html(winnerText)
    $('#betAmount').attr("max", `${player.money}`)
    $('#game').toggle();
    $('#nogame').toggle();
}
/**********************************************************************
 * dealerTurn() - turn logic for dealer, disables buttons to prevent player from
 * harming the game, as in normal blackjack, the dealer will continue to
 * hit until their hand is > 16, uses recursion in anonymous function to
 * allow timeout to work
 **********************************************************************/
const dealerTurn = () => {
    $('#stay').attr("disabled", "true")
    $('#hit').attr("disabled", "true")
    if(dealer.hand < 17 && dealer.hand < player.hand){
        setTimeout(() => {hitAction(dealer); dealerTurn()}, 750);
    } else{
        determineWinner();
    }   
}
/* Cleans up the board and creates a new deck */
const newGame = () => {
    $('#winner').html("");
    if(currentDeck.length < 16)
        currentDeck = createDeck();
    player.hand = 0;
    player.ace = 0;
    dealer.hand = 0;
    dealer.ace = 0;
    $('#playerScore').html("0");
    $('#dealerScore').html("0");
    $('#player').html("");
    $('#dealer').html("");
    for(let i = 0; i < 2; i++){
        hitAction(player);
        hitAction(dealer);
    }
}
/**********************************************************************
 * Event Listeners, default #game state
 **********************************************************************/
$('#stay').on("click", () => {dealerTurn()})
$('#hit').on("click", () => {hitAction(player)});
$('#bet').on("click", () => {betEvent()});
$('#game').hide();