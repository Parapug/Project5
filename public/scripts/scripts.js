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
            $('.leaderBoard').html(boardString);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJib2FyZFN0cmluZyIsInNvcnQiLCJhIiwiYiIsImkiLCJodG1sIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQXFCQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFyQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbEMsUUFBSUMsV0FBVyxRQUFmO0FBQ0FDLE1BQUUsYUFBRixFQUFpQkMsS0FBakI7QUFDQSxRQUFJRCxFQUFFLGFBQUYsRUFBaUJFLEdBQWpCLE1BQTBCLEVBQTlCLEVBQWtDO0FBQzlCSCxtQkFBV0MsRUFBRSxhQUFGLEVBQWlCRSxHQUFqQixF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LEVBQTVDLENBQTVCO0FBQ0EsUUFBSUMsdUJBQXVCLEVBQTNCO0FBQ0FBLDJCQUF1QkosS0FBS0UsUUFBTCxDQUFjLGNBQWQsRUFBOEJKLElBQTlCLENBQW1DLE9BQW5DLENBQXZCO0FBQ0FNLDJCQUF1QixNQUFNQSxxQkFBcUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnJDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHhELEVBQUVnRyxvQkFBRixFQUF3QnhDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFpQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E1RyxpQkFBU1MsT0FBVDtBQUNBUSxVQUFFLFFBQUYsRUFBWXNELElBQVosQ0FBaUJ2RSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0Z1RixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUXVDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbEgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTbUgsSUFBVCxHQUFnQixZQUFNO0FBQ2xCbkgsYUFBU2tFLE1BQVQ7QUFDSCxDQUZEOztBQUlBakQsRUFBRSxZQUFNO0FBQ0pqQixhQUFTbUgsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuY291bnRlciA9IDBcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuY2FyZEdhbWUubGVhZEJvYXJkID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG4vL2xlYWRlcmJvYXJkIEZpcmViYXNlXHJcblxyXG5jYXJkR2FtZS5uZXdMZWFkID0gKHRpbWVyLCBzdHJpbmcpID0+IHtcclxuICAgIGxldCB1c2VybmFtZSA9ICdub05hbWUnO1xyXG4gICAgJCgnI3BsYXllck5hbWUnKS5lbXB0eSgpO1xyXG4gICAgaWYgKCQoJyNwbGF5ZXJOYW1lJykudmFsKCkgIT0gXCJcIikge1xyXG4gICAgICAgIHVzZXJuYW1lID0gJCgnI3BsYXllck5hbWUnKS52YWwoKTtcclxuICAgIH1cclxuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5wdXNoKHtcclxuICAgICAgICBuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuICAgICAgICBsZXQgYm9hcmRTdHJpbmcgPSAnPGgyPkxlYWRlcmJvYXJkPC9oMj4nO1xyXG5cclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBib2FyZFN0cmluZyArPSAoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9PC9wPmApO1xyXG4gICAgICAgICAgICAkKCcubGVhZGVyQm9hcmQnKS5odG1sKGJvYXJkU3RyaW5nKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIixcclxuICAgICAgICAgICAgYnJlZWQ6IFwiUHVnXCJcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIC8vcGljayByYW5kb20gcGhvdG9zIGZyb20gdGhlIEFQSVxyXG4gICAgICAgIGNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zKHJlcyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcclxuY2FyZEdhbWUucGlja1JhbmRQaG90b3MgPSAocmVzKSA9PiB7XHJcbiAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XHJcblxyXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXHJcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xyXG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xyXG4gICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XHJcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgIH1cclxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcclxuICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XHJcbn1cclxuXHJcbi8vZXZlbnQgaGFuZGxlciBmdW5jdGlvblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XHJcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdXZWxjb21lIScsXHJcbiAgICAgICAgICAgIHRleHQ6ICdGaW5kIGFsbCB0aGUgbWF0Y2hlcyBhcyBxdWljayBhcyB5b3UgY2FuLCBhbmQgc2VlIGlmIHlvdSBtYWtlIHlvdXIgd2F5IHRvIHRoZSB0b3Agb2Ygb3VyIGxlYWRlcmJvYXJkISBXcm9vZiEnLFxyXG4gICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcclxuICAgICAgICAgICAgJCgnI2dhbWUnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgJCgnI2xhbmRpbmdQYWdlJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xyXG4gICAgbGV0IGN1cnJlbnQgPSAnJztcclxuICAgIGlmIChjYXJkR2FtZS5jbGlja0FsbG93ZWQpIHtcclxuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xyXG5cclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vY2FsY3VsYXRlIGFuZCBkaXNwbGF5IHRpbWVyIG9uIHBhZ2VcclxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xyXG4gICAgbGV0IHRpbWVTdHJpbmcgPSBcIlwiXHJcbiAgICBsZXQgc2Vjb25kc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgbWludXRlc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgc3ViU2Vjb25kc1N0cmluZyA9IFwiXCI7XHJcbiAgICBsZXQgbWludXRlcztcclxuICAgIGxldCBzZWNvbmRzO1xyXG4gICAgbGV0IHN1YlNlY29uZHM7XHJcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA8IDgpIHtcclxuICAgICAgICAvL3RpbWVyIGZvcm1hdCBtbTpzcy54eFxyXG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xyXG4gICAgICAgICAgICBzdWJTZWNvbmRzID0gY2FyZEdhbWUudGltZXIgJSAxMDA7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xyXG4gICAgICAgICAgICBtaW51dGVzID0gKChjYXJkR2FtZS50aW1lciAvIDEwMCkgLyA2MCkgJSA2MDtcclxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXHJcbiAgICAgICAgICAgICQoJyN0aW1lJykudGV4dChjYXJkR2FtZS50aW1lU3RyaW5nKTtcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1lvdSBkaWQgaXQhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmVcIjxzcGFuIGNsYXNzPVwiZmEtc3RhY2sgZmEtbGdcIj48aSBjbGFzcz1cImZhIGZhLWNpcmNsZSBmYS1zdGFjay0yeFwiPjwvaT48aSBjbGFzcz1cImZhIGZhLXR3aXR0ZXIgZmEtaW52ZXJzZSBmYS1zdGFjay0xeFwiPjwvaT48L3NwYW4+PC9hPmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUubmV3TGVhZChjYXJkR2FtZS50aW1lciwgY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcclxuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxyXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTY7IGkrKykge1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLCAxKTtcclxuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XHJcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XHJcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcclxuXHJcbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXHJcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTtcclxuICAgIC8vc3RhcnQgdGhlIGdhbWVcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59XHJcblxyXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXHJcbmNhcmRHYW1lLmNoZWNrTWF0Y2ggPSAoY3VycmVudCwgcHJldikgPT4ge1xyXG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXHJcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgY2FyZHMgbWF0Y2gsIGdpdmUgdGhlbSBhIGNsYXNzIG9mIG1hdGNoXHJcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcclxuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIHByZXYuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xyXG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XHJcbiAgICB9IC8vIHJlbW92ZSB0aGUgY2xhc3Mgb2YgZmxpcHBlZFxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcclxuICAgICAgICAvL2lmIGNhcmRzIGhhdmUgYSBjbGFzcyBvZiBtYXRjaCwgdGhleSBzdGF5IGZsaXBwZWRcclxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxufTtcclxuXHJcbiQoKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxyXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXHJcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kIl19
