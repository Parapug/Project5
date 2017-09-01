'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.timer = 0;
cardGame.gameStart = false;
cardGame.previous = '';
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
        }, function () {
            //make AJAX call after user clicks OK on the alert
            cardGame.getContent();
        });
    });
};

cardGame.matchGame = function () {
    var counter = 0;
    cardGame.previous = '';
    var current = '';
    if (cardGame.clickAllowed) {
        $('.card').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cardGame.gameStart = true;
            counter++;

            //start the timer after the first card is clicked
            if (cardGame.gameStart) {
                cardGame.showTimer();
            }
            //run function handling game effects and mechanics
            cardGame.gameFX(e.currentTarget.classList);
        });
    }
};

//function for game effects and mechanics
cardGame.gameFX = function (c) {
    //flip card if card is face down, otherwise do nothing
    if (!(c.contains('flipped') || c.contains('match'))) {
        c.add('flipped');

        //check for match after 2 cards flipped
        if (counter >= 2) {
            cardGame.clickAllowed = false;
            cardGame.checkMatch($(undefined), cardGame.previous);
            counter = 0;
        } else if (counter === 1) {
            //on the first click, save this card for later
            cardGame.previous = $(undefined);
        } else {
            counter = 0;
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

    //timer format mm:ss.xx
    setInterval(function () {
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
    }, 10);
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
    } // remove the class of flipped
    setTimeout(function () {
        //if cards don't have a flipped class, they flip back
        //if cards have a class of match, they stay flipped
        current.removeClass('flipped');
        prev.removeClass('flipped');
        cardGame.clickAllowed = true;
    }, 600);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImdhbWVTdGFydCIsInByZXZpb3VzIiwiY2xpY2tBbGxvd2VkIiwibWF0Y2hlcyIsImdldENvbnRlbnQiLCIkIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJwdXNoIiwibWVkaWEiLCJwaG90b3MiLCJwaG90byIsImkiLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJvbiIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsIm1hdGNoR2FtZSIsImNvdW50ZXIiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImMiLCJjb250YWlucyIsImFkZCIsImNoZWNrTWF0Y2giLCJ0aW1lU3RyaW5nIiwic2Vjb25kc1N0cmluZyIsInN1YlNlY29uZHNTdHJpbmciLCJtaW51dGVzIiwic2Vjb25kcyIsInN1YlNlY29uZHMiLCJzZXRJbnRlcnZhbCIsInRvU3RyaW5nIiwibWludXRlc1N0cmluZyIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsImNzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImluaXQiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBVyxFQUFmO0FBQ0FBLFNBQVNDLEdBQVQsR0FBZSxrQ0FBZjtBQUNBRCxTQUFTRSxPQUFULEdBQW1CLEVBQW5CO0FBQ0FGLFNBQVNHLFFBQVQsR0FBb0IsRUFBcEI7QUFDQUgsU0FBU0ksS0FBVCxHQUFpQixDQUFqQjtBQUNBSixTQUFTSyxTQUFULEdBQXFCLEtBQXJCO0FBQ0FMLFNBQVNNLFFBQVQsR0FBb0IsRUFBcEI7QUFDQU4sU0FBU08sWUFBVCxHQUF3QixJQUF4QjtBQUNBUCxTQUFTUSxPQUFULEdBQW1CLENBQW5COztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBUixTQUFTUyxVQUFULEdBQXNCLFlBQU07QUFDeEJDLE1BQUVDLElBQUYsQ0FBTztBQUNIQyxnREFERztBQUVIQyxnQkFBUSxLQUZMO0FBR0hDLGtCQUFVLE9BSFA7QUFJSEMsY0FBTTtBQUNGZCxpQkFBS0QsU0FBU0MsR0FEWjtBQUVGZSxzQkFBVSxhQUZSO0FBR0ZDLG9CQUFRLEtBSE47QUFJRkMsb0JBQVEsTUFKTjtBQUtGQyxzQkFBVTtBQUxSO0FBSkgsS0FBUCxFQVdHQyxJQVhILENBV1EsVUFBVUMsR0FBVixFQUFlO0FBQ25CO0FBQ0FyQixpQkFBU3NCLGNBQVQsQ0FBd0JELEdBQXhCO0FBQ0gsS0FkRDtBQWVILENBaEJEOztBQWtCQTtBQUNBckIsU0FBU3NCLGNBQVQsR0FBMEIsVUFBQ0QsR0FBRCxFQUFTO0FBQy9CLFFBQUlFLFVBQVVGLElBQUlHLFNBQUosQ0FBY0MsSUFBZCxDQUFtQkMsR0FBakM7O0FBRUE7QUFDQUgsWUFBUUksT0FBUixDQUFnQixVQUFDQyxHQUFELEVBQVM7QUFDckI1QixpQkFBU0UsT0FBVCxDQUFpQjJCLElBQWpCLENBQXNCRCxJQUFJ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QkFBRixFQUF1QkksR0FBdkIsQ0FBMkIsa0JBQTNCLE1BQW1EOUUsRUFBRTZFLG9CQUFGLEVBQXdCQyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBdkQsRUFBd0c7QUFDcEd2QyxnQkFBUWlDLFFBQVIsQ0FBaUIsT0FBakI7QUFDQUMsYUFBS0QsUUFBTCxDQUFjLE9BQWQ7QUFDQWxGLGlCQUFTUSxPQUFUO0FBQ0gsS0Fkb0MsQ0FjbkM7QUFDRmlGLGVBQVksWUFBTTtBQUNkO0FBQ0E7QUFDQXhDLGdCQUFReUMsV0FBUixDQUFvQixTQUFwQjtBQUNBUCxhQUFLTyxXQUFMLENBQWlCLFNBQWpCO0FBQ0ExRixpQkFBU08sWUFBVCxHQUF3QixJQUF4QjtBQUNILEtBTkQsRUFNRSxHQU5GO0FBT0gsQ0F0QkQ7QUF1QkE7O0FBRUFQLFNBQVMyRixJQUFULEdBQWdCLFlBQU07QUFDbEIzRixhQUFTeUMsTUFBVDtBQUNILENBRkQ7O0FBSUEvQixFQUFFLFlBQU07QUFDSlYsYUFBUzJGLElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcclxuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcclxuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xyXG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xyXG5jYXJkR2FtZS50aW1lciA9IDA7XHJcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5jYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG5cclxuLy9BSkFYIGNhbGwgdG8gUGV0ZmluZGVyIEFQSVxyXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcclxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXHJcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcclxuICAgICAgICBjYXJkR2FtZS5waWNrUmFuZFBob3RvcyhyZXMpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ3JhYiA4IHJhbmRvbSBwaG90b3MgZnJvbSBBUEkgZm9yIHRoZSBjYXJkIGZhY2VzXHJcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xyXG4gICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xyXG5cclxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xyXG4gICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcclxuICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVsnJHQnXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICBsZXQgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcclxuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xyXG4gICAgICAgICAgICAgICAgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZG91YmxlIHVwIGZvciBtYXRjaGluZyAoOCBwaG90b3MgPSAxNiBjYXJkcylcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICB9XHJcbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXHJcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xyXG59XHJcblxyXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cclxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xyXG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1N3ZWV0IScsXHJcbiAgICAgICAgICAgIHRleHQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MgYXJjaGl0ZWN0byBxdWFlcmF0IG9tbmlzIG1pbnVzIGV4Y2VwdHVyaSB1dCBwcmFlc2VudGl1bSwgc29sdXRhIGxhdWRhbnRpdW0gcGVyc3BpY2lhdGlzIGludmVudG9yZT8gRWEgYXNzdW1lbmRhIHRlbXBvcmUgbmF0dXMgZHVjaW11cyBpcHN1bSBsYXVkYW50aXVtIG9mZmljaWlzLCBlbmltIHZvbHVwdGFzLicsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICB9LCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XHJcbiAgICBsZXQgY291bnRlciA9IDA7XHJcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xyXG4gICAgbGV0IGN1cnJlbnQgPSAnJztcclxuICAgIGlmIChjYXJkR2FtZS5jbGlja0FsbG93ZWQpe1xyXG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBjb3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICAvL3N0YXJ0IHRoZSB0aW1lciBhZnRlciB0aGUgZmlyc3QgY2FyZCBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5nYW1lU3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vcnVuIGZ1bmN0aW9uIGhhbmRsaW5nIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWChlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0KTsgICAgICAgICAgXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gZm9yIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXHJcbmNhcmRHYW1lLmdhbWVGWCA9IChjKSA9PiB7XHJcbiAgICAvL2ZsaXAgY2FyZCBpZiBjYXJkIGlzIGZhY2UgZG93biwgb3RoZXJ3aXNlIGRvIG5vdGhpbmdcclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcblxyXG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxyXG4gICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goJCh0aGlzKSwgY2FyZEdhbWUucHJldmlvdXMpO1xyXG4gICAgICAgICAgICBjb3VudGVyID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxyXG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICQodGhpcyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY291bnRlciA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXHJcbmNhcmRHYW1lLnNob3dUaW1lciA9ICgpID0+IHtcclxuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxyXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IG1pbnV0ZXM7XHJcbiAgICBsZXQgc2Vjb25kcztcclxuICAgIGxldCBzdWJTZWNvbmRzO1xyXG5cclxuICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XHJcbiAgICBzZXRJbnRlcnZhbCgoKT0+e1xyXG4gICAgICAgIGNhcmRHYW1lLnRpbWVyKys7ICAgIFxyXG4gICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciUxMDA7XHJcbiAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lci8xMDApJTYwO1xyXG4gICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyLzEwMCkvNjApJTYwO1xyXG4gICAgICAgIGlmIChzZWNvbmRzPD05KSB7XHJcbiAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPScwJyArIHNlY29uZHMudG9TdHJpbmcoKTsgICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPXNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgdGltZVN0cmluZyA9IGAke21pbnV0ZXNTdHJpbmd9OiR7c2Vjb25kc1N0cmluZ30uJHtzdWJTZWNvbmRzfWAgICAgXHJcbiAgICAgICAgJCgnI3RpbWUnKS50ZXh0KHRpbWVTdHJpbmcpO1xyXG4gICAgfSwgMTApO1xyXG59XHJcblxyXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcclxuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxyXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaT0xOyBpPD0xNjsgaSsrKXtcclxuICAgICAgICBwaWNrQXJyYXkucHVzaChpKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2Fzc2lnbiBhIGNhcmQgcGljIHRvIGVhY2ggZGl2XHJcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xyXG4gICAgICAgICQoZWwpLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIGEgcmFuZG9tIGNhcmQgbnVtYmVyIHRvIHRoZSBjdXJyZW50IGRpdi5jYXJkXHJcbiAgICAgICAgbGV0IHJhbmRDbGFzcyA9IHBpY2tBcnJheS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKSwxKTtcclxuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XHJcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XHJcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcclxuXHJcbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXHJcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTtcclxuICAgIC8vc3RhcnQgdGhlIGdhbWVcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59XHJcblxyXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXHJcbmNhcmRHYW1lLmNoZWNrTWF0Y2ggPSAoY3VycmVudCwgcHJldikgPT4ge1xyXG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXHJcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuICAgIFxyXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxyXG4gICAgaWYgKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XHJcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLm1hdGNoZXMrKztcclxuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IFxyXG4gICAgICAgIC8vaWYgY2FyZHMgZG9uJ3QgaGF2ZSBhIGZsaXBwZWQgY2xhc3MsIHRoZXkgZmxpcCBiYWNrXHJcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXHJcbiAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG4gICAgfSw2MDApO1xyXG59XHJcbi8vICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLlxyXG5cclxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xyXG59O1xyXG5cclxuJCgoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5pbml0KCk7XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXHJcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcclxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcclxuIl19
