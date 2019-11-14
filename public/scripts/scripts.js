'use strict';

var cardGame = {};
cardGame.key = 'E4iaH4cgjoYeVbN7mDlNf1WcbMvEG3QM9qpH1UeXXp5Y36rbZs';
cardGame.secret = "3oWkr1dFy74ASPoo1zQz5uVvQ42n13xdD9Q9XDmk";
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
    var body = {
        grant_type: 'client_credentials',
        client_id: cardGame.key,
        client_secret: cardGame.secret
    };

    $.ajax({
        url: 'https://api.petfinder.com/v2/oauth2/token',
        method: 'POST',
        dataType: 'json',
        data: body
    }).done(function (oauthRes) {
        $.ajax({
            url: 'https://api.petfinder.com/v2/animals',
            method: 'GET',

            data: {
                type: 'dog',
                breed: 'pug',
                sort: 'random',
                limit: 8
            },
            beforeSend: function beforeSend(request) {
                request.setRequestHeader("Authorization", "Bearer " + oauthRes.access_token);
            }
        }).done(function (res) {
            //pick random photos from the API
            cardGame.pickRandPhotos(res);
        }).fail(function (jqXHR, textStatus, errorThrown) {
            console.error("Petfinder fail");
            console.error({
                jqXHR: jqXHR,
                textStatus: textStatus,
                errorThrown: errorThrown
            });
        });
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("OAuth fail");
        console.error({
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
        });
    });
};

