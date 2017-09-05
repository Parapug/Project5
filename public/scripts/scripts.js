'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.timer = 0;
cardGame.counter = 0;
cardGame.gameStart = false;
cardGame.previous;
cardGame.clickAllowed = true;
cardGame.matches = 0;
cardGame.leadBoard = firebase.database().ref();
// User should press 'Start', fadeIn instructions on top with an "x" to close and a button close
// Loading screen, if needed, while AJAX calls request pics of doges
// Game board loads with 4x4 layout, cards face down
// Timer starts when a card is flipped
//      1. On click of a card, it flips and reveals a doge
//      2. On click of a second card, it also flips and reveals a doge
//      3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
//      4. Once the # of matches = 8, then the timer stops and the game is over.
//      5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.

cardGame.newLead = function (timer, string) {
    var username = 'noName';
    $('#playerName').empty();
    if ($('#playerName').val() != "") {
        username = $('#playerName').val();
    }
    cardGame.leadBoard.push({
        name: username,
        time: timer,
        timeString: string
    });
};

cardGame.displayLead = function () {
    cardGame.leadBoard.on("value", function (scores) {
        var topFive = [];
        var dataArray = scores.val();
        var scoresArray = [];

        for (var key in dataArray) {
            scoresArray.push(dataArray[key]);
        }

        scoresArray.sort(function (a, b) {
            return a.time - b.time;
        });

        for (var i = 0; i < 5; i++) {
            $('.leaderBoard').append('<p>' + scoresArray[i].name + ' : ' + scoresArray[i].timeString);
        }
    });
};

//AJAX call to Petfinder API
cardGame.getContent = function () {
    $.ajax({
        url: 'http://api.petfinder.com/pet.find',
        method: 'GET',
        dataType: 'jsonp',
        data: {
            key: cardGame.key,
            location: 'Toronto, On',
            animal: 'dog',
            format: 'json',
            callback: "?",
            breed: "Pug"
        }
    }).then(function (res) {
        //pick random photos from the API
        cardGame.pickRandPhotos(res);
    });
};

//function to grab 8 random photos from API for the card faces
cardGame.pickRandPhotos = function (res) {
    var petData = res.petfinder.pets.pet;

    //save all pet photos
    petData.forEach(function (dog) {
        cardGame.dogPics.push(dog.media.photos.photo[2]['$t']);
    });

    //pick 8 random ones

    var _loop = function _loop(i) {
        var randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
        cardGame.randPics.forEach(function (pic) {
            while (cardGame.dogPics[randomPick] === pic) {
                randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
            }
        });
        //double up for matching (8 photos = 16 cards)
        cardGame.randPics.push(cardGame.dogPics[randomPick]);
        cardGame.randPics.push(cardGame.dogPics[randomPick]);
    };

    for (var i = 0; i < 8; i++) {
        _loop(i);
    }
    //append the dog pics to the cards on the page
    cardGame.displayContent();
};

//event handler function
cardGame.events = function () {
    $('.startBtn').on('click', function (e) {
        e.preventDefault();
        swal({
            title: 'Welcome!',
            text: 'Find all the matches as quick as you can, and see if you make your way to the top of our leaderboard! Wroof!',
            imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
        }).then(function () {
            //make AJAX call after user clicks OK on the alert
            cardGame.getContent();
            $('#game').css('display', 'block');
            $('#landingPage').css('display', 'none');
            cardGame.displayLead();
        });
    });
};

cardGame.matchGame = function () {
    cardGame.previous = '';
    var current = '';
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
};

//function for game effects and mechanics
cardGame.gameFX = function (element, c, counter) {
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
};

