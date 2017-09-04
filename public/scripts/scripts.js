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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInB1c2giLCJuYW1lIiwiJCIsInZhbCIsInRpbWUiLCJ0aW1lU3RyaW5nIiwiZGlzcGxheUxlYWQiLCJvbiIsInNjb3JlcyIsInRvcEZpdmUiLCJkYXRhQXJyYXkiLCJzY29yZXNBcnJheSIsInNvcnQiLCJhIiwiYiIsImkiLCJhcHBlbmQiLCJnZXRDb250ZW50IiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJicmVlZCIsInRoZW4iLCJyZXMiLCJwaWNrUmFuZFBob3RvcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJlIiwicHJldmVudERlZmF1bHQiLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJjc3MiLCJtYXRjaEdhbWUiLCJjdXJyZW50Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwic2Vjb25kc1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsInRvU3RyaW5nIiwiY2xlYXJJbnRlcnZhbCIsInNldFRpbWVvdXQiLCJodG1sIiwiY29uc29sZSIsImxvZyIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQW9CQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbENmLGFBQVNVLFNBQVQsQ0FBbUJNLElBQW5CLENBQXdCO0FBQ3BCQyxjQUFNQyxFQUFFLGFBQUYsRUFBaUJDLEdBQWpCLEVBRGM7QUFFcEJDLGNBQU1oQixLQUZjO0FBR3BCaUIsb0JBQVlOO0FBSFEsS0FBeEI7QUFLSCxDQU5EOztBQVFBZixTQUFTc0Is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QTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnpDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHBELEVBQUVnRyxvQkFBRixFQUF3QjVDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFxQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E3RyxpQkFBU1MsT0FBVDtBQUNBUyxVQUFFLFFBQUYsRUFBWWtELElBQVosQ0FBaUJwRSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0ZvRixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUTJDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbkgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTb0gsSUFBVCxHQUFnQixZQUFNO0FBQ2xCcEgsYUFBUytELE1BQVQ7QUFDSCxDQUZEOztBQUlBN0MsRUFBRSxZQUFNO0FBQ0psQixhQUFTb0gsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XG5jYXJkR2FtZS50aW1lciA9IDA7XG5jYXJkR2FtZS5jb3VudGVyID0gMFxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG5jYXJkR2FtZS5wcmV2aW91cztcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcbmNhcmRHYW1lLmxlYWRCb2FyZD0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vICAgICAgMS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vICAgICAgMi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vICAgICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gICAgICA0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cbi8vICAgICAgNS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cblxuY2FyZEdhbWUubmV3TGVhZCA9ICh0aW1lciwgc3RyaW5nKSA9PiB7XG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLnB1c2goe1xuICAgICAgICBuYW1lOiAkKCcjcGxheWVyTmFtZScpLnZhbCgpLFxuICAgICAgICB0aW1lOiB0aW1lcixcbiAgICAgICAgdGltZVN0cmluZzogc3RyaW5nXG4gICAgfSlcbn1cblxuY2FyZEdhbWUuZGlzcGxheUxlYWQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xuICAgICAgICBsZXQgdG9wRml2ZSA9IFtdO1xuICAgICAgICBsZXQgZGF0YUFycmF5ID0gc2NvcmVzLnZhbCgpO1xuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZGF0YUFycmF5KSB7XG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWU7XG4gICAgICAgIH0pXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICQoJy5sZWFkZXJCb2FyZCcpLmFwcGVuZChgPHA+JHtzY29yZXNBcnJheVtpXS5uYW1lfSA6ICR7c2NvcmVzQXJyYXlbaV0udGltZVN0cmluZ31gKTtcbiAgICAgICAgfVxuICAgIH0pXG59XG5cbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCIsXG4gICAgICAgICAgICBicmVlZDogXCJQdWdcIlxuICAgICAgICB9XG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIC8vcGljayByYW5kb20gcGhvdG9zIGZyb20gdGhlIEFQSVxuICAgICAgICBjYXJkR2FtZS5waWNrUmFuZFBob3RvcyhyZXMpO1xuICAgIH0pO1xufVxuXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xuY2FyZEdhbWUucGlja1JhbmRQaG90b3MgPSAocmVzKSA9PiB7XG4gICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xuXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXG4gICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcbiAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bJyR0J10pO1xuICAgIH0pO1xuXG4gICAgLy9waWNrIDggcmFuZG9tIG9uZXNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICBsZXQgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCgocGljKSA9PiB7XG4gICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XG4gICAgICAgICAgICAgICAgcmFuZG9tUGljayA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vZG91YmxlIHVwIGZvciBtYXRjaGluZyAoOCBwaG90b3MgPSAxNiBjYXJkcylcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICB9XG4gICAgLy9hcHBlbmQgdGhlIGRvZyBwaWNzIHRvIHRoZSBjYXJkcyBvbiB0aGUgcGFnZVxuICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XG59XG5cbi8vZXZlbnQgaGFuZGxlciBmdW5jdGlvblxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgc3dhbCh7XG4gICAgICAgICAgICB0aXRsZTogJ1dlbGNvbWUhJyxcbiAgICAgICAgICAgIHRleHQ6ICdGaW5kIGFsbCB0aGUgbWF0Y2hlcyBhcyBxdWljayBhcyB5b3UgY2FuLCBhbmQgc2VlIGlmIHlvdSBtYWtlIHlvdXIgd2F5IHRvIHRoZSB0b3Agb2Ygb3VyIGxlYWRlcmJvYXJkISBXcm9vZiEnLFxuICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XG4gICAgICAgICAgICAkKCcjZ2FtZScpLmNzcygnZGlzcGxheScsICdibG9jaycpO1xuICAgICAgICAgICAgJCgnI2xhbmRpbmdQYWdlJykuY3NzKCdkaXNwbGF5JywgJ25vbmUnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xuICAgIGxldCBjdXJyZW50ID0gJyc7XG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCkge1xuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlcisrO1xuXG4gICAgICAgICAgICAvL3N0YXJ0IHRoZSB0aW1lciBhZnRlciB0aGUgZmlyc3QgY2FyZCBpcyBjbGlja2VkXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUuZ2FtZVN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3J1biBmdW5jdGlvbiBoYW5kbGluZyBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8vZnVuY3Rpb24gZm9yIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XG5cbiAgICBpZiAoIShjLmNvbnRhaW5zKCdmbGlwcGVkJykgfHwgYy5jb250YWlucygnbWF0Y2gnKSkpIHtcbiAgICAgICAgYy5hZGQoJ2ZsaXBwZWQnKTtcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXG4gICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IGZhbHNlO1xuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudGVyID09PSAxKSB7XG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9IGVsZW1lbnQ7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXG5jYXJkR2FtZS5zaG93VGltZXIgPSAoKSA9PiB7XG4gICAgbGV0IHRpbWVTdHJpbmcgPSBcIlwiXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBtaW51dGVzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgc3ViU2Vjb25kc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IG1pbnV0ZXM7XG4gICAgbGV0IHNlY29uZHM7XG4gICAgbGV0IHN1YlNlY29uZHM7XG4gICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG5cbiAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA8IDgpIHtcbiAgICAgICAgLy90aW1lciBmb3JtYXQgbW06c3MueHhcbiAgICAgICAgY2FyZEdhbWUuaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyICUgMTAwO1xuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIgLyAxMDApIC8gNjApICUgNjA7XG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA8PSA5KSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9IHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWludXRlc1N0cmluZyA9IE1hdGguZmxvb3IobWludXRlcykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQoY2FyZEdhbWUudGltZVN0cmluZyk7XG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KSB7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChjYXJkR2FtZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN3YWwoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICdZb3UgZGlkIGl0IScsXG4gICAgICAgICAgICAgICAgICAgICAgICBodG1sOiBgWW91ciBmaW5hbCB0aW1lOiAke2NhcmRHYW1lLnRpbWVTdHJpbmd9ICAgICAgICAgPGEgaHJlZj1cImh0dHBzOi8vdHdpdHRlci5jb20vc2hhcmVcIiBjbGFzcz1cInR3aXR0ZXItc2hhcmUtYnV0dG9uXCIgZGF0YS1zaXplPVwibGFyZ2VcIiBkYXRhLXRleHQ9XCJJIGp1c3QgdG9vayB0aGUgTWV0YWwgU3ViZ2VucmUgUXVpeiEgWW91IHNob3VsZCB0b28hXCIgZGF0YS11cmw9XCJodHRwOi8vbWV0YWxzdWJnZW5yZS54eXpcIiBkYXRhLWhhc2h0YWdzPVwiZ2V0TWV0YWxcIiBkYXRhLXNob3ctY291bnQ9XCJmYWxzZVwiPlR3ZWV0PC9hPmAsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXG4gICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaXQgd29ya3MhXCIpO1xuICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5uZXdMZWFkKGNhcmRHYW1lLnRpbWVyLCBjYXJkR2FtZS50aW1lU3RyaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSwgMTAwMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTApO1xuICAgIH1cbn1cblxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IDE2OyBpKyspIHtcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XG4gICAgfVxuXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICQoZWwpLmVtcHR5KCk7XG5cbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcbiAgICAgICAgbGV0IHJhbmRDbGFzcyA9IHBpY2tBcnJheS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKSwgMSk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG5cbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcblxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSk7XG4gICAgLy9zdGFydCB0aGUgZ2FtZVxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufVxuXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XG4gICAgICAgICQoJyNzY29yZScpLnRleHQoY2FyZEdhbWUubWF0Y2hlcyk7XG4gICAgfSAvLyByZW1vdmUgdGhlIGNsYXNzIG9mIGZsaXBwZWRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuICAgIH0sIDEwMDApO1xufVxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
