var cardGame = {};
cardGame.key = 'E4iaH4cgjoYeVbN7mDlNf1WcbMvEG3QM9qpH1UeXXp5Y36rbZs';
cardGame.secret = "3oWkr1dFy74ASPoo1zQz5uVvQ42n13xdD9Q9XDmk";
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.timer = 0;
cardGame.counter = 0
cardGame.gameStart = false;
cardGame.previous;
cardGame.clickAllowed = true;
cardGame.matches = 0;
cardGame.leadBoard = firebase.database().ref();

// User should press 'Start', fadeIn instructions on top with an "x" to close and a button close
// Loading screen, if needed, while AJAX calls request pics of doges
// Game board loads with 4x4 layout, cards face down
// Timer starts when a card is flipped
// 		1. On click of a card, it flips and reveals a doge
// 		2. On click of a second card, it also flips and reveals a doge
// 		3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
// 		4. Once the # of matches = 8, then the timer stops and the game is over.
// 		5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.
//leaderboard Firebase

cardGame.newLead = (timer, string) => {
    let username = 'noName';
    $('#playerName').empty();
    if ($('#playerName').val() != "") {
        username = $('#playerName').val();
    }
    cardGame.leadBoard.push({
        name: username,
        time: timer,
        timeString: string
    })
}

cardGame.displayLead = () => {
    cardGame.leadBoard.on("value", (scores) => {
        let topFive = [];
        let dataArray = scores.val();
        let scoresArray = [];
        let boardString = '<h2>Leaderboard</h2>';


        for (let key in dataArray) {
            scoresArray.push(dataArray[key]);
        }

        scoresArray.sort((a, b) => {
            return a.time - b.time;
        })

        for (let i = 0; i < 5; i++) {
            boardString += (`<p>${scoresArray[i].name} : ${scoresArray[i].timeString}</p>`);
        }
        $('.leaderBoard').html(boardString);
    })
}

//AJAX call to Petfinder API
cardGame.getContent = () => {
    const body = {
        grant_type: 'client_credentials',
        client_id: cardGame.key,
        client_secret: cardGame.secret,
    };

    $.ajax({
        url: `https://api.petfinder.com/v2/oauth2/token`,
        method: 'POST',
        dataType: 'json',
        data: body
    }).done(function (oauthRes) {
        $.ajax({
            url: `https://api.petfinder.com/v2/animals`,
            method: 'GET',

            data: {
                type: 'dog',
                breed: 'pug',
                sort: 'random',
                limit: 8
            },
            beforeSend: function (request) {
                request.setRequestHeader("Authorization", "Bearer " + oauthRes.access_token)
            }
        }).done(function (res) {
            //pick random photos from the API
            cardGame.pickRandPhotos(res);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Petfinder fail");
            console.error({
                jqXHR,
                textStatus,
                errorThrown
            })
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("OAuth fail");
        console.error({
            jqXHR,
            textStatus,
            errorThrown
        })
    });
}

//function to grab 8 random photos from API for the card faces
cardGame.pickRandPhotos = (res) => {
    let petData = res.animals;

    //save all pet photos
    petData.forEach((dog) => {
        let randomPic = Math.floor(Math.random() * dog.photos.length);
        cardGame.dogPics.push(dog.photos[randomPic].full);
    });

    //pick 8 random ones
    while (cardGame.dogPics.length > 0) {
        let randomPick = Math.floor(Math.random() * cardGame.dogPics.length),
            picked = cardGame.dogPics.splice(randomPick, 1);
        //double up for matching (8 photos = 16 cards)
        cardGame.randPics.push(picked);
        cardGame.randPics.push(picked);
    }
    //append the dog pics to the cards on the page
    cardGame.displayContent();
}

//event handler function
cardGame.events = () => {
    $('.startBtn').on('click', (e) => {
        e.preventDefault();
        swal({
            title: 'Welcome!',
            text: 'Find all the matches as quick as you can, and see if you make your way to the top of our leaderboard! Wroof!',
            imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
        }).then(() => {
            //make AJAX call after user clicks OK on the alert
            cardGame.getContent();
            $('#game').css('display', 'block');
            $('#landingPage').css('display', 'none');
            cardGame.displayLead();
        });
    });
}

cardGame.matchGame = () => {
    cardGame.previous = '';
    let current = '';
    if (cardGame.clickAllowed) {
        cardGame.gameStart = true;
        $('.card').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cardGame.counter++;

            //start the timer after the first card is clicked
            if (cardGame.gameStart) {
                cardGame.showTimer();
            }
            //run function handling game effects and mechanics
            cardGame.gameFX($(this), e.currentTarget.classList, cardGame.counter);
        });
    }
}

