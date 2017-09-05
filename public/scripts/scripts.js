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
        var boardString = "<h2>Leaderboard</h2>";

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJib2FyZFN0cmluZyIsInNvcnQiLCJhIiwiYiIsImkiLCJodG1sIiwiZ2V0Q29udGVudCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwiYnJlZWQiLCJ0aGVuIiwicmVzIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQXFCQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbEMsUUFBSUMsV0FBVyxRQUFmO0FBQ0FDLE1BQUUsYUFBRixFQUFpQkMsS0FBakI7QUFDQSxRQUFJRCxFQUFFLGFBQUYsRUFBaUJFLEdBQWpCLE1BQTBCLEVBQTlCLEVBQWtDO0FBQzlCSCxtQkFBV0MsRUFBRSxhQUFGLEVBQWlCRSxHQUFqQixFQUFYO0FB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LENBQTVCO0FBQ0EsUUFBSUMsdUJBQXVCLEVBQTNCO0FBQ0FBLDJCQUF1QkosS0FBS0UsUUFBTCxDQUFjLGNBQWQsRUFBOEJKLElBQTlCLENBQW1DLE9BQW5DLENBQXZCO0FBQ0FNLDJCQUF1QixNQUFNQSxxQkFBcUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnJDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHhELEVBQUVnRyxvQkFBRixFQUF3QnhDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFpQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E1RyxpQkFBU1MsT0FBVDtBQUNBUSxVQUFFLFFBQUYsRUFBWXNELElBQVosQ0FBaUJ2RSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0Z1RixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUXVDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbEgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTbUgsSUFBVCxHQUFnQixZQUFNO0FBQ2xCbkgsYUFBU2tFLE1BQVQ7QUFDSCxDQUZEOztBQUlBakQsRUFBRSxZQUFNO0FBQ0pqQixhQUFTbUgsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuY291bnRlciA9IDBcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuY2FyZEdhbWUubGVhZEJvYXJkID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2VcclxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcclxuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxyXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxyXG4vLyAgICAgIDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vICAgICAgMi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gICAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXHJcbi8vICAgICAgNC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vICAgICAgNS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cclxuXHJcbmNhcmRHYW1lLm5ld0xlYWQgPSAodGltZXIsIHN0cmluZykgPT4ge1xyXG4gICAgbGV0IHVzZXJuYW1lID0gJ25vTmFtZSc7XHJcbiAgICAkKCcjcGxheWVyTmFtZScpLmVtcHR5KCk7XHJcbiAgICBpZiAoJCgnI3BsYXllck5hbWUnKS52YWwoKSAhPSBcIlwiKSB7XHJcbiAgICAgICAgdXNlcm5hbWUgPSAkKCcjcGxheWVyTmFtZScpLnZhbCgpO1xyXG4gICAgfVxyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLnB1c2goe1xyXG4gICAgICAgIG5hbWU6IHVzZXJuYW1lLFxyXG4gICAgICAgIHRpbWU6IHRpbWVyLFxyXG4gICAgICAgIHRpbWVTdHJpbmc6IHN0cmluZ1xyXG4gICAgfSlcclxufVxyXG5cclxuY2FyZEdhbWUuZGlzcGxheUxlYWQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5sZWFkQm9hcmQub24oXCJ2YWx1ZVwiLCAoc2NvcmVzKSA9PiB7XHJcbiAgICAgICAgbGV0IHRvcEZpdmUgPSBbXTtcclxuICAgICAgICBsZXQgZGF0YUFycmF5ID0gc2NvcmVzLnZhbCgpO1xyXG4gICAgICAgIGxldCBzY29yZXNBcnJheSA9IFtdO1xyXG4gICAgICAgIGxldCBib2FyZFN0cmluZyA9IFwiPGgyPkxlYWRlcmJvYXJkPC9oMj5cIjtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBib2FyZFN0cmluZyArPSAoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9PC9wPmApO1xyXG4gICAgICAgICAgICAkKCcubGVhZGVyQm9hcmQnKS5odG1sKGJvYXJkU3RyaW5nKTtcclxuICAgICAgICB9XHJcbiAgICB9KVxyXG59XHJcblxyXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIixcclxuICAgICAgICAgICAgYnJlZWQ6IFwiUHVnXCJcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIC8vcGljayByYW5kb20gcGhvdG9zIGZyb20gdGhlIEFQSVxyXG4gICAgICAgIGNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zKHJlcyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcclxuY2FyZEdhbWUucGlja1JhbmRQaG90b3MgPSAocmVzKSA9PiB7XHJcbiAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XHJcblxyXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXHJcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xyXG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xyXG4gICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XHJcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgIH1cclxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcclxuICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XHJcbn1cclxuXHJcbi8vZXZlbnQgaGFuZGxlciBmdW5jdGlvblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XHJcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdXZWxjb21lIScsXHJcbiAgICAgICAgICAgIHRleHQ6ICdGaW5kIGFsbCB0aGUgbWF0Y2hlcyBhcyBxdWljayBhcyB5b3UgY2FuLCBhbmQgc2VlIGlmIHlvdSBtYWtlIHlvdXIgd2F5IHRvIHRoZSB0b3Agb2Ygb3VyIGxlYWRlcmJvYXJkISBXcm9vZiEnLFxyXG4gICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXHJcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcclxuICAgICAgICAgICAgJCgnI2dhbWUnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcclxuICAgICAgICAgICAgJCgnI2xhbmRpbmdQYWdlJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xyXG4gICAgbGV0IGN1cnJlbnQgPSAnJztcclxuICAgIGlmIChjYXJkR2FtZS5jbGlja0FsbG93ZWQpIHtcclxuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xyXG4gICAgICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xyXG5cclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG5cclxufVxyXG5cclxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxyXG5jYXJkR2FtZS5zaG93VGltZXIgPSAoKSA9PiB7XHJcbiAgICBsZXQgdGltZVN0cmluZyA9IFwiXCJcclxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBtaW51dGVzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBzdWJTZWNvbmRzU3RyaW5nID0gXCJcIjtcclxuICAgIGxldCBtaW51dGVzO1xyXG4gICAgbGV0IHNlY29uZHM7XHJcbiAgICBsZXQgc3ViU2Vjb25kcztcclxuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5cclxuICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzIDwgOCkge1xyXG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XHJcbiAgICAgICAgY2FyZEdhbWUuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVyKys7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciAlIDEwMDtcclxuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoY2FyZEdhbWUudGltZXIgLyAxMDApICUgNjA7XHJcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAvIDYwKSAlIDYwO1xyXG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA8PSA5KSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0gJzAnICsgc2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9IHNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgbWludXRlc1N0cmluZyA9IE1hdGguZmxvb3IobWludXRlcykudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUudGltZVN0cmluZyA9IGAke21pbnV0ZXNTdHJpbmd9OiR7c2Vjb25kc1N0cmluZ30uJHtzdWJTZWNvbmRzfWBcclxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KSB7XHJcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FyZEdhbWUuaW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnWW91IGRpZCBpdCEnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sOiBgWW91ciBmaW5hbCB0aW1lOiAke2NhcmRHYW1lLnRpbWVTdHJpbmd9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8YSBocmVmPVwiaHR0cHM6Ly90d2l0dGVyLmNvbS9zaGFyZVwiPHNwYW4gY2xhc3M9XCJmYS1zdGFjayBmYS1sZ1wiPjxpIGNsYXNzPVwiZmEgZmEtY2lyY2xlIGZhLXN0YWNrLTJ4XCI+PC9pPjxpIGNsYXNzPVwiZmEgZmEtdHdpdHRlciBmYS1pbnZlcnNlIGZhLXN0YWNrLTF4XCI+PC9pPjwvc3Bhbj48L2E+YCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5uZXdMZWFkKGNhcmRHYW1lLnRpbWVyLCBjYXJkR2FtZS50aW1lU3RyaW5nKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0sIDEwMDApXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAxMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXHJcbiAgICBsZXQgcGlja0FycmF5ID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAxNjsgaSsrKSB7XHJcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxyXG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgICAkKGVsKS5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvL2Fzc2lnbiBhIHJhbmRvbSBjYXJkIG51bWJlciB0byB0aGUgY3VycmVudCBkaXYuY2FyZFxyXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksIDEpO1xyXG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcclxuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xyXG5cclxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcclxuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XHJcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIH0pO1xyXG4gICAgLy9zdGFydCB0aGUgZ2FtZVxyXG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XHJcbn1cclxuXHJcbi8vY2hlY2sgZm9yIG1hdGNoZXMgYmV0d2VlbiB0aGUgdHdvIGNsaWNrZWQgY2FyZHNcclxuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XHJcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcclxuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XHJcbiAgICBsZXQgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSAnJztcclxuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gcHJldi5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG5cclxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcclxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xyXG4gICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XHJcbiAgICAgICAgJCgnI3Njb3JlJykudGV4dChjYXJkR2FtZS5tYXRjaGVzKTtcclxuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXHJcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAvL2lmIGNhcmRzIGRvbid0IGhhdmUgYSBmbGlwcGVkIGNsYXNzLCB0aGV5IGZsaXAgYmFja1xyXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxyXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBwcmV2LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuICAgIH0sIDEwMDApO1xyXG59XHJcbi8vICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLlxyXG5cclxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xyXG59O1xyXG5cclxuJCgoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5pbml0KCk7XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXHJcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcclxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmQiXX0=
