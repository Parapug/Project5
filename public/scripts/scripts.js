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
//      1. On click of a card, it flips and reveals a doge
//      2. On click of a second card, it also flips and reveals a doge
//      3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
//      4. Once the # of matches = 8, then the timer stops and the game is over.
//      5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.

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
            title: 'Welcome!',
            text: 'Find all the matches as quick as you can, and see if you make your way to the top of our leaderboard! Wroof!',
            imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
        }).then(function () {
            //make AJAX call after user clicks OK on the alert
            cardGame.getContent();
            $('#game').css('display', 'block');
            $('#landingPage').css('display', 'none');
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
                        html: 'Your final time: ' + cardGame.timeString + '         <a href="https://twitter.com/share" class="twitter-share-button" data-size="large" data-text="I just took the Metal Subgenre Quiz! You should too!" data-url="http://metalsubgenre.xyz" data-hashtags="getMetal" data-show-count="false">Tweet</a>',
                        imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
                    }).then(function () {
                        //make AJAX call after user clicks OK on the alert
                        console.log("it works!");
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwiY29uc29sZSIsImxvZyIsInBpY2tSYW5kUGhvdG9zIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJjc3MiLCJtYXRjaEdhbWUiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwidGltZVN0cmluZyIsInNlY29uZHNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsInRvU3RyaW5nIiwibWludXRlc1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiaHRtbCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsU0FBU1UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRmYsaUJBQUtELFNBQVNDLEdBRFo7QUFFRmdCLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVLEdBTFI7QUFNRkMsbUJBQU87QUFOTDtBQUpILEtBQVAsRUFZR0MsSUFaSCxDQVlRLFVBQVNDLEdBQVQsRUFBYztBQUNsQjtBQUNBQyxnQkFBUUMsR0FBUixDQUFZRixHQUFaO0FBQ0F2QixpQkFBUzBCLGNBQVQsQ0FBd0JILEdBQXhCO0FBQ0gsS0FoQkQ7QUFpQkgsQ0FsQkQ7O0FBb0JBO0FBQ0F2QixTQUFTMEIsY0FBVCxHQUEwQixVQUFDSCxHQUFELEVBQVM7QUFDL0IsUUFB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QWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0EzRixpQkFBU1MsT0FBVDtBQUNBRSxVQUFFLFFBQUYsRUFBWXNDLElBQVosQ0FBaUJqRCxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0ZvRSxlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0F4QixnQkFBUTRDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBakcsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTa0csSUFBVCxHQUFnQixZQUFNO0FBQ2xCbEcsYUFBUzZDLE1BQVQ7QUFDSCxDQUZEOztBQUlBbEMsRUFBRSxZQUFNO0FBQ0pYLGFBQVNrRyxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xuY2FyZEdhbWUucmFuZFBpY3MgPSBbXTtcbmNhcmRHYW1lLnRpbWVyID0gMDtcbmNhcmRHYW1lLmNvdW50ZXIgPSAwXG5jYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcbmNhcmRHYW1lLnByZXZpb3VzO1xuY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcbmNhcmRHYW1lLm1hdGNoZXMgPSAwO1xuXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXG4vLyAgICAgIDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyAgICAgIDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyAgICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cbi8vICAgICAgNC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXG4vLyAgICAgIDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG5cbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCIsXG4gICAgICAgICAgICBicmVlZDogXCJQdWdcIlxuICAgICAgICB9XG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgLy9waWNrIHJhbmRvbSBwaG90b3MgZnJvbSB0aGUgQVBJXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIGNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zKHJlcyk7XG4gICAgfSk7XG59XG5cbi8vZnVuY3Rpb24gdG8gZ3JhYiA4IHJhbmRvbSBwaG90b3MgZnJvbSBBUEkgZm9yIHRoZSBjYXJkIGZhY2VzXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcbiAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XG5cbiAgICAvL3NhdmUgYWxsIHBldCBwaG90b3NcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xuICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVsnJHQnXSk7XG4gICAgfSk7XG5cbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgIH1cbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcbn1cblxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgIHRpdGxlOiAnV2VsY29tZSEnLFxuICAgICAgICAgICAgdGV4dDogJ0ZpbmQgYWxsIHRoZSBtYXRjaGVzIGFzIHF1aWNrIGFzIHlvdSBjYW4sIGFuZCBzZWUgaWYgeW91IG1ha2UgeW91ciB3YXkgdG8gdGhlIHRvcCBvZiBvdXIgbGVhZGVyYm9hcmQhIFdyb29mIScsXG4gICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcbiAgICAgICAgICAgICQoJyNnYW1lJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XG4gICAgICAgICAgICAkKCcjbGFuZGluZ1BhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XG4gICAgbGV0IGN1cnJlbnQgPSAnJztcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKSB7XG4gICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7XG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcblxuICAgICAgICAgICAgLy9zdGFydCB0aGUgdGltZXIgYWZ0ZXIgdGhlIGZpcnN0IGNhcmQgaXMgY2xpY2tlZFxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWCgkKHRoaXMpLCBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LCBjYXJkR2FtZS5jb3VudGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcbiAgICAvL2ZsaXAgY2FyZCBpZiBjYXJkIGlzIGZhY2UgZG93biwgb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xuXG4gICAgaWYgKCEoYy5jb250YWlucygnZmxpcHBlZCcpIHx8IGMuY29udGFpbnMoJ21hdGNoJykpKSB7XG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxuICAgICAgICBpZiAoY291bnRlciA+PSAyKSB7XG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxuICAgICAgICAgICAgY2FyZEdhbWUucHJldmlvdXMgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cblxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgc3ViU2Vjb25kc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IG1pbnV0ZXM7XG4gICAgbGV0IHNlY29uZHM7XG4gICAgbGV0IHN1YlNlY29uZHM7XG4gICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG5cbiAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA8IDgpIHtcbiAgICAgICAgLy90aW1lciBmb3JtYXQgbW06c3MueHhcbiAgICAgICAgY2FyZEdhbWUuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyICUgMTAwO1xuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIgLyAxMDApIC8gNjApICUgNjA7XG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA8PSA5KSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9IHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWludXRlc1N0cmluZyA9IE1hdGguZmxvb3IobWludXRlcykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQoY2FyZEdhbWUudGltZVN0cmluZyk7XG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KSB7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYXJkR2FtZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBzd2FsKHtcbiAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdZb3UgZGlkIGl0IScsXG4gICAgICAgICAgICAgICAgICAgIGh0bWw6IGBZb3VyIGZpbmFsIHRpbWU6ICR7Y2FyZEdhbWUudGltZVN0cmluZ30gICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZVwiIGNsYXNzPVwidHdpdHRlci1zaGFyZS1idXR0b25cIiBkYXRhLXNpemU9XCJsYXJnZVwiIGRhdGEtdGV4dD1cIkkganVzdCB0b29rIHRoZSBNZXRhbCBTdWJnZW5yZSBRdWl6ISBZb3Ugc2hvdWxkIHRvbyFcIiBkYXRhLXVybD1cImh0dHA6Ly9tZXRhbHN1YmdlbnJlLnh5elwiIGRhdGEtaGFzaHRhZ3M9XCJnZXRNZXRhbFwiIGRhdGEtc2hvdy1jb3VudD1cImZhbHNlXCI+VHdlZXQ8L2E+YCxcbiAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtzIVwiKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxuICAgIGxldCBwaWNrQXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAxNjsgaSsrKSB7XG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xuICAgIH1cblxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuXG4gICAgICAgIC8vYXNzaWduIGEgcmFuZG9tIGNhcmQgbnVtYmVyIHRvIHRoZSBjdXJyZW50IGRpdi5jYXJkXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksIDEpO1xuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xuXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XG5cbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH0pO1xuICAgIC8vc3RhcnQgdGhlIGdhbWVcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcbn1cblxuLy9jaGVjayBmb3IgbWF0Y2hlcyBiZXR3ZWVuIHRoZSB0d28gY2xpY2tlZCBjYXJkc1xuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcnO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gcHJldi5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcblxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xuICAgICAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vaWYgY2FyZHMgZG9uJ3QgaGF2ZSBhIGZsaXBwZWQgY2xhc3MsIHRoZXkgZmxpcCBiYWNrXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcbiAgICB9LCAxMDAwKTtcbn1cbi8vICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLlxuXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xufTtcblxuJCgoKSA9PiB7XG4gICAgY2FyZEdhbWUuaW5pdCgpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kIl19