//function for game effects and mechanics
cardGame.gameFX = (element, c, counter) => {
    //flip card if card is face down, otherwise do nothing
    $('#score').text(cardGame.matches);

    if (!(c.contains('flipped') || c.contains('match'))) {
        c.add('flipped');
        //check for match after 2 cards flipped
        if (counter >= 2) {
            cardGame.clickAllowed = false;
            cardGame.checkMatch(element, cardGame.previous);
            cardGame.counter = 0;
        } else if (counter === 1) {
            //on the first click, save this card for later
            cardGame.previous = element;
        }
    }
}

//calculate and display timer on page
cardGame.showTimer = () => {
    let timeString = "",
        secondsString = "",
        minutesString = "",
        subSecondsString = "",
        minutes, seconds, subSeconds;
    cardGame.gameStart = false;

    if (cardGame.matches < 8) {
        //timer format mm:ss.xx
        cardGame.interval = setInterval(() => {
            cardGame.timer++;
            subSeconds = cardGame.timer % 100;
            subSecondsString = subSeconds.toString();
            seconds = Math.floor(cardGame.timer / 100) % 60;
            minutes = ((cardGame.timer / 100) / 60) % 60;
            if (seconds <= 9) {
                secondsString = '0' + seconds.toString();
            } else {
                secondsString = seconds.toString();
            }

            minutesString = Math.floor(minutes).toString();
            cardGame.timeString = `${minutesString}:${secondsString}.${subSeconds}`
            $('#time').text(cardGame.timeString);
            if (cardGame.matches >= 8) {
                cardGame.gameStart = false;
                clearInterval(cardGame.interval);
                setTimeout(() => {
                    swal({
                        title: 'You did it!',
                        html: `Your final time: ${cardGame.timeString}
                            <a href="https://twitter.com/share"<span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-twitter fa-inverse fa-stack-1x"></i></span></a>`,
                        imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
                    }).then(() => {
                        //make AJAX call after user clicks OK on the alert
                        cardGame.newLead(cardGame.timer, cardGame.timeString);
                    });
                }, 1000)
            }
        }, 10);
    }
}

cardGame.displayContent = () => {
    //make an array of numbers from 1-16 for card identification
    let pickArray = [];
    for (let i = 1; i <= 16; i++) {
        pickArray.push(i);
    }

    //assign a card pic to each div
    $('.card__front').each((i, el) => {
        $(el).empty();

        //assign a random card number to the current div.card
        let randClass = pickArray.splice(Math.floor(Math.random() * cardGame.randPics.length), 1);
        let picsToUse = cardGame.randPics;
        let classNum = randClass.toString();

        //assign the equivalent .dogPics# class to the div
        let className = `dogPics${randClass}`;

        //background image of the div is a random dog
        let randPic = Math.floor(Math.random() * picsToUse.length);
        let picString = picsToUse.splice(randPic, 1);
        $(el).attr('style', `background-image: url(${picString[0]})`);
        $(el).addClass(className);
    });
    //start the game
    cardGame.matchGame();
}

//check for matches between the two clicked cards
cardGame.checkMatch = (current, prev) => {
    //isolate the dogPics# class from .card__front of both cards
    let currentDogPicsClass = "";
    currentDogPicsClass = current.children('.card__front').attr('class');
    currentDogPicsClass = "." + currentDogPicsClass.replace('card__front ', '');
    let previousDogPicsClass = '';
    previousDogPicsClass = prev.children('.card__front').attr('class');
    previousDogPicsClass = '.' + previousDogPicsClass.replace('card__front ', '');

    // if the cards match, give them a class of match
    if ($(currentDogPicsClass).css('background-image') === $(previousDogPicsClass).css('background-image')) {
        current.addClass('match');
        prev.addClass('match');
        cardGame.matches++;
        $('#score').text(cardGame.matches);
    } // remove the class of flipped
    setTimeout(() => {
        //if cards don't have a flipped class, they flip back
        //if cards have a class of match, they stay flipped
        current.removeClass('flipped');
        prev.removeClass('flipped');
        cardGame.clickAllowed = true;
    }, 1000);
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