var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.gameStart = false;
cardGame.previous = "";

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
        let petData = res.petfinder.pets.pet;

        petData.forEach((dog) => {
            cardGame.dogPics.push(dog.media.photos.photo[2]["$t"]);
        });

        for (let i = 0; i < 8; i++) {
            let randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
            cardGame.randPics.forEach((pic) => {
                while (cardGame.dogPics[randomPick] === pic) {
                    randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
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
            text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos architecto quaerat omnis minus excepturi ut praesentium, soluta laudantium perspiciatis inventore? Ea assumenda tempore natus ducimus ipsum laudantium officiis, enim voluptas.",
            imageUrl: "https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg"
        }, () => {
            cardGame.getContent();
        });
    });
}

cardGame.matchGame = () => {
    let counter = 0;
    cardGame.previous = '';
    let current = '';

    $('.card').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cardGame.gameStart = true;
        counter++;
        let c = e.currentTarget.classList;
        if (c.contains('flipped') === true) {
            c.remove('flipped');
            console.log("remove flip");
        } else {
            c.add('flipped');
        }

        if (counter === 2) {
            cardGame.gameFx($(this), cardGame.previous);
            counter = 0;
        } else if (counter === 1) {
            cardGame.previous = $(this);
        } else {
            counter = 0;
        }
    });
}

cardGame.displayContent = () => {
    $('.card__front').each((i, el) => {
        $(el).empty();
        let randClass = Math.floor(Math.random() * cardGame.randPics.length);
        let picsToUse = cardGame.randPics;
        let classNum = randClass.toString();
        let className = `dogPics${randClass}`;
        let randPic = Math.floor(Math.random() * picsToUse.length);
        let picString = picsToUse.splice(randPic, 1);
        $(el).attr('style', `background-image: url(${picString[0]})`);
        $(el).addClass(className);
    });
    cardGame.matchGame();
}

cardGame.gameFx = (current, prev) => {
    let currentDogPicsClass = "";
    currentDogPicsClass = current.children(".card__front").attr('class');
    currentDogPicsClass = "." + currentDogPicsClass.replace("card__front ", "");
    let previousDogPicsClass = "";
    previousDogPicsClass = prev.children(".card__front").attr('class');
    previousDogPicsClass = "." + previousDogPicsClass.replace("card__front ", "");
    if ($(currentDogPicsClass).css('background-image') === $(previousDogPicsClass).css('background-image')) {
        current.addClass('match');
    } else {
        setTimeout( () => {
            current.removeClass('flipped');
            prev.removeClass('flipped');            
        },1500);
    }






    //    if ($('').css('background-image') === $('').css('background-image')) {
    //        
    //    }
}





//    3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped.



cardGame.init = () => {
    cardGame.events();
};

$(() => {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