//calculate and display timer on page
cardGame.showTimer = function () {
    var timeString = "";
    var secondsString = "";
    var minutesString = "";
    var subSecondsString = "";
    var minutes = void 0;
    var seconds = void 0;
    var subSeconds = void 0;
    cardGame.gameStart = false;

    if (cardGame.matches < 8) {
        //timer format mm:ss.xx
        cardGame.interval = setInterval(function () {
            cardGame.timer++;
            subSeconds = cardGame.timer % 100;
            subSecondsString = subSeconds.toString();
            seconds = Math.floor(cardGame.timer / 100) % 60;
            minutes = cardGame.timer / 100 / 60 % 60;
            if (seconds <= 9) {
                secondsString = '0' + seconds.toString();
            } else {
                secondsString = seconds.toString();
            }

            minutesString = Math.floor(minutes).toString();
            cardGame.timeString = minutesString + ':' + secondsString + '.' + subSeconds;
            $('#time').text(cardGame.timeString);
            if (cardGame.matches >= 8) {
                cardGame.gameStart = false;
                clearInterval(cardGame.interval);
                setTimeout(function () {
                    swal({
                        title: 'You did it!',
                        html: 'Your final time: ' + cardGame.timeString + '\n                            <a href="https://twitter.com/share"<span class="fa-stack fa-lg"><i class="fa fa-circle fa-stack-2x"></i><i class="fa fa-twitter fa-inverse fa-stack-1x"></i></span></a>',
                        imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
                    }).then(function () {
                        //make AJAX call after user clicks OK on the alert
                        cardGame.newLead(cardGame.timer, cardGame.timeString);
                    });
                }, 1000);
            }
        }, 10);
    }
};

cardGame.displayContent = function () {
    //make an array of numbers from 1-16 for card identification
    var pickArray = [];
    for (var i = 1; i <= 16; i++) {
        pickArray.push(i);
    }

    //assign a card pic to each div
    $('.card__front').each(function (i, el) {
        $(el).empty();

        //assign a random card number to the current div.card
        var randClass = pickArray.splice(Math.floor(Math.random() * cardGame.randPics.length), 1);
        var picsToUse = cardGame.randPics;
        var classNum = randClass.toString();

        //assign the equivalent .dogPics# class to the div
        var className = 'dogPics' + randClass;

        //background image of the div is a random dog
        var randPic = Math.floor(Math.random() * picsToUse.length);
        var picString = picsToUse.splice(randPic, 1);
        $(el).attr('style', 'background-image: url(' + picString[0] + ')');
        $(el).addClass(className);
    });
    //start the game
    cardGame.matchGame();
};

//check for matches between the two clicked cards
cardGame.checkMatch = function (current, prev) {
    //isolate the dogPics# class from .card__front of both cards
    var currentDogPicsClass = "";
    currentDogPicsClass = current.children('.card__front').attr('class');
    currentDogPicsClass = "." + currentDogPicsClass.replace('card__front ', '');
    var previousDogPicsClass = '';
    previousDogPicsClass = prev.children('.card__front').attr('class');
    previousDogPicsClass = '.' + previousDogPicsClass.replace('card__front ', '');

    // if the cards match, give them a class of match
    if ($(currentDogPicsClass).css('background-image') === $(previousDogPicsClass).css('background-image')) {
        current.addClass('match');
        prev.addClass('match');
        cardGame.matches++;
        $('#score').text(cardGame.matches);
    } // remove the class of flipped
    setTimeout(function () {
        //if cards don't have a flipped class, they flip back
        //if cards have a class of match, they stay flipped
        current.removeClass('flipped');
        prev.removeClass('flipped');
        cardGame.clickAllowed = true;
    }, 1000);
};
//    3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped.

cardGame.init = function () {
    cardGame.events();
};

