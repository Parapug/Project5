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
// 		1. On click of a card, it flips and reveals a doge
// 		2. On click of a second card, it also flips and reveals a doge
// 		3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
// 		4. Once the # of matches = 8, then the timer stops and the game is over.
// 		5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJib2FyZFN0cmluZyIsInNvcnQiLCJhIiwiYiIsImkiLCJodG1sIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQXFCQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbEMsUUFBSUMsV0FBVyxRQUFmO0FBQ0FDLE1BQUUsYUFBRixFQUFpQkMsS0FBakI7QUFDQSxRQUFJRCxFQUFFLGFBQUYsRUFBaUJFLEdBQWpCLE1BQTBCLEVBQTlCLEVBQWtDO0FBQzlCSCxtQkFBV0MsRUFBRSxhQUFGLEVBQWlCRSxHQUFqQixF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LEVBQTVDLENBQTVCO0FBQ0EsUUFBSUMsdUJBQXVCLEVBQTNCO0FBQ0FBLDJCQUF1QkosS0FBS0UsUUFBTCxDQUFjLGNBQWQsRUFBOEJKLElBQTlCLENBQW1DLE9BQW5DLENBQXZCO0FBQ0FNLDJCQUF1QixNQUFNQSxxQkFBcUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnJDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHhELEVBQUVnRyxvQkFBRixFQUF3QnhDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFpQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E1RyxpQkFBU1MsT0FBVDtBQUNBUSxVQUFFLFFBQUYsRUFBWXNELElBQVosQ0FBaUJ2RSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0Z1RixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUXVDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbEgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTbUgsSUFBVCxHQUFnQixZQUFNO0FBQ2xCbkgsYUFBU2tFLE1BQVQ7QUFDSCxDQUZEOztBQUlBakQsRUFBRSxZQUFNO0FBQ0pqQixhQUFTbUgsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuY291bnRlciA9IDBcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuY2FyZEdhbWUubGVhZEJvYXJkID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG4vL2xlYWRlcmJvYXJkIEZpcmViYXNlXHJcblxyXG5jYXJkR2FtZS5uZXdMZWFkID0gKHRpbWVyLCBzdHJpbmcpID0+IHtcclxuICAgIGxldCB1c2VybmFtZSA9ICdub05hbWUnO1xyXG4gICAgJCgnI3BsYXllck5hbWUnKS5lbXB0eSgpO1xyXG4gICAgaWYgKCQoJyNwbGF5ZXJOYW1lJykudmFsKCkgIT0gXCJcIikge1xyXG4gICAgICAgIHVzZXJuYW1lID0gJCgnI3BsYXllck5hbWUnKS52YWwoKTtcclxuICAgIH1cclxuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5wdXNoKHtcclxuICAgICAgICBuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuICAgICAgICBsZXQgYm9hcmRTdHJpbmcgPSAnPGgyPkxlYWRlcmJvYXJkPC9oMj4nO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZGF0YUFycmF5KSB7XHJcbiAgICAgICAgICAgIHNjb3Jlc0FycmF5LnB1c2goZGF0YUFycmF5W2tleV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2NvcmVzQXJyYXkuc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgICByZXR1cm4gYS50aW1lIC0gYi50aW1lO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgNTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGJvYXJkU3RyaW5nICs9IChgPHA+JHtzY29yZXNBcnJheVtpXS5uYW1lfSA6ICR7c2NvcmVzQXJyYXlbaV0udGltZVN0cmluZ308L3A+YCk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgICAgICQoJy5sZWFkZXJCb2FyZCcpLmh0bWwoYm9hcmRTdHJpbmcpO1xyXG4gICAgfSlcclxufVxyXG5cclxuLy9BSkFYIGNhbGwgdG8gUGV0ZmluZGVyIEFQSVxyXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcclxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXHJcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCIsXHJcbiAgICAgICAgICAgIGJyZWVkOiBcIlB1Z1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcclxuICAgICAgICBjYXJkR2FtZS5waWNrUmFuZFBob3RvcyhyZXMpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbi8vZnVuY3Rpb24gdG8gZ3JhYiA4IHJhbmRvbSBwaG90b3MgZnJvbSBBUEkgZm9yIHRoZSBjYXJkIGZhY2VzXHJcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xyXG4gICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xyXG5cclxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xyXG4gICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcclxuICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVsnJHQnXSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvL3BpY2sgOCByYW5kb20gb25lc1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICBsZXQgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcclxuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xyXG4gICAgICAgICAgICAgICAgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vZG91YmxlIHVwIGZvciBtYXRjaGluZyAoOCBwaG90b3MgPSAxNiBjYXJkcylcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICB9XHJcbiAgICAvL2FwcGVuZCB0aGUgZG9nIHBpY3MgdG8gdGhlIGNhcmRzIG9uIHRoZSBwYWdlXHJcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xyXG59XHJcblxyXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cclxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xyXG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKGUpID0+IHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiAnV2VsY29tZSEnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnRmluZCBhbGwgdGhlIG1hdGNoZXMgYXMgcXVpY2sgYXMgeW91IGNhbiwgYW5kIHNlZSBpZiB5b3UgbWFrZSB5b3VyIHdheSB0byB0aGUgdG9wIG9mIG91ciBsZWFkZXJib2FyZCEgV3Jvb2YhJyxcclxuICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xyXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgICAgICQoJyNnYW1lJykuY3NzKCdkaXNwbGF5JywgJ2Jsb2NrJyk7XHJcbiAgICAgICAgICAgICQoJyNsYW5kaW5nUGFnZScpLmNzcygnZGlzcGxheScsICdub25lJyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmRpc3BsYXlMZWFkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcclxuICAgIGxldCBjdXJyZW50ID0gJyc7XHJcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKSB7XHJcbiAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyKys7XHJcblxyXG4gICAgICAgICAgICAvL3N0YXJ0IHRoZSB0aW1lciBhZnRlciB0aGUgZmlyc3QgY2FyZCBpcyBjbGlja2VkXHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5nYW1lU3RhcnQpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vcnVuIGZ1bmN0aW9uIGhhbmRsaW5nIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWCgkKHRoaXMpLCBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LCBjYXJkR2FtZS5jb3VudGVyKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy9mdW5jdGlvbiBmb3IgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcclxuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xyXG4gICAgJCgnI3Njb3JlJykudGV4dChjYXJkR2FtZS5tYXRjaGVzKTtcclxuXHJcbiAgICBpZiAoIShjLmNvbnRhaW5zKCdmbGlwcGVkJykgfHwgYy5jb250YWlucygnbWF0Y2gnKSkpIHtcclxuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xyXG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxyXG4gICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxyXG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXHJcbmNhcmRHYW1lLnNob3dUaW1lciA9ICgpID0+IHtcclxuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxyXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IG1pbnV0ZXNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IG1pbnV0ZXM7XHJcbiAgICBsZXQgc2Vjb25kcztcclxuICAgIGxldCBzdWJTZWNvbmRzO1xyXG4gICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KSB7XHJcbiAgICAgICAgLy90aW1lciBmb3JtYXQgbW06c3MueHhcclxuICAgICAgICBjYXJkR2FtZS5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcclxuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKztcclxuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyICUgMTAwO1xyXG4gICAgICAgICAgICBzdWJTZWNvbmRzU3RyaW5nID0gc3ViU2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lciAvIDEwMCkgJSA2MDtcclxuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIgLyAxMDApIC8gNjApICUgNjA7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRzIDw9IDkpIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSAnMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0gc2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBtaW51dGVzU3RyaW5nID0gTWF0aC5mbG9vcihtaW51dGVzKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lU3RyaW5nID0gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfS4ke3N1YlNlY29uZHN9YFxyXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQoY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzID49IDgpIHtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYXJkR2FtZS5pbnRlcnZhbCk7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdZb3UgZGlkIGl0IScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGh0bWw6IGBZb3VyIGZpbmFsIHRpbWU6ICR7Y2FyZEdhbWUudGltZVN0cmluZ31cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlXCI8c3BhbiBjbGFzcz1cImZhLXN0YWNrIGZhLWxnXCI+PGkgY2xhc3M9XCJmYSBmYS1jaXJjbGUgZmEtc3RhY2stMnhcIj48L2k+PGkgY2xhc3M9XCJmYSBmYS10d2l0dGVyIGZhLWludmVyc2UgZmEtc3RhY2stMXhcIj48L2k+PC9zcGFuPjwvYT5gLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLm5ld0xlYWQoY2FyZEdhbWUudGltZXIsIGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSwgMTAwMClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDEwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAvL21ha2UgYW4gYXJyYXkgb2YgbnVtYmVycyBmcm9tIDEtMTYgZm9yIGNhcmQgaWRlbnRpZmljYXRpb25cclxuICAgIGxldCBwaWNrQXJyYXkgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDE2OyBpKyspIHtcclxuICAgICAgICBwaWNrQXJyYXkucHVzaChpKTtcclxuICAgIH1cclxuXHJcbiAgICAvL2Fzc2lnbiBhIGNhcmQgcGljIHRvIGVhY2ggZGl2XHJcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xyXG4gICAgICAgICQoZWwpLmVtcHR5KCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIGEgcmFuZG9tIGNhcmQgbnVtYmVyIHRvIHRoZSBjdXJyZW50IGRpdi5jYXJkXHJcbiAgICAgICAgbGV0IHJhbmRDbGFzcyA9IHBpY2tBcnJheS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKSwgMSk7XHJcbiAgICAgICAgbGV0IHBpY3NUb1VzZSA9IGNhcmRHYW1lLnJhbmRQaWNzO1xyXG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvL2Fzc2lnbiB0aGUgZXF1aXZhbGVudCAuZG9nUGljcyMgY2xhc3MgdG8gdGhlIGRpdlxyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XHJcblxyXG4gICAgICAgIC8vYmFja2dyb3VuZCBpbWFnZSBvZiB0aGUgZGl2IGlzIGEgcmFuZG9tIGRvZ1xyXG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XHJcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XHJcbiAgICAgICAgJChlbCkuYXR0cignc3R5bGUnLCBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cGljU3RyaW5nWzBdfSlgKTtcclxuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgfSk7XHJcbiAgICAvL3N0YXJ0IHRoZSBnYW1lXHJcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcclxufVxyXG5cclxuLy9jaGVjayBmb3IgbWF0Y2hlcyBiZXR3ZWVuIHRoZSB0d28gY2xpY2tlZCBjYXJkc1xyXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcclxuICAgIC8vaXNvbGF0ZSB0aGUgZG9nUGljcyMgY2xhc3MgZnJvbSAuY2FyZF9fZnJvbnQgb2YgYm90aCBjYXJkc1xyXG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gXCIuXCIgKyBjdXJyZW50RG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcnO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSAnLicgKyBwcmV2aW91c0RvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XHJcblxyXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxyXG4gICAgaWYgKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XHJcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLm1hdGNoZXMrKztcclxuICAgICAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xyXG4gICAgfSAvLyByZW1vdmUgdGhlIGNsYXNzIG9mIGZsaXBwZWRcclxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgIC8vaWYgY2FyZHMgZG9uJ3QgaGF2ZSBhIGZsaXBwZWQgY2xhc3MsIHRoZXkgZmxpcCBiYWNrXHJcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXHJcbiAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG4gICAgfSwgMTAwMCk7XHJcbn1cclxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXHJcblxyXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XHJcbn07XHJcblxyXG4kKCgpID0+IHtcclxuICAgIGNhcmRHYW1lLmluaXQoKTtcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcclxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxyXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZCJdfQ==
