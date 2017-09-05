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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJzb3J0IiwiYSIsImIiLCJpIiwiYXBwZW5kIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiaHRtbCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsInJhbmRDbGFzcyIsInNwbGljZSIsInBpY3NUb1VzZSIsImNsYXNzTnVtIiwiY2xhc3NOYW1lIiwicmFuZFBpYyIsInBpY1N0cmluZyIsImF0dHIiLCJhZGRDbGFzcyIsInByZXYiLCJjdXJyZW50RG9nUGljc0NsYXNzIiwiY2hpbGRyZW4iLCJyZXBsYWNlIiwicHJldmlvdXNEb2dQaWNzQ2xhc3MiLCJyZW1vdmVDbGFzcyIsImluaXQiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBVyxFQUFmO0FBQ0FBLFNBQVNDLEdBQVQsR0FBZSxrQ0FBZjtBQUNBRCxTQUFTRSxPQUFULEdBQW1CLEVBQW5CO0FBQ0FGLFNBQVNHLFFBQVQsR0FBb0IsRUFBcEI7QUFDQUgsU0FBU0ksS0FBVCxHQUFpQixDQUFqQjtBQUNBSixTQUFTSyxPQUFULEdBQW1CLENBQW5CO0FBQ0FMLFNBQVNNLFNBQVQsR0FBcUIsS0FBckI7QUFDQU4sU0FBU08sUUFBVDtBQUNBUCxTQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0FSLFNBQVNTLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQVQsU0FBU1UsU0FBVCxHQUFxQkMsU0FBU0MsUUFBVCxHQUFvQkMsR0FBcEIsRUFBckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFiLFNBQVNjLE9BQVQsR0FBbUIsVUFBQ1YsS0FBRCxFQUFRVyxNQUFSLEVBQW1CO0FBQ2xDLFFBQUlDLFdBQVcsUUFBZjtBQUNBQyxNQUFFLGFBQUYsRUFBaUJDLEtBQWpCO0FBQ0EsUUFBSUQsRUFBRSxhQUFGLEVBQWlCRSxHQUFqQixNQUEwQixFQUE5QixFQUFrQztBQUM5QkgsbUJBQVdDLEVBQUUsYUFBRixFQUFpQkUsR0FBakIsRUFBWDtBQUNIO0FB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QUtFLFFBQUwsQ0FBYyxjQUFkLEVBQThCSixJQUE5QixDQUFtQyxPQUFuQyxDQUF2QjtBQUNBTSwyQkFBdUIsTUFBTUEscUJBQXFCRCxPQUFyQixDQUE2QixjQUE3QixFQUE2QyxFQUE3QyxDQUE3Qjs7QUFFQTtBQUNBLFFBQUkvRixFQUFFNkYsbUJBQUYsRUFBdUJ0QyxHQUF2QixDQUEyQixrQkFBM0IsTUFBbUR2RCxFQUFFZ0csb0JBQUYsRUFBd0J6QyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBdkQsRUFBd0c7QUFDcEdFLGdCQUFRa0MsUUFBUixDQUFpQixPQUFqQjtBQUNBQyxhQUFLRCxRQUFMLENBQWMsT0FBZDtBQUNBNUcsaUJBQVNTLE9BQVQ7QUFDQVEsVUFBRSxRQUFGLEVBQVlxRCxJQUFaLENBQWlCdEUsU0FBU1MsT0FBMUI7QUFDSCxLQWZvQyxDQWVuQztBQUNGc0YsZUFBVyxZQUFNO0FBQ2I7QUFDQTtBQUNBckIsZ0JBQVF3QyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FMLGFBQUtLLFdBQUwsQ0FBaUIsU0FBakI7QUFDQWxILGlCQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0gsS0FORCxFQU1HLElBTkg7QUFPSCxDQXZCRDtBQXdCQTs7QUFFQVIsU0FBU21ILElBQVQsR0FBZ0IsWUFBTTtBQUNsQm5ILGFBQVNpRSxNQUFUO0FBQ0gsQ0FGRDs7QUFJQWhELEVBQUUsWUFBTTtBQUNKakIsYUFBU21ILElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcclxuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcclxuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xyXG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xyXG5jYXJkR2FtZS50aW1lciA9IDA7XHJcbmNhcmRHYW1lLmNvdW50ZXIgPSAwXHJcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5jYXJkR2FtZS5wcmV2aW91cztcclxuY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuY2FyZEdhbWUubWF0Y2hlcyA9IDA7XHJcbmNhcmRHYW1lLmxlYWRCb2FyZCA9IGZpcmViYXNlLmRhdGFiYXNlKCkucmVmKCk7XHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gICAgICAxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyAgICAgIDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vICAgICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyAgICAgIDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxyXG4vLyAgICAgIDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXHJcblxyXG5jYXJkR2FtZS5uZXdMZWFkID0gKHRpbWVyLCBzdHJpbmcpID0+IHtcclxuICAgIGxldCB1c2VybmFtZSA9ICdub05hbWUnO1xyXG4gICAgJCgnI3BsYXllck5hbWUnKS5lbXB0eSgpO1xyXG4gICAgaWYgKCQoJyNwbGF5ZXJOYW1lJykudmFsKCkgIT0gXCJcIikge1xyXG4gICAgICAgIHVzZXJuYW1lID0gJCgnI3BsYXllck5hbWUnKS52YWwoKTtcclxuICAgIH1cclxuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5wdXNoKHtcclxuICAgICAgICBuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICAkKCcubGVhZGVyQm9hcmQnKS5hcHBlbmQoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufVxyXG5cclxuLy9BSkFYIGNhbGwgdG8gUGV0ZmluZGVyIEFQSVxyXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcclxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXHJcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCIsXHJcbiAgICAgICAgICAgIGJyZWVkOiBcIlB1Z1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcclxuICAgICAgICBjYXJkR2FtZS5waWNrUmFuZFBob3RvcyhyZXMpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ3JhYiA4IHJhbmRvbSBwaG90b3MgZnJvbSBBUEkgZm9yIHRoZSBjYXJkIGZhY2VzXHJcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xyXG4gICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xyXG5cclxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xyXG4gICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcclxuICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVsnJHQnXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICBsZXQgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcclxuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xyXG4gICAgICAgICAgICAgICAgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZG91YmxlIHVwIGZvciBtYXRjaGluZyAoOCBwaG90b3MgPSAxNiBjYXJkcylcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICB9XHJcbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXHJcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xyXG59XHJcblxyXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cclxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xyXG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnV2VsY29tZSEnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnRmluZCBhbGwgdGhlIG1hdGNoZXMgYXMgcXVpY2sgYXMgeW91IGNhbiwgYW5kIHNlZSBpZiB5b3UgbWFrZSB5b3VyIHdheSB0byB0aGUgdG9wIG9mIG91ciBsZWFkZXJib2FyZCEgV3Jvb2YhJyxcclxuICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgICAgICQoJyNnYW1lJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICQoJyNsYW5kaW5nUGFnZScpLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmRpc3BsYXlMZWFkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcclxuICAgIGxldCBjdXJyZW50ID0gJyc7XHJcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKSB7XHJcbiAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICAvL3N0YXJ0IHRoZSB0aW1lciBhZnRlciB0aGUgZmlyc3QgY2FyZCBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5nYW1lU3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vcnVuIGZ1bmN0aW9uIGhhbmRsaW5nIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWCgkKHRoaXMpLCBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LCBjYXJkR2FtZS5jb3VudGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy9mdW5jdGlvbiBmb3IgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcclxuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xyXG4gICAgJCgnI3Njb3JlJykudGV4dChjYXJkR2FtZS5tYXRjaGVzKTtcclxuXHJcbiAgICBpZiAoIShjLmNvbnRhaW5zKCdmbGlwcGVkJykgfHwgYy5jb250YWlucygnbWF0Y2gnKSkpIHtcclxuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xyXG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxyXG4gICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxyXG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuXHJcbn1cclxuXHJcbi8vY2FsY3VsYXRlIGFuZCBkaXNwbGF5IHRpbWVyIG9uIHBhZ2VcclxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xyXG4gICAgbGV0IHRpbWVTdHJpbmcgPSBcIlwiXHJcbiAgICBsZXQgc2Vjb25kc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgbWludXRlc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgc3ViU2Vjb25kc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgbWludXRlcztcclxuICAgIGxldCBzZWNvbmRzO1xyXG4gICAgbGV0IHN1YlNlY29uZHM7XHJcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA8IDgpIHtcclxuICAgICAgICAvL3RpbWVyIGZvcm1hdCBtbTpzcy54eFxyXG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xyXG4gICAgICAgICAgICBzdWJTZWNvbmRzID0gY2FyZEdhbWUudGltZXIgJSAxMDA7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xyXG4gICAgICAgICAgICBtaW51dGVzID0gKChjYXJkR2FtZS50aW1lciAvIDEwMCkgLyA2MCkgJSA2MDtcclxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXHJcbiAgICAgICAgICAgICQoJyN0aW1lJykudGV4dChjYXJkR2FtZS50aW1lU3RyaW5nKTtcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1lvdSBkaWQgaXQhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmVcIjxzcGFuIGNsYXNzPVwiZmEtc3RhY2sgZmEtbGdcIj48aSBjbGFzcz1cImZhIGZhLWNpcmNsZSBmYS1zdGFjay0yeFwiPjwvaT48aSBjbGFzcz1cImZhIGZhLXR3aXR0ZXIgZmEtaW52ZXJzZSBmYS1zdGFjay0xeFwiPjwvaT48L3NwYW4+PC9hPmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUubmV3TGVhZChjYXJkR2FtZS50aW1lciwgY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcclxuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxyXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTY7IGkrKykge1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLCAxKTtcclxuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XHJcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XHJcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcclxuXHJcbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXHJcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTtcclxuICAgIC8vc3RhcnQgdGhlIGdhbWVcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59XHJcblxyXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXHJcbmNhcmRHYW1lLmNoZWNrTWF0Y2ggPSAoY3VycmVudCwgcHJldikgPT4ge1xyXG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXHJcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgY2FyZHMgbWF0Y2gsIGdpdmUgdGhlbSBhIGNsYXNzIG9mIG1hdGNoXHJcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcclxuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIHByZXYuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xyXG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XHJcbiAgICB9IC8vIHJlbW92ZSB0aGUgY2xhc3Mgb2YgZmxpcHBlZFxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcclxuICAgICAgICAvL2lmIGNhcmRzIGhhdmUgYSBjbGFzcyBvZiBtYXRjaCwgdGhleSBzdGF5IGZsaXBwZWRcclxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxufTtcclxuXHJcbiQoKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxyXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXHJcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kIl19
