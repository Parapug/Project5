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
    cardGame.leadBoard.push({
        name: $('#playerName').val(),
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
                        html: 'Your final time: ' + cardGame.timeString + '         <a href="https://twitter.com/share" class="twitter-share-button" data-size="large" data-text="I just took the Metal Subgenre Quiz! You should too!" data-url="http://metalsubgenre.xyz" data-hashtags="getMetal" data-show-count="false">Tweet</a>',
                        imageUrl: 'https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg'
                    }).then(function () {
                        //make AJAX call after user clicks OK on the alert
                        console.log("it works!");
                        cardGame.newLead(cardGame.timer, cardGame.timeString);
                        cardGame.displayLead();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInB1c2giLCJuYW1lIiwiJCIsInZhbCIsInRpbWUiLCJ0aW1lU3RyaW5nIiwiZGlzcGxheUxlYWQiLCJvbiIsInNjb3JlcyIsInRvcEZpdmUiLCJkYXRhQXJyYXkiLCJzY29yZXNBcnJheSIsInNvcnQiLCJhIiwiYiIsImkiLCJhcHBlbmQiLCJnZXRDb250ZW50IiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJicmVlZCIsInRoZW4iLCJyZXMiLCJwaWNrUmFuZFBob3RvcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJlIiwicHJldmVudERlZmF1bHQiLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJjc3MiLCJtYXRjaEdhbWUiLCJjdXJyZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwic2Vjb25kc1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsInRvU3RyaW5nIiwiY2xlYXJJbnRlcnZhbCIsInNldFRpbWVvdXQiLCJodG1sIiwiY29uc29sZSIsImxvZyIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQW9CQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbENmLGFBQVNVLFNBQVQsQ0FBbUJNLElBQW5CLENBQXdCO0FBQ3BCQyxjQUFNQyxFQUFFLGFBQUYsRUFBaUJDLEdBQWpCLEVBRGM7QUFFcEJDLGNBQU1oQixLQUZjO0FBR3BCaUIsb0JBQVlOO0FBSFEsS0FBeEI7QUFLSCxDQU5EOztBQVFBZixTQUFTc0Is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QTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnpDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHBELEVBQUVnRyxvQkFBRixFQUF3QjVDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFxQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E3RyxpQkFBU1MsT0FBVDtBQUNBUyxVQUFFLFFBQUYsRUFBWWtELElBQVosQ0FBaUJwRSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0ZvRixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUTJDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbkgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTb0gsSUFBVCxHQUFnQixZQUFNO0FBQ2xCcEgsYUFBUytELE1BQVQ7QUFDSCxDQUZEOztBQUlBN0MsRUFBRSxZQUFNO0FBQ0psQixhQUFTb0gsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuY291bnRlciA9IDBcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuY2FyZEdhbWUubGVhZEJvYXJkPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxyXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xyXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXHJcbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXHJcbi8vICAgICAgMS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gICAgICAyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyAgICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cclxuLy8gICAgICA0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cclxuLy8gICAgICA1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG5cclxuY2FyZEdhbWUubmV3TGVhZCA9ICh0aW1lciwgc3RyaW5nKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5sZWFkQm9hcmQucHVzaCh7XHJcbiAgICAgICAgbmFtZTogJCgnI3BsYXllck5hbWUnKS52YWwoKSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICAkKCcubGVhZGVyQm9hcmQnKS5hcHBlbmQoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufVxyXG5cclxuLy9BSkFYIGNhbGwgdG8gUGV0ZmluZGVyIEFQSVxyXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcclxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXHJcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCIsXHJcbiAgICAgICAgICAgIGJyZWVkOiBcIlB1Z1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgLy9waWNrIHJhbmRvbSBwaG90b3MgZnJvbSB0aGUgQVBJXHJcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xyXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcclxuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcclxuXHJcbiAgICAvL3NhdmUgYWxsIHBldCBwaG90b3NcclxuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XHJcbiAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bJyR0J10pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9waWNrIDggcmFuZG9tIG9uZXNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCgocGljKSA9PiB7XHJcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcclxuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgfVxyXG4gICAgLy9hcHBlbmQgdGhlIGRvZyBwaWNzIHRvIHRoZSBjYXJkcyBvbiB0aGUgcGFnZVxyXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcclxufVxyXG5cclxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXHJcbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcclxuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1dlbGNvbWUhJyxcclxuICAgICAgICAgICAgdGV4dDogJ0ZpbmQgYWxsIHRoZSBtYXRjaGVzIGFzIHF1aWNrIGFzIHlvdSBjYW4sIGFuZCBzZWUgaWYgeW91IG1ha2UgeW91ciB3YXkgdG8gdGhlIHRvcCBvZiBvdXIgbGVhZGVyYm9hcmQhIFdyb29mIScsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xyXG4gICAgICAgICAgICAkKCcjZ2FtZScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAkKCcjbGFuZGluZ1BhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XHJcbiAgICBsZXQgY3VycmVudCA9ICcnO1xyXG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCkge1xyXG4gICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7XHJcbiAgICAgICAgJCgnLmNhcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xyXG5cclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxufVxyXG5cclxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxyXG5jYXJkR2FtZS5zaG93VGltZXIgPSAoKSA9PiB7XHJcbiAgICBsZXQgdGltZVN0cmluZyA9IFwiXCJcclxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBtaW51dGVzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBzdWJTZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBtaW51dGVzO1xyXG4gICAgbGV0IHNlY29uZHM7XHJcbiAgICBsZXQgc3ViU2Vjb25kcztcclxuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzIDwgOCkge1xyXG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XHJcbiAgICAgICAgY2FyZEdhbWUuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVyKys7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciAlIDEwMDtcclxuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoY2FyZEdhbWUudGltZXIgLyAxMDApICUgNjA7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAvIDYwKSAlIDYwO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA8PSA5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0gJzAnICsgc2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9IHNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWludXRlc1N0cmluZyA9IE1hdGguZmxvb3IobWludXRlcykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUudGltZVN0cmluZyA9IGAke21pbnV0ZXNTdHJpbmd9OiR7c2Vjb25kc1N0cmluZ30uJHtzdWJTZWNvbmRzfWBcclxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FyZEdhbWUuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnWW91IGRpZCBpdCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sOiBgWW91ciBmaW5hbCB0aW1lOiAke2NhcmRHYW1lLnRpbWVTdHJpbmd9ICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmVcIiBjbGFzcz1cInR3aXR0ZXItc2hhcmUtYnV0dG9uXCIgZGF0YS1zaXplPVwibGFyZ2VcIiBkYXRhLXRleHQ9XCJJIGp1c3QgdG9vayB0aGUgTWV0YWwgU3ViZ2VucmUgUXVpeiEgWW91IHNob3VsZCB0b28hXCIgZGF0YS11cmw9XCJodHRwOi8vbWV0YWxzdWJnZW5yZS54eXpcIiBkYXRhLWhhc2h0YWdzPVwiZ2V0TWV0YWxcIiBkYXRhLXNob3ctY291bnQ9XCJmYWxzZVwiPlR3ZWV0PC9hPmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJpdCB3b3JrcyFcIik7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUubmV3TGVhZChjYXJkR2FtZS50aW1lciwgY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAxMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXHJcbiAgICBsZXQgcGlja0FycmF5ID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAxNjsgaSsrKSB7XHJcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxyXG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgICAkKGVsKS5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvL2Fzc2lnbiBhIHJhbmRvbSBjYXJkIG51bWJlciB0byB0aGUgY3VycmVudCBkaXYuY2FyZFxyXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksIDEpO1xyXG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcclxuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xyXG5cclxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcclxuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XHJcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIH0pO1xyXG4gICAgLy9zdGFydCB0aGUgZ2FtZVxyXG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XHJcbn1cclxuXHJcbi8vY2hlY2sgZm9yIG1hdGNoZXMgYmV0d2VlbiB0aGUgdHdvIGNsaWNrZWQgY2FyZHNcclxuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XHJcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcclxuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XHJcbiAgICBsZXQgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSAnJztcclxuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gcHJldi5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG5cclxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcclxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xyXG4gICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XHJcbiAgICAgICAgJCgnI3Njb3JlJykudGV4dChjYXJkR2FtZS5tYXRjaGVzKTtcclxuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAvL2lmIGNhcmRzIGRvbid0IGhhdmUgYSBmbGlwcGVkIGNsYXNzLCB0aGV5IGZsaXAgYmFja1xyXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxyXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBwcmV2LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuICAgIH0sIDEwMDApO1xyXG59XHJcbi8vICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLlxyXG5cclxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xyXG59O1xyXG5cclxuJCgoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5pbml0KCk7XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXHJcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcclxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcclxuIl19
