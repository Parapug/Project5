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

// User should press 'Start', fadeIn instructions on top with an "x" to close and a button close
// Loading screen, if needed, while AJAX calls request pics of doges
// Game board loads with 4x4 layout, cards face down
// Timer starts when a card is flipped
// 		1. On click of a card, it flips and reveals a doge
// 		2. On click of a second card, it also flips and reveals a doge
// 		3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
// 		4. Once the # of matches = 8, then the timer stops and the game is over.
// 		5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.

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
            callback: "?"
        }
    }).then(function (res) {
        //pick random photos from the API
        console.log(res);
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
    $('.startBtn').on('click', function () {
        swal({
            title: 'Sweet!',
            text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos architecto quaerat omnis minus excepturi ut praesentium, soluta laudantium perspiciatis inventore? Ea assumenda tempore natus ducimus ipsum laudantium officiis, enim voluptas.',
            imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
        }).then(function () {
            //make AJAX call after user clicks OK on the alert
            console.log("test");
            cardGame.getContent();
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
    console.log(element);
    console.log(c);
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
    var subSecondsString = "";
    var minutes = void 0;
    var seconds = void 0;
    var subSeconds = void 0;
    cardGame.gameStart = false;

    if (cardGame.matches < 8) {
        //timer format mm:ss.xx
        cardGame.interval = setInterval(function () {
            console.log("cardGame.interval", cardGame.interval);
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
            timeString = minutesString + ':' + secondsString + '.' + subSeconds;
            $('#time').text(timeString);
            if (cardGame.matches >= 8) {
                cardGame.gameStart = false;
                clearInterval(cardGame.interval);
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
    console.log(current);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwaWNrUmFuZFBob3RvcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsInB1c2giLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwiaSIsInJhbmRvbVBpY2siLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJwaWMiLCJkaXNwbGF5Q29udGVudCIsImV2ZW50cyIsIm9uIiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInRpbWVTdHJpbmciLCJzZWNvbmRzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJjbGVhckludGVydmFsIiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJzcGxpY2UiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJhdHRyIiwiYWRkQ2xhc3MiLCJwcmV2IiwiY3VycmVudERvZ1BpY3NDbGFzcyIsImNoaWxkcmVuIiwicmVwbGFjZSIsInByZXZpb3VzRG9nUGljc0NsYXNzIiwiY3NzIiwic2V0VGltZW91dCIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsU0FBU1UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRmYsaUJBQUtELFNBQVNDLEdBRFo7QUFFRmdCLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVO0FBTFI7QUFKSCxLQUFQLEVBV0dDLElBWEgsQ0FXUSxVQUFVQyxHQUFWLEVBQWU7QUFDbkI7QUFDQUMsZ0JBQVFDLEdBQVIsQ0FBWUYsR0FBWjtBQUNBdEIsaUJBQVN5QixjQUFULENBQXdCSCxHQUF4QjtBQUNILEtBZkQ7QUFnQkgsQ0FqQkQ7O0FBbUJBO0FBQ0F0QixTQUFTeUIsY0FBVCxHQUEwQixVQUFDSCxHQUFELEVBQVM7QUFDL0IsUUFBSUksVUFBVUosSUFBSUssU0FBSixDQUFjQyxJQUFkLENB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QixZQUFNO0FBQ2xCaEcsYUFBUzRDLE1BQVQ7QUFDSCxDQUZEOztBQUlBakMsRUFBRSxZQUFNO0FBQ0pYLGFBQVNnRyxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XHJcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XHJcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcclxuY2FyZEdhbWUucmFuZFBpY3MgPSBbXTtcclxuY2FyZEdhbWUudGltZXIgPSAwO1xyXG5jYXJkR2FtZS5jb3VudGVyID0gMFxyXG5jYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuY2FyZEdhbWUucHJldmlvdXM7XHJcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbmNhcmRHYW1lLm1hdGNoZXMgPSAwO1xyXG5cclxuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2VcclxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcclxuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxyXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxyXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXHJcbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cclxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXHJcblxyXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIlxyXG4gICAgICAgIH1cclxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgIC8vcGljayByYW5kb20gcGhvdG9zIGZyb20gdGhlIEFQSVxyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XHJcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xyXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcclxuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcclxuXHJcbiAgICAvL3NhdmUgYWxsIHBldCBwaG90b3NcclxuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XHJcbiAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bJyR0J10pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9waWNrIDggcmFuZG9tIG9uZXNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCgocGljKSA9PiB7XHJcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcclxuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgfVxyXG4gICAgLy9hcHBlbmQgdGhlIGRvZyBwaWNzIHRvIHRoZSBjYXJkcyBvbiB0aGUgcGFnZVxyXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcclxufVxyXG5cclxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXHJcbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHsgICAgXHJcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnU3dlZXQhJyxcclxuICAgICAgICAgICAgdGV4dDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcyBhcmNoaXRlY3RvIHF1YWVyYXQgb21uaXMgbWludXMgZXhjZXB0dXJpIHV0IHByYWVzZW50aXVtLCBzb2x1dGEgbGF1ZGFudGl1bSBwZXJzcGljaWF0aXMgaW52ZW50b3JlPyBFYSBhc3N1bWVuZGEgdGVtcG9yZSBuYXR1cyBkdWNpbXVzIGlwc3VtIGxhdWRhbnRpdW0gb2ZmaWNpaXMsIGVuaW0gdm9sdXB0YXMuJyxcclxuICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xyXG4gICAgICAgIH0pLnRoZW4oICgpID0+IHtcclxuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0XCIpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcclxuICAgIGxldCBjdXJyZW50ID0gJyc7XHJcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKXtcclxuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7ICBcclxuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlcisrO1xyXG5cclxuICAgICAgICAgICAgLy9zdGFydCB0aGUgdGltZXIgYWZ0ZXIgdGhlIGZpcnN0IGNhcmQgaXMgY2xpY2tlZFxyXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUuZ2FtZVN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5zaG93VGltZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL3J1biBmdW5jdGlvbiBoYW5kbGluZyBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nYW1lRlgoJCh0aGlzKSwgZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdCwgY2FyZEdhbWUuY291bnRlcik7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICBjb25zb2xlLmxvZyhlbGVtZW50KTtcclxuICAgIGNvbnNvbGUubG9nKGMpO1xyXG4gICAgaWYgKCEoYy5jb250YWlucygnZmxpcHBlZCcpIHx8IGMuY29udGFpbnMoJ21hdGNoJykpKSB7XHJcbiAgICAgICAgYy5hZGQoJ2ZsaXBwZWQnKTtcclxuICAgICAgICAvL2NoZWNrIGZvciBtYXRjaCBhZnRlciAyIGNhcmRzIGZsaXBwZWRcclxuICAgICAgICBpZiAoY291bnRlciA+PSAyKSB7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jaGVja01hdGNoKGVsZW1lbnQsIGNhcmRHYW1lLnByZXZpb3VzKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlciA9IDA7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudGVyID09PSAxKSB7XHJcbiAgICAgICAgICAgIC8vb24gdGhlIGZpcnN0IGNsaWNrLCBzYXZlIHRoaXMgY2FyZCBmb3IgbGF0ZXJcclxuICAgICAgICAgICAgY2FyZEdhbWUucHJldmlvdXMgPSBlbGVtZW50O1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBcclxufVxyXG5cclxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxyXG5jYXJkR2FtZS5zaG93VGltZXIgPSAoKSA9PiB7XHJcbiAgICBsZXQgdGltZVN0cmluZyA9IFwiXCJcclxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBzdWJTZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBtaW51dGVzO1xyXG4gICAgbGV0IHNlY29uZHM7XHJcbiAgICBsZXQgc3ViU2Vjb25kcztcclxuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzIDwgOCl7XHJcbiAgICAgICAgLy90aW1lciBmb3JtYXQgbW06c3MueHhcclxuICAgICAgICBjYXJkR2FtZS5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpPT57XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2FyZEdhbWUuaW50ZXJ2YWxcIixjYXJkR2FtZS5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVyKys7ICAgXHJcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciUxMDA7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyLzEwMCklNjA7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyLzEwMCkvNjApJTYwO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kczw9OSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9JzAnICsgc2Vjb25kcy50b1N0cmluZygpOyAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0gc2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBtaW51dGVzU3RyaW5nID0gTWF0aC5mbG9vcihtaW51dGVzKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB0aW1lU3RyaW5nID0gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfS4ke3N1YlNlY29uZHN9YCAgICBcclxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KHRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KXtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYXJkR2FtZS5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAxMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXHJcbiAgICBsZXQgcGlja0FycmF5ID0gW107XHJcbiAgICBmb3IgKGxldCBpPTE7IGk8PTE2OyBpKyspe1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLDEpO1xyXG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcclxuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xyXG5cclxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcclxuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XHJcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIH0pO1xyXG4gICAgLy9zdGFydCB0aGUgZ2FtZVxyXG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XHJcbn1cclxuXHJcbi8vY2hlY2sgZm9yIG1hdGNoZXMgYmV0d2VlbiB0aGUgdHdvIGNsaWNrZWQgY2FyZHNcclxuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XHJcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcclxuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcclxuICAgIGNvbnNvbGUubG9nKGN1cnJlbnQpO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gXCIuXCIgKyBjdXJyZW50RG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcnO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSAnLicgKyBwcmV2aW91c0RvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XHJcbiBcclxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcclxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xyXG4gICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XHJcbiAgICB9IC8vIHJlbW92ZSB0aGUgY2xhc3Mgb2YgZmxpcHBlZFxyXG4gICAgc2V0VGltZW91dCggKCkgPT4geyBcclxuICAgICAgICAvL2lmIGNhcmRzIGRvbid0IGhhdmUgYSBmbGlwcGVkIGNsYXNzLCB0aGV5IGZsaXAgYmFja1xyXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxyXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBwcmV2LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuICAgIH0sMTAwMCk7XHJcbn1cclxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXHJcblxyXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XHJcbn07XHJcblxyXG4kKCgpID0+IHsgICAgXHJcbiAgICBjYXJkR2FtZS5pbml0KCk7XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXHJcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcclxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcclxuIl19
