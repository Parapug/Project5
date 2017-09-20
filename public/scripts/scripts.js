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
//leaderboard Firebase

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
        var boardString = '<h2>Leaderboard</h2>';

        for (var key in dataArray) {
            scoresArray.push(dataArray[key]);
        }

        scoresArray.sort(function (a, b) {
            return a.time - b.time;
        });

        for (var i = 0; i < 5; i++) {
            boardString += '<p>' + scoresArray[i].name + ' : ' + scoresArray[i].timeString + '</p>';
        }
        $('.leaderBoard').html(boardString);
    });
};

//AJAX call to Petfinder API
cardGame.getContent = function () {
    $.ajax({
        url: 'https://api.petfinder.com/pet.find',
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
        if (dog.media.photos !== undefined) {
            cardGame.dogPics.push(dog.media.photos.photo[2]['$t']);
        }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJib2FyZFN0cmluZyIsInNvcnQiLCJhIiwiYiIsImkiLCJodG1sIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInVuZGVmaW5lZCIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQXFCQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbEMsUUFBSUMsV0FBVyxRQUFmO0FBQ0FDLE1BQUUsYUFBRixFQUFpQkMsS0FBakI7QUFDQSxRQUFJRCxFQUFFLGFBQUYsRUFBaUJFLEdBQWpCLE1BQTBCLEVBQTlCLEVBQWtDO0FBQzlCSCxtQkFBV0MsRUFBRSxhQUFGLEVB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QyxDQUFzQyxPQUF0QyxDQUF0QjtBQUNBRywwQkFBc0IsTUFBTUEsb0JBQW9CRSxPQUFwQixDQUE0QixjQUE1QixFQUE0QyxFQUE1QyxDQUE1QjtBQUNBLFFBQUlDLHVCQUF1QixFQUEzQjtBQUNBQSwyQkFBdUJKLEtBQUtFLFFBQUwsQ0FBYyxjQUFkLEVBQThCSixJQUE5QixDQUFtQyxPQUFuQyxDQUF2QjtBQUNBTSwyQkFBdUIsTUFBTUEscUJBQXFCRCxPQUFyQixDQUE2QixjQUE3QixFQUE2QyxFQUE3QyxDQUE3Qjs7QUFFQTtBQUNBLFFBQUloRyxFQUFFOEYsbUJBQUYsRUFBdUJyQyxHQUF2QixDQUEyQixrQkFBM0IsTUFBbUR6RCxFQUFFaUcsb0JBQUYsRUFBd0J4QyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBdkQsRUFBd0c7QUFDcEdFLGdCQUFRaUMsUUFBUixDQUFpQixPQUFqQjtBQUNBQyxhQUFLRCxRQUFMLENBQWMsT0FBZDtBQUNBN0csaUJBQVNTLE9BQVQ7QUFDQVEsVUFBRSxRQUFGLEVBQVl1RCxJQUFaLENBQWlCeEUsU0FBU1MsT0FBMUI7QUFDSCxLQWZvQyxDQWVuQztBQUNGd0YsZUFBVyxZQUFNO0FBQ2I7QUFDQTtBQUNBckIsZ0JBQVF1QyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FMLGFBQUtLLFdBQUwsQ0FBaUIsU0FBakI7QUFDQW5ILGlCQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0gsS0FORCxFQU1HLElBTkg7QUFPSCxDQXZCRDtBQXdCQTs7QUFFQVIsU0FBU29ILElBQVQsR0FBZ0IsWUFBTTtBQUNsQnBILGFBQVNtRSxNQUFUO0FBQ0gsQ0FGRDs7QUFJQWxELEVBQUUsWUFBTTtBQUNKakIsYUFBU29ILElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XG5jYXJkR2FtZS5kb2dQaWNzID0gW107XG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xuY2FyZEdhbWUudGltZXIgPSAwO1xuY2FyZEdhbWUuY291bnRlciA9IDBcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuY2FyZEdhbWUucHJldmlvdXM7XG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuY2FyZEdhbWUubWF0Y2hlcyA9IDA7XG5jYXJkR2FtZS5sZWFkQm9hcmQgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xuXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXG4vLyAgICAgIDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyAgICAgIDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyAgICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cbi8vICAgICAgNC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXG4vLyAgICAgIDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG4vL2xlYWRlcmJvYXJkIEZpcmViYXNlXG5cbmNhcmRHYW1lLm5ld0xlYWQgPSAodGltZXIsIHN0cmluZykgPT4ge1xuICAgIGxldCB1c2VybmFtZSA9ICdub05hbWUnO1xuICAgICQoJyNwbGF5ZXJOYW1lJykuZW1wdHkoKTtcbiAgICBpZiAoJCgnI3BsYXllck5hbWUnKS52YWwoKSAhPSBcIlwiKSB7XG4gICAgICAgIHVzZXJuYW1lID0gJCgnI3BsYXllck5hbWUnKS52YWwoKTtcbiAgICB9XG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLnB1c2goe1xuICAgICAgICBuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgdGltZTogdGltZXIsXG4gICAgICAgIHRpbWVTdHJpbmc6IHN0cmluZ1xuICAgIH0pXG59XG5cbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5vbihcInZhbHVlXCIsIChzY29yZXMpID0+IHtcbiAgICAgICAgbGV0IHRvcEZpdmUgPSBbXTtcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcbiAgICAgICAgbGV0IHNjb3Jlc0FycmF5ID0gW107XG4gICAgICAgIGxldCBib2FyZFN0cmluZyA9ICc8aDI+TGVhZGVyYm9hcmQ8L2gyPic7XG5cbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xuICAgICAgICAgICAgc2NvcmVzQXJyYXkucHVzaChkYXRhQXJyYXlba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICBzY29yZXNBcnJheS5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lO1xuICAgICAgICB9KVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XG4gICAgICAgICAgICBib2FyZFN0cmluZyArPSAoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9PC9wPmApO1xuICAgICAgICB9XG4gICAgICAgICQoJy5sZWFkZXJCb2FyZCcpLmh0bWwoYm9hcmRTdHJpbmcpO1xuICAgIH0pXG59XG5cbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cHM6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiLFxuICAgICAgICAgICAgYnJlZWQ6IFwiUHVnXCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIC8vcGljayByYW5kb20gcGhvdG9zIGZyb20gdGhlIEFQSVxuICAgICAgICBjYXJkR2FtZS5waWNrUmFuZFBob3RvcyhyZXMpO1xuICAgIH0pO1xufVxuXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xuY2FyZEdhbWUucGlja1JhbmRQaG90b3MgPSAocmVzKSA9PiB7XG4gICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xuXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXG4gICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcbiAgICAgICAgaWYgKGRvZy5tZWRpYS5waG90b3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bJyR0J10pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgIH1cbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcbn1cblxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgIHRpdGxlOiAnV2VsY29tZSEnLFxuICAgICAgICAgICAgdGV4dDogJ0ZpbmQgYWxsIHRoZSBtYXRjaGVzIGFzIHF1aWNrIGFzIHlvdSBjYW4sIGFuZCBzZWUgaWYgeW91IG1ha2UgeW91ciB3YXkgdG8gdGhlIHRvcCBvZiBvdXIgbGVhZGVyYm9hcmQhIFdyb29mIScsXG4gICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICQoJyNnYW1lJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICAkKCcjbGFuZGluZ1BhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xuICAgIGxldCBjdXJyZW50ID0gJyc7XG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCkge1xuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyKys7XG5cbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5nYW1lU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5zaG93VGltZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vcnVuIGZ1bmN0aW9uIGhhbmRsaW5nIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXG4gICAgICAgICAgICBjYXJkR2FtZS5nYW1lRlgoJCh0aGlzKSwgZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdCwgY2FyZEdhbWUuY291bnRlcik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLy9mdW5jdGlvbiBmb3IgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcbmNhcmRHYW1lLmdhbWVGWCA9IChlbGVtZW50LCBjLCBjb3VudGVyKSA9PiB7XG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXG4gICAgJCgnI3Njb3JlJykudGV4dChjYXJkR2FtZS5tYXRjaGVzKTtcblxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICAvL2NoZWNrIGZvciBtYXRjaCBhZnRlciAyIGNhcmRzIGZsaXBwZWRcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjYXJkR2FtZS5jaGVja01hdGNoKGVsZW1lbnQsIGNhcmRHYW1lLnByZXZpb3VzKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcbiAgICAgICAgICAgIC8vb24gdGhlIGZpcnN0IGNsaWNrLCBzYXZlIHRoaXMgY2FyZCBmb3IgbGF0ZXJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgbWludXRlc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBtaW51dGVzO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCBzdWJTZWNvbmRzO1xuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KSB7XG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKztcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciAlIDEwMDtcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lciAvIDEwMCkgJSA2MDtcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAvIDYwKSAlIDYwO1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSAnMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lU3RyaW5nID0gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfS4ke3N1YlNlY29uZHN9YFxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FyZEdhbWUuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnWW91IGRpZCBpdCEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlXCI8c3BhbiBjbGFzcz1cImZhLXN0YWNrIGZhLWxnXCI+PGkgY2xhc3M9XCJmYSBmYS1jaXJjbGUgZmEtc3RhY2stMnhcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS10d2l0dGVyIGZhLWludmVyc2UgZmEtc3RhY2stMXhcIj48L2k+PC9zcGFuPjwvYT5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5uZXdMZWFkKGNhcmRHYW1lLnRpbWVyLCBjYXJkR2FtZS50aW1lU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTApO1xuICAgIH1cbn1cblxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDE2OyBpKyspIHtcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XG4gICAgfVxuXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICQoZWwpLmVtcHR5KCk7XG5cbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcbiAgICAgICAgbGV0IHJhbmRDbGFzcyA9IHBpY2tBcnJheS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKSwgMSk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcblxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSk7XG4gICAgLy9zdGFydCB0aGUgZ2FtZVxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufVxuXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XG4gICAgfSAvLyByZW1vdmUgdGhlIGNsYXNzIG9mIGZsaXBwZWRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuICAgIH0sIDEwMDApO1xufVxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmQiXX0=
