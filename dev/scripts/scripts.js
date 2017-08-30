var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];

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
        url: `http://api.petfinder.com/pet.find`,
        method: 'GET',
        dataType: 'jsonp',
        data: {
            key: cardGame.key,
            location: 'Toronto, On',
            animal: 'dog',
            format: 'json',
            callback: "?"
        }
    }).then(function (res) {
        console.log(res.petfinder.pets.pet);
        let petData = res.petfinder.pets.pet;

        petData.forEach((dog)=>{
            cardGame.dogPics.push(dog.media.photos.photo[2]["$t"]);
        });

        for (let i=0; i<8; i++){
            let randomPick = Math.floor(Math.random()*cardGame.dogPics.length);
            cardGame.randPics.forEach( (pic)=> {
                while(cardGame.dogPics[randomPick] === pic) {
                    randomPick = Math.floor(Math.random()*cardGame.dogPics.length);
                }
            });
            cardGame.randPics.push(cardGame.dogPics[randomPick]);
            cardGame.randPics.push(cardGame.dogPics[randomPick]);
        }

        cardGame.displayContent();
    });
}

cardGame.events = () => {
    $('.startBtn').on('click', () => {
        swal({
            title: "Sweet!",
            text: "Here's a custom image.",
            imageUrl: "images/thumbs-up.jpg"
        }, ()=>{
            cardGame.getContent();
        });   
    });
}

cardGame.matchGame = () => {
$('.card').on('click', (e) => {
        let c = e.currentTarget.classList;
        if (c.contains('flipped') === true) {
            c.remove('flipped');
        }  else {
            c.add('flipped');
        }
    });
}

cardGame.displayContent = () => {
    $('.card__front').each( (i,el)=>{
        $(el).empty();
        let randClass = Math.floor(Math.random()*cardGame.randPics.length);
        let picsToUse = cardGame.randPics;
        let classNum = randClass.toString();
        let className = `dogPics${randClass}`;

        $(el).append(`<img src=${picsToUse.splice(Math.floor(Math.random()*picsToUse.length),1)}>`);
        console.log(picsToUse);
        $(el).addClass(className);
    });   
}

cardGame.init = () => {
    cardGame.events();
    cardGame.matchGame();
};

$(() =>{
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