$(function () {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJzb3J0IiwiYSIsImIiLCJpIiwiYXBwZW5kIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiaHRtbCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsInJhbmRDbGFzcyIsInNwbGljZSIsInBpY3NUb1VzZSIsImNsYXNzTnVtIiwiY2xhc3NOYW1lIiwicmFuZFBpYyIsInBpY1N0cmluZyIsImF0dHIiLCJhZGRDbGFzcyIsInByZXYiLCJjdXJyZW50RG9nUGljc0NsYXNzIiwiY2hpbGRyZW4iLCJyZXBsYWNlIiwicHJldmlvdXNEb2dQaWNzQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImluaXQiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBVyxFQUFmO0FBQ0FBLFNBQVNDLEdBQVQsR0FBZSxrQ0FBZjtBQUNBRCxTQUFTRSxPQUFULEdBQW1CLEVBQW5CO0FBQ0FGLFNBQVNHLFFBQVQsR0FBb0IsRUFBcEI7QUFDQUgsU0FBU0ksS0FBVCxHQUFpQixDQUFqQjtBQUNBSixTQUFTSyxPQUFULEdBQW1CLENBQW5CO0FBQ0FMLFNBQVNNLFNBQVQsR0FBcUIsS0FBckI7QUFDQU4sU0FBU08sUUFBVDtBQUNBUCxTQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0FSLFNBQVNTLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQVQsU0FBU1UsU0FBVCxHQUFxQkMsU0FBU0MsUUFBVCxHQUFvQkMsR0FBcEIsRUFBckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFiLFNBQVNjLE9BQVQsR0FBbUIsVUFBQ1YsS0FBRCxFQUFRVyxNQUFSLEVBQW1CO0FBQ2xDLFFBQUlDLFdBQVcsUUFBZjtBQUNBQyxNQUFFLGFBQUYsRUFBaUJDLEtBQWpCO0FBQ0EsUUFBSUQsRUFBRSxhQUFGLEVBQWlCRSxHQUFqQixNQUEwQixFQUE5QixFQUFrQztBQUM5QkgsbUJBQVdDLEVBQUUsYUFBRixFQUFpQkUsR0FBakIsRUFBWDtBQUNIO0FB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QUtFLFFBQUwsQ0FBYyxjQUFkLEVBQThCSixJQUE5QixDQUFtQyxPQUFuQyxDQUF2QjtBQUNBTSwyQkFBdUIsTUFBTUEscUJBQXFCRCxPQUFyQixDQUE2QixjQUE3QixFQUE2QyxFQUE3QyxDQUE3Qjs7QUFFQTtBQUNBLFFBQUkvRixFQUFFNkYsbUJBQUYsRUFBdUJ0QyxHQUF2QixDQUEyQixrQkFBM0IsTUFBbUR2RCxFQUFFZ0csb0JBQUYsRUFBd0J6QyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBdkQsRUFBd0c7QUFDcEdFLGdCQUFRa0MsUUFBUixDQUFpQixPQUFqQjtBQUNBQyxhQUFLRCxRQUFMLENBQWMsT0FBZDtBQUNBNUcsaUJBQVNTLE9BQVQ7QUFDQVEsVUFBRSxRQUFGLEVBQVlxRCxJQUFaLENBQWlCdEUsU0FBU1MsT0FBMUI7QUFDSCxLQWZvQyxDQWVuQztBQUNGc0YsZUFBVyxZQUFNO0FBQ2I7QUFDQTtBQUNBckIsZ0JBQVF3QyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FMLGFBQUtLLFdBQUwsQ0FBaUIsU0FBakI7QUFDQWxILGlCQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0gsS0FORCxFQU1HLElBTkg7QUFPSCxDQXZCRDtBQXdCQTs7QUFFQVIsU0FBU21ILElBQVQsR0FBZ0IsWUFBTTtBQUNsQm5ILGFBQVNpRSxNQUFUO0FBQ0gsQ0FGRDs7QUFJQWhELEVBQUUsWUFBTTtBQUNKakIsYUFBU21ILElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XG5jYXJkR2FtZS5kb2dQaWNzID0gW107XG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xuY2FyZEdhbWUudGltZXIgPSAwO1xuY2FyZEdhbWUuY291bnRlciA9IDBcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuY2FyZEdhbWUucHJldmlvdXM7XG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuY2FyZEdhbWUubWF0Y2hlcyA9IDA7XG5jYXJkR2FtZS5sZWFkQm9hcmQgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2Vcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxuLy8gICAgICAxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gICAgICAyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gICAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXG4vLyAgICAgIDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxuLy8gICAgICA1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxuXG5jYXJkR2FtZS5uZXdMZWFkID0gKHRpbWVyLCBzdHJpbmcpID0+IHtcbiAgICBsZXQgdXNlcm5hbWUgPSAnbm9OYW1lJztcbiAgICAkKCcjcGxheWVyTmFtZScpLmVtcHR5KCk7XG4gICAgaWYgKCQoJyNwbGF5ZXJOYW1lJykudmFsKCkgIT0gXCJcIikge1xuICAgICAgICB1c2VybmFtZSA9ICQoJyNwbGF5ZXJOYW1lJykudmFsKCk7XG4gICAgfVxuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5wdXNoKHtcbiAgICAgICAgbmFtZTogdXNlcm5hbWUsXG4gICAgICAgIHRpbWU6IHRpbWVyLFxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcbiAgICB9KVxufVxuXG5jYXJkR2FtZS5kaXNwbGF5TGVhZCA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5sZWFkQm9hcmQub24oXCJ2YWx1ZVwiLCAoc2NvcmVzKSA9PiB7XG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XG4gICAgICAgIGxldCBkYXRhQXJyYXkgPSBzY29yZXMudmFsKCk7XG4gICAgICAgIGxldCBzY29yZXNBcnJheSA9IFtdO1xuXG4gICAgICAgIGZvciAobGV0IGtleSBpbiBkYXRhQXJyYXkpIHtcbiAgICAgICAgICAgIHNjb3Jlc0FycmF5LnB1c2goZGF0YUFycmF5W2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgc2NvcmVzQXJyYXkuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcbiAgICAgICAgfSlcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xuICAgICAgICAgICAgJCgnLmxlYWRlckJvYXJkJykuYXBwZW5kKGA8cD4ke3Njb3Jlc0FycmF5W2ldLm5hbWV9IDogJHtzY29yZXNBcnJheVtpXS50aW1lU3RyaW5nfWApO1xuICAgICAgICB9XG4gICAgfSlcbn1cblxuLy9BSkFYIGNhbGwgdG8gUGV0ZmluZGVyIEFQSVxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAga2V5OiBjYXJkR2FtZS5rZXksXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIixcbiAgICAgICAgICAgIGJyZWVkOiBcIlB1Z1wiXG4gICAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcbiAgICB9KTtcbn1cblxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcblxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcbiAgICB9KTtcblxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgfVxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xufVxuXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHN3YWwoe1xuICAgICAgICAgICAgdGl0bGU6ICdXZWxjb21lIScsXG4gICAgICAgICAgICB0ZXh0OiAnRmluZCBhbGwgdGhlIG1hdGNoZXMgYXMgcXVpY2sgYXMgeW91IGNhbiwgYW5kIHNlZSBpZiB5b3UgbWFrZSB5b3VyIHdheSB0byB0aGUgdG9wIG9mIG91ciBsZWFkZXJib2FyZCEgV3Jvb2YhJyxcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgJCgnI2dhbWUnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgICAgICQoJyNsYW5kaW5nUGFnZScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgICAgICBjYXJkR2FtZS5kaXNwbGF5TGVhZCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XG4gICAgbGV0IGN1cnJlbnQgPSAnJztcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKSB7XG4gICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7XG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcblxuICAgICAgICAgICAgLy9zdGFydCB0aGUgdGltZXIgYWZ0ZXIgdGhlIGZpcnN0IGNhcmQgaXMgY2xpY2tlZFxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWCgkKHRoaXMpLCBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LCBjYXJkR2FtZS5jb3VudGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcbiAgICAvL2ZsaXAgY2FyZCBpZiBjYXJkIGlzIGZhY2UgZG93biwgb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xuXG4gICAgaWYgKCEoYy5jb250YWlucygnZmxpcHBlZCcpIHx8IGMuY29udGFpbnMoJ21hdGNoJykpKSB7XG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxuICAgICAgICBpZiAoY291bnRlciA+PSAyKSB7XG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxuICAgICAgICAgICAgY2FyZEdhbWUucHJldmlvdXMgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cblxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgbWludXRlc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBtaW51dGVzO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCBzdWJTZWNvbmRzO1xuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KSB7XG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKztcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciAlIDEwMDtcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lciAvIDEwMCkgJSA2MDtcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAvIDYwKSAlIDYwO1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSAnMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lU3RyaW5nID0gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfS4ke3N1YlNlY29uZHN9YFxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FyZEdhbWUuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnWW91IGRpZCBpdCEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlXCI8c3BhbiBjbGFzcz1cImZhLXN0YWNrIGZhLWxnXCI+PGkgY2xhc3M9XCJmYSBmYS1jaXJjbGUgZmEtc3RhY2stMnhcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS10d2l0dGVyIGZhLWludmVyc2UgZmEtc3RhY2stMXhcIj48L2k+PC9zcGFuPjwvYT5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5uZXdMZWFkKGNhcmRHYW1lLnRpbWVyLCBjYXJkR2FtZS50aW1lU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTApO1xuICAgIH1cbn1cblxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDE2OyBpKyspIHtcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XG4gICAgfVxuXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICQoZWwpLmVtcHR5KCk7XG5cbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcbiAgICAgICAgbGV0IHJhbmRDbGFzcyA9IHBpY2tBcnJheS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKSwgMSk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcblxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSk7XG4gICAgLy9zdGFydCB0aGUgZ2FtZVxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufVxuXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XG4gICAgfSAvLyByZW1vdmUgdGhlIGNsYXNzIG9mIGZsaXBwZWRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuICAgIH0sIDEwMDApO1xufVxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmQiXX0=
