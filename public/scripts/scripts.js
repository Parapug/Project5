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
            $('.leaderBoard').append('<p>Name ' + scoresArray[i].name + ', Time: ' + scoresArray[i].timeString);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInB1c2giLCJuYW1lIiwiJCIsInZhbCIsInRpbWUiLCJ0aW1lU3RyaW5nIiwiZGlzcGxheUxlYWQiLCJvbiIsInNjb3JlcyIsInRvcEZpdmUiLCJkYXRhQXJyYXkiLCJzY29yZXNBcnJheSIsInNvcnQiLCJhIiwiYiIsImkiLCJhcHBlbmQiLCJnZXRDb250ZW50IiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJicmVlZCIsInRoZW4iLCJyZXMiLCJjb25zb2xlIiwibG9nIiwicGlja1JhbmRQaG90b3MiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwiY3NzIiwibWF0Y2hHYW1lIiwiY3VycmVudCIsInN0b3BQcm9wYWdhdGlvbiIsInNob3dUaW1lciIsImdhbWVGWCIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJlbGVtZW50IiwiYyIsImNvbnRhaW5zIiwiYWRkIiwiY2hlY2tNYXRjaCIsInNlY29uZHNTdHJpbmciLCJtaW51dGVzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsImludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJ0b1N0cmluZyIsImNsZWFySW50ZXJ2YWwiLCJzZXRUaW1lb3V0IiwiaHRtbCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjtBQUNBVCxTQUFTVSxTQUFULEdBQW9CQyxTQUFTQyxRQUFULEdBQW9CQyxHQUFwQixFQUFwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbENmLGFBQVNVLFNBQVQsQ0FBbUJNLElBQW5CLENBQXdCO0FBQ3BCQyxjQUFNQyxFQUFFLGFBQUYsRUFBaUJDLEdBQWpCLEVBRGM7QUFFcEJDLGNBQU1oQixLQUZjO0FBR3BCaUIsb0JBQVlOO0FBSFEsS0FBeEI7QUFLSCxDQU5EOztBQVFBZixTQUFTc0Is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cUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9GLEVBQUU2RixtQkFBRixFQUF1QnZDLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHRELEVBQUVnRyxvQkFBRixFQUF3QjFDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwR0UsZ0JBQVFtQyxRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0E3RyxpQkFBU1MsT0FBVDtBQUNBUyxVQUFFLFFBQUYsRUFBWW9ELElBQVosQ0FBaUJ0RSxTQUFTUyxPQUExQjtBQUNILEtBZm9DLENBZW5DO0FBQ0ZzRixlQUFXLFlBQU07QUFDYjtBQUNBO0FBQ0FyQixnQkFBUXlDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQUwsYUFBS0ssV0FBTCxDQUFpQixTQUFqQjtBQUNBbkgsaUJBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDSCxLQU5ELEVBTUcsSUFOSDtBQU9ILENBdkJEO0FBd0JBOztBQUVBUixTQUFTb0gsSUFBVCxHQUFnQixZQUFNO0FBQ2xCcEgsYUFBU2lFLE1BQVQ7QUFDSCxDQUZEOztBQUlBL0MsRUFBRSxZQUFNO0FBQ0psQixhQUFTb0gsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XG5jYXJkR2FtZS50aW1lciA9IDA7XG5jYXJkR2FtZS5jb3VudGVyID0gMFxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG5jYXJkR2FtZS5wcmV2aW91cztcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XG5jYXJkR2FtZS5tYXRjaGVzID0gMDtcbmNhcmRHYW1lLmxlYWRCb2FyZD0gZmlyZWJhc2UuZGF0YWJhc2UoKS5yZWYoKTtcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vICAgICAgMS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vICAgICAgMi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vICAgICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gICAgICA0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cbi8vICAgICAgNS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cblxuY2FyZEdhbWUubmV3TGVhZCA9ICh0aW1lciwgc3RyaW5nKSA9PiB7XG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLnB1c2goe1xuICAgICAgICBuYW1lOiAkKCcjcGxheWVyTmFtZScpLnZhbCgpLFxuICAgICAgICB0aW1lOiB0aW1lcixcbiAgICAgICAgdGltZVN0cmluZzogc3RyaW5nXG4gICAgfSlcbn1cblxuY2FyZEdhbWUuZGlzcGxheUxlYWQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xuICAgICAgICBsZXQgdG9wRml2ZSA9IFtdO1xuICAgICAgICBsZXQgZGF0YUFycmF5ID0gc2NvcmVzLnZhbCgpO1xuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBrZXkgaW4gZGF0YUFycmF5KSB7XG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWU7XG4gICAgICAgIH0pXG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA1OyBpKyspIHtcbiAgICAgICAgICAgICQoJy5sZWFkZXJCb2FyZCcpLmFwcGVuZChgPHA+TmFtZSAke3Njb3Jlc0FycmF5W2ldLm5hbWV9LCBUaW1lOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9YCk7XG4gICAgICAgIH1cbiAgICB9KVxufVxuXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiLFxuICAgICAgICAgICAgYnJlZWQ6IFwiUHVnXCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcbiAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcbiAgICB9KTtcbn1cblxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcblxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcbiAgICB9KTtcblxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgfVxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xufVxuXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIHN3YWwoe1xuICAgICAgICAgICAgdGl0bGU6ICdXZWxjb21lIScsXG4gICAgICAgICAgICB0ZXh0OiAnRmluZCBhbGwgdGhlIG1hdGNoZXMgYXMgcXVpY2sgYXMgeW91IGNhbiwgYW5kIHNlZSBpZiB5b3UgbWFrZSB5b3VyIHdheSB0byB0aGUgdG9wIG9mIG91ciBsZWFkZXJib2FyZCEgV3Jvb2YhJyxcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xuICAgICAgICAgICAgJCgnI2dhbWUnKS5jc3MoJ2Rpc3BsYXknLCAnYmxvY2snKTtcbiAgICAgICAgICAgICQoJyNsYW5kaW5nUGFnZScpLmNzcygnZGlzcGxheScsICdub25lJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcbiAgICBsZXQgY3VycmVudCA9ICcnO1xuICAgIGlmIChjYXJkR2FtZS5jbGlja0FsbG93ZWQpIHtcbiAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgJCgnLmNhcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcblxuICAgICAgICAgICAgLy9zdGFydCB0aGUgdGltZXIgYWZ0ZXIgdGhlIGZpcnN0IGNhcmQgaXMgY2xpY2tlZFxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLnNob3dUaW1lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGWCgkKHRoaXMpLCBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0LCBjYXJkR2FtZS5jb3VudGVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcbiAgICAvL2ZsaXAgY2FyZCBpZiBjYXJkIGlzIGZhY2UgZG93biwgb3RoZXJ3aXNlIGRvIG5vdGhpbmdcbiAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xuXG4gICAgaWYgKCEoYy5jb250YWlucygnZmxpcHBlZCcpIHx8IGMuY29udGFpbnMoJ21hdGNoJykpKSB7XG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxuICAgICAgICBpZiAoY291bnRlciA+PSAyKSB7XG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlciA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxuICAgICAgICAgICAgY2FyZEdhbWUucHJldmlvdXMgPSBlbGVtZW50O1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cblxuLy9jYWxjdWxhdGUgYW5kIGRpc3BsYXkgdGltZXIgb24gcGFnZVxuY2FyZEdhbWUuc2hvd1RpbWVyID0gKCkgPT4ge1xuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxuICAgIGxldCBzZWNvbmRzU3RyaW5nID0gXCJcIjtcbiAgICBsZXQgbWludXRlc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBtaW51dGVzO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCBzdWJTZWNvbmRzO1xuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KSB7XG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKztcbiAgICAgICAgICAgIHN1YlNlY29uZHMgPSBjYXJkR2FtZS50aW1lciAlIDEwMDtcbiAgICAgICAgICAgIHN1YlNlY29uZHNTdHJpbmcgPSBzdWJTZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBzZWNvbmRzID0gTWF0aC5mbG9vcihjYXJkR2FtZS50aW1lciAvIDEwMCkgJSA2MDtcbiAgICAgICAgICAgIG1pbnV0ZXMgPSAoKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAvIDYwKSAlIDYwO1xuICAgICAgICAgICAgaWYgKHNlY29uZHMgPD0gOSkge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSAnMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lU3RyaW5nID0gYCR7bWludXRlc1N0cmluZ306JHtzZWNvbmRzU3RyaW5nfS4ke3N1YlNlY29uZHN9YFxuICAgICAgICAgICAgJCgnI3RpbWUnKS50ZXh0KGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPj0gOCkge1xuICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoY2FyZEdhbWUuaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAnWW91IGRpZCBpdCEnLFxuICAgICAgICAgICAgICAgICAgICAgICAgaHRtbDogYFlvdXIgZmluYWwgdGltZTogJHtjYXJkR2FtZS50aW1lU3RyaW5nfSAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL3R3aXR0ZXIuY29tL3NoYXJlXCIgY2xhc3M9XCJ0d2l0dGVyLXNoYXJlLWJ1dHRvblwiIGRhdGEtc2l6ZT1cImxhcmdlXCIgZGF0YS10ZXh0PVwiSSBqdXN0IHRvb2sgdGhlIE1ldGFsIFN1YmdlbnJlIFF1aXohIFlvdSBzaG91bGQgdG9vIVwiIGRhdGEtdXJsPVwiaHR0cDovL21ldGFsc3ViZ2VucmUueHl6XCIgZGF0YS1oYXNodGFncz1cImdldE1ldGFsXCIgZGF0YS1zaG93LWNvdW50PVwiZmFsc2VcIj5Ud2VldDwvYT5gLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW1hZ2VVcmw6ICdodHRwczovL2kucGluaW1nLmNvbS83MzZ4L2YyLzQxLzQ2L2YyNDE0NjA5NmQyZjg3ZTMxNzQ1YTE4MmZmMzk1YjEwLS1wdWctY2FydG9vbi1hcnQtaWRlYXMuanBnJ1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcIml0IHdvcmtzIVwiKTtcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUubmV3TGVhZChjYXJkR2FtZS50aW1lciwgY2FyZEdhbWUudGltZVN0cmluZyk7XG4gICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLmRpc3BsYXlMZWFkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIDEwKTtcbiAgICB9XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgIC8vbWFrZSBhbiBhcnJheSBvZiBudW1iZXJzIGZyb20gMS0xNiBmb3IgY2FyZCBpZGVudGlmaWNhdGlvblxuICAgIGxldCBwaWNrQXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMTsgaSA8PSAxNjsgaSsrKSB7XG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xuICAgIH1cblxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuXG4gICAgICAgIC8vYXNzaWduIGEgcmFuZG9tIGNhcmQgbnVtYmVyIHRvIHRoZSBjdXJyZW50IGRpdi5jYXJkXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksIDEpO1xuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xuXG4gICAgICAgIC8vYXNzaWduIHRoZSBlcXVpdmFsZW50IC5kb2dQaWNzIyBjbGFzcyB0byB0aGUgZGl2XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XG5cbiAgICAgICAgLy9iYWNrZ3JvdW5kIGltYWdlIG9mIHRoZSBkaXYgaXMgYSByYW5kb20gZG9nXG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH0pO1xuICAgIC8vc3RhcnQgdGhlIGdhbWVcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcbn1cblxuLy9jaGVjayBmb3IgbWF0Y2hlcyBiZXR3ZWVuIHRoZSB0d28gY2xpY2tlZCBjYXJkc1xuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XG4gICAgLy9pc29sYXRlIHRoZSBkb2dQaWNzIyBjbGFzcyBmcm9tIC5jYXJkX19mcm9udCBvZiBib3RoIGNhcmRzXG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcnO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gcHJldi5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcblxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgY2FyZEdhbWUubWF0Y2hlcysrO1xuICAgICAgICAkKCcjc2NvcmUnKS50ZXh0KGNhcmRHYW1lLm1hdGNoZXMpO1xuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIC8vaWYgY2FyZHMgZG9uJ3QgaGF2ZSBhIGZsaXBwZWQgY2xhc3MsIHRoZXkgZmxpcCBiYWNrXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcbiAgICB9LCAxMDAwKTtcbn1cbi8vICAgIDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLlxuXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xufTtcblxuJCgoKSA9PiB7XG4gICAgY2FyZEdhbWUuaW5pdCgpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kXG4iXX0=