//function to grab 8 random photos from API for the card faces
cardGame.pickRandPhotos = function (res) {
    var petData = res.animals;

    //save all pet photos
    petData.forEach(function (dog) {
        var randomPic = Math.floor(Math.random() * dog.photos.length);
        cardGame.dogPics.push(dog.photos[randomPic].full);
    });

    //pick 8 random ones
    while (cardGame.dogPics.length > 0) {
        var randomPick = Math.floor(Math.random() * cardGame.dogPics.length),
            picked = cardGame.dogPics.splice(randomPick, 1);
        //double up for matching (8 photos = 16 cards)
        cardGame.randPics.push(picked);
        cardGame.randPics.push(picked);
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
    var timeString = "",
        secondsString = "",
        minutesString = "",
        subSecondsString = "",
        minutes = void 0,
        seconds = void 0,
        subSeconds = void 0;
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJzZWNyZXQiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInVzZXJuYW1lIiwiJCIsImVtcHR5IiwidmFsIiwicHVzaCIsIm5hbWUiLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5Iiwic2NvcmVzQXJyYXkiLCJib2FyZFN0cmluZyIsInNvcnQiLCJhIiwiYiIsImkiLCJodG1sIiwiZ2V0Q29udGVudCIsImJvZHkiLCJncmFudF90eXBlIiwiY2xpZW50X2lkIiwiY2xpZW50X3NlY3JldCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJkb25lIiwib2F1dGhSZXMiLCJ0eXBlIiwiYnJlZWQiLCJsaW1pdCIsImJlZm9yZVNlbmQiLCJyZXF1ZXN0Iiwic2V0UmVxdWVzdEhlYWRlciIsImFjY2Vzc190b2tlbiIsInJlcyIsInBpY2tSYW5kUGhvdG9zIiwiZmFpbCIsImpxWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwiY29uc29sZSIsImVycm9yIiwicGV0RGF0YSIsImFuaW1hbHMiLCJmb3JFYWNoIiwiZG9nIiwicmFuZG9tUGljIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwicGhvdG9zIiwibGVuZ3RoIiwiZnVsbCIsInJhbmRvbVBpY2siLCJwaWNrZWQiLCJzcGxpY2UiLCJkaXNwbGF5Q29udGVudCIsImV2ZW50cyIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsInRoZW4iLCJjc3MiLCJtYXRjaEdhbWUiLCJjdXJyZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwic2Vjb25kc1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsInRvU3RyaW5nIiwiY2xlYXJJbnRlcnZhbCIsInNldFRpbWVvdXQiLCJwaWNrQXJyYXkiLCJlYWNoIiwiZWwiLCJyYW5kQ2xhc3MiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJhdHRyIiwiYWRkQ2xhc3MiLCJwcmV2IiwiY3VycmVudERvZ1BpY3NDbGFzcyIsImNoaWxkcmVuIiwicmVwbGFjZSIsInByZXZpb3VzRG9nUGljc0NsYXNzIiwicmVtb3ZlQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsb0RBQWY7QUFDQUQsU0FBU0UsTUFBVCxHQUFrQiwwQ0FBbEI7QUFDQUYsU0FBU0csT0FBVCxHQUFtQixFQUFuQjtBQUNBSCxTQUFTSSxRQUFULEdBQW9CLEVBQXBCO0FBQ0FKLFNBQVNLLEtBQVQsR0FBaUIsQ0FBakI7QUFDQUwsU0FBU00sT0FBVCxHQUFtQixDQUFuQjtBQUNBTixTQUFTTyxTQUFULEdBQXFCLEtBQXJCO0FBQ0FQLFNBQVNRLFFBQVQ7QUFDQVIsU0FBU1MsWUFBVCxHQUF3QixJQUF4QjtBQUNBVCxTQUFTVSxPQUFULEdBQW1CLENBQW5CO0FBQ0FWLFNBQVNXLFNBQVQsR0FBcUJDLFNBQVNDLFFBQVQsR0FBb0JDLEdBQXBCLEVBQXJCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVB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S0QsUUFBTCxDQUFjLE9BQWQ7QUFDQXpILGlCQUFTVSxPQUFUO0FBQ0FRLFVBQUUsUUFBRixFQUFZa0UsSUFBWixDQUFpQnBGLFNBQVNVLE9BQTFCO0FBQ0gsS0Fmb0MsQ0FlbkM7QUFDRm9HLGVBQVcsWUFBTTtBQUNiO0FBQ0E7QUFDQXJCLGdCQUFRc0MsV0FBUixDQUFvQixTQUFwQjtBQUNBTCxhQUFLSyxXQUFMLENBQWlCLFNBQWpCO0FBQ0EvSCxpQkFBU1MsWUFBVCxHQUF3QixJQUF4QjtBQUNILEtBTkQsRUFNRyxJQU5IO0FBT0gsQ0F2QkQ7QUF3QkE7O0FBRUFULFNBQVNnSSxJQUFULEdBQWdCLFlBQU07QUFDbEJoSSxhQUFTK0UsTUFBVDtBQUNILENBRkQ7O0FBSUE3RCxFQUFFLFlBQU07QUFDSmxCLGFBQVNnSSxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XHJcbmNhcmRHYW1lLmtleSA9ICdFNGlhSDRjZ2pvWWVWYk43bURsTmYxV2NiTXZFRzNRTTlxcEgxVWVYWHA1WTM2cmJacyc7XHJcbmNhcmRHYW1lLnNlY3JldCA9IFwiM29Xa3IxZEZ5NzRBU1BvbzF6UXo1dVZ2UTQybjEzeGREOVE5WERta1wiO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuY291bnRlciA9IDBcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzO1xyXG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcclxuY2FyZEdhbWUubGVhZEJvYXJkID0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG4vL2xlYWRlcmJvYXJkIEZpcmViYXNlXHJcblxyXG5jYXJkR2FtZS5uZXdMZWFkID0gKHRpbWVyLCBzdHJpbmcpID0+IHtcclxuICAgIGxldCB1c2VybmFtZSA9ICdub05hbWUnO1xyXG4gICAgJCgnI3BsYXllck5hbWUnKS5lbXB0eSgpO1xyXG4gICAgaWYgKCQoJyNwbGF5ZXJOYW1lJykudmFsKCkgIT0gXCJcIikge1xyXG4gICAgICAgIHVzZXJuYW1lID0gJCgnI3BsYXllck5hbWUnKS52YWwoKTtcclxuICAgIH1cclxuICAgIGNhcmRHYW1lLmxlYWRCb2FyZC5wdXNoKHtcclxuICAgICAgICBuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuICAgICAgICBsZXQgYm9hcmRTdHJpbmcgPSAnPGgyPkxlYWRlcmJvYXJkPC9oMj4nO1xyXG5cclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDU7IGkrKykge1xyXG4gICAgICAgICAgICBib2FyZFN0cmluZyArPSAoYDxwPiR7c2NvcmVzQXJyYXlbaV0ubmFtZX0gOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9PC9wPmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKCcubGVhZGVyQm9hcmQnKS5odG1sKGJvYXJkU3RyaW5nKTtcclxuICAgIH0pXHJcbn1cclxuXHJcbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcclxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcclxuICAgIGNvbnN0IGJvZHkgPSB7XHJcbiAgICAgICAgZ3JhbnRfdHlwZTogJ2NsaWVudF9jcmVkZW50aWFscycsXHJcbiAgICAgICAgY2xpZW50X2lkOiBjYXJkR2FtZS5rZXksXHJcbiAgICAgICAgY2xpZW50X3NlY3JldDogY2FyZEdhbWUuc2VjcmV0LFxyXG4gICAgfTtcclxuXHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHBzOi8vYXBpLnBldGZpbmRlci5jb20vdjIvb2F1dGgyL3Rva2VuYCxcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb24nLFxyXG4gICAgICAgIGRhdGE6IGJvZHlcclxuICAgIH0pLmRvbmUoZnVuY3Rpb24gKG9hdXRoUmVzKSB7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBgaHR0cHM6Ly9hcGkucGV0ZmluZGVyLmNvbS92Mi9hbmltYWxzYCxcclxuICAgICAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuXHJcbiAgICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgICAgIHR5cGU6ICdkb2cnLFxyXG4gICAgICAgICAgICAgICAgYnJlZWQ6ICdwdWcnLFxyXG4gICAgICAgICAgICAgICAgc29ydDogJ3JhbmRvbScsXHJcbiAgICAgICAgICAgICAgICBsaW1pdDogOFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAocmVxdWVzdCkge1xyXG4gICAgICAgICAgICAgICAgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKFwiQXV0aG9yaXphdGlvblwiLCBcIkJlYXJlciBcIiArIG9hdXRoUmVzLmFjY2Vzc190b2tlbilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcclxuICAgICAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcclxuICAgICAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIlBldGZpbmRlciBmYWlsXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHtcclxuICAgICAgICAgICAgICAgIGpxWEhSLFxyXG4gICAgICAgICAgICAgICAgdGV4dFN0YXR1cyxcclxuICAgICAgICAgICAgICAgIGVycm9yVGhyb3duXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSk7XHJcbiAgICB9KS5mYWlsKGZ1bmN0aW9uIChqcVhIUiwgdGV4dFN0YXR1cywgZXJyb3JUaHJvd24pIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiT0F1dGggZmFpbFwiKTtcclxuICAgICAgICBjb25zb2xlLmVycm9yKHtcclxuICAgICAgICAgICAganFYSFIsXHJcbiAgICAgICAgICAgIHRleHRTdGF0dXMsXHJcbiAgICAgICAgICAgIGVycm9yVGhyb3duXHJcbiAgICAgICAgfSlcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xyXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcclxuICAgIGxldCBwZXREYXRhID0gcmVzLmFuaW1hbHM7XHJcblxyXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXHJcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xyXG4gICAgICAgIGxldCByYW5kb21QaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBkb2cucGhvdG9zLmxlbmd0aCk7XHJcbiAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5waG90b3NbcmFuZG9tUGljXS5mdWxsKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXHJcbiAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCksXHJcbiAgICAgICAgICAgIHBpY2tlZCA9IGNhcmRHYW1lLmRvZ1BpY3Muc3BsaWNlKHJhbmRvbVBpY2ssIDEpO1xyXG4gICAgICAgIC8vZG91YmxlIHVwIGZvciBtYXRjaGluZyAoOCBwaG90b3MgPSAxNiBjYXJkcylcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKHBpY2tlZCk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChwaWNrZWQpO1xyXG4gICAgfVxyXG4gICAgLy9hcHBlbmQgdGhlIGRvZyBwaWNzIHRvIHRoZSBjYXJkcyBvbiB0aGUgcGFnZVxyXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcclxufVxyXG5cclxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXHJcbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcclxuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1dlbGNvbWUhJyxcclxuICAgICAgICAgICAgdGV4dDogJ0ZpbmQgYWxsIHRoZSBtYXRjaGVzIGFzIHF1aWNrIGFzIHlvdSBjYW4sIGFuZCBzZWUgaWYgeW91IG1ha2UgeW91ciB3YXkgdG8gdGhlIHRvcCBvZiBvdXIgbGVhZGVyYm9hcmQhIFdyb29mIScsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xyXG4gICAgICAgICAgICAkKCcjZ2FtZScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xyXG4gICAgICAgICAgICAkKCcjbGFuZGluZ1BhZ2UnKS5jc3MoJ2Rpc3BsYXknLCAnbm9uZScpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5kaXNwbGF5TGVhZCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XHJcbiAgICBsZXQgY3VycmVudCA9ICcnO1xyXG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCkge1xyXG4gICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7XHJcbiAgICAgICAgJCgnLmNhcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xyXG5cclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vY2FsY3VsYXRlIGFuZCBkaXNwbGF5IHRpbWVyIG9uIHBhZ2VcclxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xyXG4gICAgbGV0IHRpbWVTdHJpbmcgPSBcIlwiLFxyXG4gICAgICAgIHNlY29uZHNTdHJpbmcgPSBcIlwiLFxyXG4gICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBcIlwiLFxyXG4gICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiLFxyXG4gICAgICAgIG1pbnV0ZXMsIHNlY29uZHMsIHN1YlNlY29uZHM7XHJcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuXHJcbiAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA8IDgpIHtcclxuICAgICAgICAvL3RpbWVyIGZvcm1hdCBtbTpzcy54eFxyXG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xyXG4gICAgICAgICAgICBzdWJTZWNvbmRzID0gY2FyZEdhbWUudGltZXIgJSAxMDA7XHJcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xyXG4gICAgICAgICAgICBtaW51dGVzID0gKChjYXJkR2FtZS50aW1lciAvIDEwMCkgLyA2MCkgJSA2MDtcclxuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xyXG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXHJcbiAgICAgICAgICAgICQoJyN0aW1lJykudGV4dChjYXJkR2FtZS50aW1lU3RyaW5nKTtcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aXRsZTogJ1lvdSBkaWQgaXQhJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmVcIjxzcGFuIGNsYXNzPVwiZmEtc3RhY2sgZmEtbGdcIj48aSBjbGFzcz1cImZhIGZhLWNpcmNsZSBmYS1zdGFjay0yeFwiPjwvaT48aSBjbGFzcz1cImZhIGZhLXR3aXR0ZXIgZmEtaW52ZXJzZSBmYS1zdGFjay0xeFwiPjwvaT48L3NwYW4+PC9hPmAsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUubmV3TGVhZChjYXJkR2FtZS50aW1lciwgY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSwgMTApO1xyXG4gICAgfVxyXG59XHJcblxyXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcclxuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxyXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTY7IGkrKykge1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLCAxKTtcclxuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XHJcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XHJcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcclxuXHJcbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXHJcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTtcclxuICAgIC8vc3RhcnQgdGhlIGdhbWVcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59XHJcblxyXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXHJcbmNhcmRHYW1lLmNoZWNrTWF0Y2ggPSAoY3VycmVudCwgcHJldikgPT4ge1xyXG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXHJcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuXHJcbiAgICAvLyBpZiB0aGUgY2FyZHMgbWF0Y2gsIGdpdmUgdGhlbSBhIGNsYXNzIG9mIG1hdGNoXHJcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcclxuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIHByZXYuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xyXG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XHJcbiAgICB9IC8vIHJlbW92ZSB0aGUgY2xhc3Mgb2YgZmxpcHBlZFxyXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcclxuICAgICAgICAvL2lmIGNhcmRzIGhhdmUgYSBjbGFzcyBvZiBtYXRjaCwgdGhleSBzdGF5IGZsaXBwZWRcclxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbiAgICB9LCAxMDAwKTtcclxufVxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxufTtcclxuXHJcbiQoKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxyXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXHJcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kIl19
