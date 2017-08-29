var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';

// User should press 'Start', fadeIn instructions on top with an "x" to close and a button close
// Loading screen, if needed, while AJAX calls request pics of doges
// Game board loads with 4x4 layout, cards face down
// Timer starts when a card is flipped
// 		1. On click of a card, it flips and reveals a doge
// 		2. On click of a second card, it also flips and reveals a doge
// 		3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
// 		4. Once the # of matches = 8, then the timer stops and the game is over.
// 		5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.

cardGame.getContent = () => {
    $.ajax({
        url: `http://api.petfinder.com/pet.find?format=json&key=${cardGame.key}&callback=?`,
        method: 'GET',
        dataType: 'jsonp',
        data: {
            key: cardGame.key,
            location: 'Toronto, On',
            animal: 'dog',
            format: 'json'
        }
    }).then(function(res) {
        console.log(res.petfinder.pets.pet);
    });
}
cardGame.displayContent = () => {

}

cardGame.events = () => {

}

cardGame.init = () => {
    cardGame.events();
    cardGame.getContent();
};

$(() => {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end