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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwaWNrUmFuZFBob3RvcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsInB1c2giLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwiaSIsInJhbmRvbVBpY2siLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJwaWMiLCJkaXNwbGF5Q29udGVudCIsImV2ZW50cyIsIm9uIiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInRpbWVTdHJpbmciLCJzZWNvbmRzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJjbGVhckludGVydmFsIiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJzcGxpY2UiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJhdHRyIiwiYWRkQ2xhc3MiLCJwcmV2IiwiY3VycmVudERvZ1BpY3NDbGFzcyIsImNoaWxkcmVuIiwicmVwbGFjZSIsInByZXZpb3VzRG9nUGljc0NsYXNzIiwiY3NzIiwic2V0VGltZW91dCIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsU0FBU1UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRmYsaUJBQUtELFNBQVNDLEdBRFo7QUFFRmdCLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVO0FBTFI7QUFKSCxLQUFQLEVBV0dDLElBWEgsQ0FXUSxVQUFVQyxHQUFWLEVBQWU7QUFDbkI7QUFDQUMsZ0JBQVFDLEdBQVIsQ0FBWUYsR0FBWjtBQUNBdEIsaUJBQVN5QixjQUFULENBQXdCSCxHQUF4QjtBQUNILEtBZkQ7QUFnQkgsQ0FqQkQ7O0FBbUJBO0FBQ0F0QixTQUFTeUIsY0FBVCxHQUEwQixVQUFDSCxHQUFELEVBQVM7QUFDL0IsUUFBSUksVUFBVUosSUFBSUssU0FBSixDQUFjQyxJQUFkLENB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QixZQUFNO0FBQ2xCaEcsYUFBUzRDLE1BQVQ7QUFDSCxDQUZEOztBQUlBakMsRUFBRSxZQUFNO0FBQ0pYLGFBQVNnRyxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xuY2FyZEdhbWUucmFuZFBpY3MgPSBbXTtcbmNhcmRHYW1lLnRpbWVyID0gMDtcbmNhcmRHYW1lLmNvdW50ZXIgPSAwXG5jYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcbmNhcmRHYW1lLnByZXZpb3VzO1xuY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcbmNhcmRHYW1lLm1hdGNoZXMgPSAwO1xuXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxuXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiXG4gICAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgLy9waWNrIHJhbmRvbSBwaG90b3MgZnJvbSB0aGUgQVBJXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIGNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zKHJlcyk7XG4gICAgfSk7XG59XG5cbi8vZnVuY3Rpb24gdG8gZ3JhYiA4IHJhbmRvbSBwaG90b3MgZnJvbSBBUEkgZm9yIHRoZSBjYXJkIGZhY2VzXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcbiAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XG5cbiAgICAvL3NhdmUgYWxsIHBldCBwaG90b3NcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xuICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVsnJHQnXSk7XG4gICAgfSk7XG5cbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgIH1cbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcbn1cblxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7ICAgIFxuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc3dhbCh7XG4gICAgICAgICAgICB0aXRsZTogJ1N3ZWV0IScsXG4gICAgICAgICAgICB0ZXh0OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zIGFyY2hpdGVjdG8gcXVhZXJhdCBvbW5pcyBtaW51cyBleGNlcHR1cmkgdXQgcHJhZXNlbnRpdW0sIHNvbHV0YSBsYXVkYW50aXVtIHBlcnNwaWNpYXRpcyBpbnZlbnRvcmU/IEVhIGFzc3VtZW5kYSB0ZW1wb3JlIG5hdHVzIGR1Y2ltdXMgaXBzdW0gbGF1ZGFudGl1bSBvZmZpY2lpcywgZW5pbSB2b2x1cHRhcy4nLFxuICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICB9KS50aGVuKCAoKSA9PiB7XG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0ZXN0XCIpO1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XG4gICAgbGV0IGN1cnJlbnQgPSAnJztcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKXtcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlOyAgXG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyKys7XG5cbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5nYW1lU3RhcnQpIHtcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5zaG93VGltZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vcnVuIGZ1bmN0aW9uIGhhbmRsaW5nIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXG4gICAgICAgICAgICBjYXJkR2FtZS5nYW1lRlgoJCh0aGlzKSwgZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdCwgY2FyZEdhbWUuY291bnRlcik7ICAgICAgICAgIFxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8vZnVuY3Rpb24gZm9yIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgIGNvbnNvbGUubG9nKGVsZW1lbnQpO1xuICAgIGNvbnNvbGUubG9nKGMpO1xuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICAvL2NoZWNrIGZvciBtYXRjaCBhZnRlciAyIGNhcmRzIGZsaXBwZWRcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjYXJkR2FtZS5jaGVja01hdGNoKGVsZW1lbnQsIGNhcmRHYW1lLnByZXZpb3VzKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcbiAgICAgICAgICAgIC8vb24gdGhlIGZpcnN0IGNsaWNrLCBzYXZlIHRoaXMgY2FyZCBmb3IgbGF0ZXJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIFxufVxuXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXG5jYXJkR2FtZS5zaG93VGltZXIgPSAoKSA9PiB7XG4gICAgbGV0IHRpbWVTdHJpbmcgPSBcIlwiXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBzdWJTZWNvbmRzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgbWludXRlcztcbiAgICBsZXQgc2Vjb25kcztcbiAgICBsZXQgc3ViU2Vjb25kcztcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcblxuICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzIDwgOCl7XG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCk9PntcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2FyZEdhbWUuaW50ZXJ2YWxcIixjYXJkR2FtZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrOyAgIFxuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyJTEwMDtcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lci8xMDApJTYwO1xuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIvMTAwKS82MCklNjA7XG4gICAgICAgICAgICBpZiAoc2Vjb25kczw9OSkge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPScwJyArIHNlY29uZHMudG9TdHJpbmcoKTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0gc2Vjb25kcy50b1N0cmluZygpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBtaW51dGVzU3RyaW5nID0gTWF0aC5mbG9vcihtaW51dGVzKS50b1N0cmluZygpO1xuICAgICAgICAgICAgdGltZVN0cmluZyA9IGAke21pbnV0ZXNTdHJpbmd9OiR7c2Vjb25kc1N0cmluZ30uJHtzdWJTZWNvbmRzfWAgICAgXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQodGltZVN0cmluZyk7XG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KXtcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhcmRHYW1lLmludGVydmFsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTApO1xuICAgIH1cbn1cblxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGk9MTsgaTw9MTY7IGkrKyl7XG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xuICAgIH1cblxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuXG4gICAgICAgIC8vYXNzaWduIGEgcmFuZG9tIGNhcmQgbnVtYmVyIHRvIHRoZSBjdXJyZW50IGRpdi5jYXJkXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksMSk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcblxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSk7XG4gICAgLy9zdGFydCB0aGUgZ2FtZVxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufVxuXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgY29uc29sZS5sb2coY3VycmVudCk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuIFxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXG4gICAgc2V0VGltZW91dCggKCkgPT4geyBcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuICAgIH0sMTAwMCk7XG59XG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cblxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcbn07XG5cbiQoKCkgPT4geyAgICBcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
