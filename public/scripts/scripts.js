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
    cardGame.leadBoard.push({
        // name: cardGame.playerName,
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
            $('.leaderboard').append('<p>Name: FAKENAME, Time: ' + scoresArray[i].timeString);
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
            cardGame.timeString = minutesString + ':' + secondsString + '.' + subSeconds;
            $('#time').text(cardGame.timeString);
            if (cardGame.matches >= 8) {
                cardGame.gameStart = false;
                clearInterval(cardGame.interval);
                cardGame.newLead(cardGame.timer, cardGame.timeString);
                cardGame.displayLead();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJsZWFkQm9hcmQiLCJmaXJlYmFzZSIsImRhdGFiYXNlIiwicmVmIiwibmV3TGVhZCIsInN0cmluZyIsInB1c2giLCJ0aW1lIiwidGltZVN0cmluZyIsImRpc3BsYXlMZWFkIiwib24iLCJzY29yZXMiLCJ0b3BGaXZlIiwiZGF0YUFycmF5IiwidmFsIiwic2NvcmVzQXJyYXkiLCJzb3J0IiwiYSIsImIiLCJpIiwiJCIsImFwcGVuZCIsImdldENvbnRlbnQiLCJhamF4IiwidXJsIiwibWV0aG9kIiwiZGF0YVR5cGUiLCJkYXRhIiwibG9jYXRpb24iLCJhbmltYWwiLCJmb3JtYXQiLCJjYWxsYmFjayIsImJyZWVkIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwaWNrUmFuZFBob3RvcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwic2Vjb25kc1N0cmluZyIsInN1YlNlY29uZHNTdHJpbmciLCJtaW51dGVzIiwic2Vjb25kcyIsInN1YlNlY29uZHMiLCJpbnRlcnZhbCIsInNldEludGVydmFsIiwidG9TdHJpbmciLCJtaW51dGVzU3RyaW5nIiwiY2xlYXJJbnRlcnZhbCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsImNzcyIsInNldFRpbWVvdXQiLCJyZW1vdmVDbGFzcyIsImluaXQiXSwibWFwcGluZ3MiOiI7O0FBQUEsSUFBSUEsV0FBVyxFQUFmO0FBQ0FBLFNBQVNDLEdBQVQsR0FBZSxrQ0FBZjtBQUNBRCxTQUFTRSxPQUFULEdBQW1CLEVBQW5CO0FBQ0FGLFNBQVNHLFFBQVQsR0FBb0IsRUFBcEI7QUFDQUgsU0FBU0ksS0FBVCxHQUFpQixDQUFqQjtBQUNBSixTQUFTSyxPQUFULEdBQW1CLENBQW5CO0FBQ0FMLFNBQVNNLFNBQVQsR0FBcUIsS0FBckI7QUFDQU4sU0FBU08sUUFBVDtBQUNBUCxTQUFTUSxZQUFULEdBQXdCLElBQXhCO0FBQ0FSLFNBQVNTLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQVQsU0FBU1UsU0FBVCxHQUFxQkMsU0FBU0MsUUFBVCxHQUFvQkMsR0FBcEIsRUFBckI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQWIsU0FBU2MsT0FBVCxHQUFtQixVQUFDVixLQUFELEVBQVFXLE1BQVIsRUFBbUI7QUFDbENmLGFBQVNVLFNBQVQsQ0FBbUJNLElBQW5CLENBQXdCO0FBQ3BCO0FBQ0FDLGNBQU1iLEtBRmM7QUFHcEJjLG9CQUFZSDtBQUhRLEtBQXhCO0FBS0gsQ0FORDs7QUFRQWYsU0FBU21CLFdBQVQsR0FBdUIsWUFBTTtBQUN6Qm5CLGFBQVNVLFNBQVQsQ0FBbUJVLEVBQW5CLENBQXNCLE9BQXRCLEVBQStCLFVBQUNDLE1BQUQsRUFBWTtBQUN2QyxZQUFJQyxVQUFVLEVBQWQ7QUFDQSxZQUFJQyxZQUFZRixPQUFPRyxHQUFQLEVBQWhCO0FBQ0EsWUFBSUMsY0FBYyxFQUFsQjs7QUFFQSxhQUFLLElBQUl4QixHQUFULElBQWdCc0IsU0FBaEIsRUFBMkI7QUFDdkJFLHdCQUFZVCxJQUFaLENBQWlCTyxVQUFVdEIsR0FBVixDQUFqQjtBQUNIOztBQUVEd0Isb0JBQVlDLElBQVosQ0FBa0IsVUFBQ0MsQ0FBRCxFQUFJQyxDQUFKLEVBQVU7QUFDeEIsbUJBQU9ELEVBQUVWLElBQUYsR0FBU1csRUFBRVgsSUFBbEI7QUFDSCxTQUZEOztBQUlBLGFBQUssSUFBSVksSUFBRSxDQUFYLEVBQWNBLElBQUUsQ0FBaEIsRUFBbUJBLEdBQW5CLEVBQXdCO0FBQ3BCQyxjQUFFLGNBQUYsRUFBa0JDLE1BQWxCLCtCQUFxRE4sWUFBWUksQ0FBWixFQUFlWCxVQUFwRTtBQUNIO0FBQ0osS0FoQkQ7QUFpQkgsQ0FsQkQ7QUFtQkE7QUFDQWxCLFNBQVNnQyxVQUFULEdBQXNCLFlBQU07QUFDeEJGLE1BQUVHLElBQUYsQ0FBTztBQUNIQyxnREFERztBQUVIQyxnQkFBUSxLQUZMO0FBR0hDLGtCQUFVLE9BSFA7QUFJSEMsY0FBTTtBQUNGcEMsaUJBQUtELFNBQVNDLEdBRFo7QUFFRnFDLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVLEdBTFI7QUFNRkMsbUJBQU87QUFOTDtBQUpILEtBQVAsRUFZR0MsSUFaSCxDQVlRLFVBQVVDLEdBQVYsRUFBZTtBQUNuQjtBQUNBQyxnQkFBUUMsR0FBUixDQUFZRixHQUFaO0FBQ0E1QyxpQkFBUytDLGNBQVQsQ0FBd0JILEdBQXhCO0FBQ0gsS0FoQkQ7QUFpQkgsQ0FsQkQ7O0FBb0JBO0FBQ0E1QyxTQUFTK0MsY0FBVCxHQUEwQixVQUFDSCxHQUFELEVBQVM7QUFDL0IsUUFBSUksVUFBVUosSUFBSUssU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUFqQzs7QUFFQTtBQUNBSCxZQUFRSSxPQUFSLENBQWdCLFVBQUNDLEdBQUQsRUFBUztBQUNyQnJELGlCQUFTRSxPQUFULENBQWlCYyxJQUFqQixDQUFzQnFDLElBQUlDLEtBQUosQ0FBVUMsTUFBVixDQUFpQkMsS0FBakIsQ0FBdUIsQ0FBdkIsRUFBMEIsSUFBMUIsQ0FBdEI7QUFDSCxLQUZEOztBQUlBOztBQVIrQiwrQkFTdEIzQixDQVRzQjtBQVUzQixZQUFJNEIsYUFBYUMsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCNUQsU0FBU0UsT0FBVCxDQUFpQjJELE1BQTVDLENBQWpCO0FBQ0E3RCxpQkFBU0csUUFBVCxDQUFrQmlELE9BQWxCLENBQTBCLFVBQUNVLEdBQUQsRUFBUztBQUMvQixtQkFBTzlELFNBQVNFLE9BQVQsQ0FBaUJ1RCxVQUFqQixNQUFpQ0ssR0FBeEMsRUFBNkM7QUFDekNMLDZCQUFhQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0I1RCxTQUFTRSxPQUFULENBQWlCMkQsTUFBNUMsQ0FBYjtBQUNIO0FBQ0osU0FKRDtBQUtBO0FBQ0E3RCxpQkFBU0csUUFBVCxDQUFrQmEsSUFBbEIsQ0FBdUJoQixTQUFTRSxPQUFULENBQWlCdUQsVUFBakIsQ0FBdkI7QUFDQXpELGlCQUFTRyxRQUFULENBQWtCYSxJQUFsQixDQUF1QmhCLFNBQVNFLE9BQVQsQ0FBaUJ1RCxVQUFqQixDQUF2QjtBQWxCMkI7O0FBUy9CLFNBQUssSUFBSTVCLElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFBQSxjQUFuQkEsQ0FBbUI7QUFVM0I7QUFDRDtBQUNBN0IsYUFBUytELGNBQVQ7QUFDSCxDQXRCRDs7QUF3QkE7QUFDQS9ELFNBQVNnRSxNQUFULEdBQWtCLFlBQU07QUFDcEJsQyxNQUFFLFdBQUYsRUFBZVYsRUFBZixDQUFrQixPQUFsQixFQUEyQixZQUFNO0FBQzdCNkMsYUFBSztBQUNEQyxtQkFBTyxRQUROO0FBRURDLGtCQUFNLHVQQUZMO0FBR0RDLHNCQUFVO0FBSFQsU0FBTCxFQUlHekIsSUFKSCxDQUlTLFlBQU07QUFDWDtBQUNBRSxvQkFBUUMsR0FBUixDQUFZLE1BQVo7QUFDQTlDLHFCQUFTZ0MsVUFBVDtBQUNILFNBUkQ7QUFTSCxLQVZEO0FBV0gsQ0FaRDs7QUFjQWhDLFNBQVNxRSxTQUFULEdBQXFCLFlBQU07QUFDdkJyRSxhQUFTTyxRQUFULEdBQW9CLEVBQXBCO0FBQ0EsUUFBSStELFVBQVUsRUFBZDtBQUNBLFFBQUl0RSxTQUFTUSxZQUFiLEVBQTBCO0FBQzFCUixpQkFBU00sU0FBVCxHQUFxQixJQUFyQjtBQUNJd0IsVUFBRSxPQUFGLEVBQVdWLEVBQVgsQ0FBYyxPQUFkLEVBQXVCLFVBQVVtRCxDQUFWLEVBQWE7QUFDaENBLGNBQUVDLGNBQUY7QUFDQUQsY0FBRUUsZUFBRjtBQUNBekUscUJBQVNLLE9BQVQ7O0FBRUE7QUFDQSxnQkFBSUwsU0FBU00sU0FBYixFQUF3QjtBQUNwQk4seUJBQVMwRSxTQUFUO0FBQ0g7QUFDRDtBQUNBMUUscUJBQVMyRSxNQUFULENBQWdCN0MsRUFBRSxJQUFGLENBQWhCLEVBQXlCeUMsRUFBRUssYUFBRixDQUFnQkMsU0FBekMsRUFBb0Q3RSxTQUFTSyxPQUE3RDtBQUNILFNBWEQ7QUFZSDtBQUNKLENBbEJEOztBQW9CQTtBQUNBTCxTQUFTMkUsTUFBVCxHQUFrQixVQUFDRyxPQUFELEVBQVVDLENBQVYsRUFBYTFFLE9BQWIsRUFBeUI7QUFDdkM7QUFDQXdDLFlBQVFDLEdBQVIsQ0FBWWdDLE9BQVo7QUFDQWpDLFlBQVFDLEdBQVIsQ0FBWWlDLENBQVo7QUFDQSxRQUFJLEVBQUVBLEVBQUVDLFFBQUYsQ0FBVyxTQUFYLEtBQXlCRCxFQUFFQyxRQUFGLENBQVcsT0FBWCxDQUEzQixDQUFKLEVBQXFEO0FBQ2pERCxVQUFFRSxHQUFGLENBQU0sU0FBTjtBQUNBO0FBQ0EsWUFBSTVFLFdBQVcsQ0FBZixFQUFrQjtBQUNkTCxxQkFBU1EsWUFBVCxHQUF3QixLQUF4QjtBQUNBUixxQkFBU2tGLFVBQVQsQ0FBb0JKLE9BQXBCLEVBQTZCOUUsU0FBU08sUUFBdEM7QUFDQVAscUJBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDSCxTQUpELE1BSU8sSUFBSUEsWUFBWSxDQUFoQixFQUFtQjtBQUN0QjtBQUNBTCxxQkFBU08sUUFBVCxHQUFvQnVFLE9BQXBCO0FBQ0g7QUFDSjtBQUNKLENBaEJEOztBQWtCQTtBQUNBOUUsU0FBUzBFLFNBQVQsR0FBcUIsWUFBTTtBQUN2QixRQUFJeEQsYUFBYSxFQUFqQjtBQUNBLFFBQUlpRSxnQkFBZ0IsRUFBcEI7QUFDQSxRQUFJQyxtQkFBbUIsRUFBdkI7QUFDQSxRQUFJQyxnQkFBSjtBQUNBLFFBQUlDLGdCQUFKO0FBQ0EsUUFBSUMsbUJBQUo7QUFDQXZGLGFBQVNNLFNBQVQsR0FBcUIsS0FBckI7O0FBRUEsUUFBSU4sU0FBU1MsT0FBVCxHQUFtQixDQUF2QixFQUF5QjtBQUNyQjtBQUNBVCxpQkFBU3dGLFFBQVQsR0FBb0JDLFlBQVksWUFBSTtBQUNoQzVDLG9CQUFRQyxHQUFSLENBQVksbUJBQVosRUFBZ0M5QyxTQUFTd0YsUUFBekM7QUFDQXhGLHFCQUFTSSxLQUFUO0FBQ0FtRix5QkFBYXZGLFNBQVNJLEtBQVQsR0FBZSxHQUE1QjtBQUNBZ0YsK0JBQW1CRyxXQUFXRyxRQUFYLEVBQW5CO0FBQ0FKLHNCQUFVNUIsS0FBS0MsS0FBTCxDQUFXM0QsU0FBU0ksS0FBVCxHQUFlLEdBQTFCLElBQStCLEVBQXpDO0FBQ0FpRixzQkFBWXJGLFNBQVNJLEtBQVQsR0FBZSxHQUFoQixHQUFxQixFQUF0QixHQUEwQixFQUFwQztBQUNBLGdCQUFJa0YsV0FBUyxDQUFiLEVBQWdCO0FBQ1pILGdDQUFlLE1BQU1HLFFBQVFJLFFBQVIsRUFBckI7QUFDSCxhQUZELE1BRU87QUFDSFAsZ0NBQWdCRyxRQUFRSSxRQUFSLEVBQWhCO0FBQ0g7O0FBRURDLDRCQUFnQmpDLEtBQUtDLEtBQUwsQ0FBVzBCLE9BQVgsRUFBb0JLLFFBQXBCLEVBQWhCO0FBQ0ExRixxQkFBU2tCLFVBQVQsR0FBeUJ5RSxhQUF6QixTQUEwQ1IsYUFBMUMsU0FBMkRJLFVBQTNEO0FBQ0F6RCxjQUFFLE9BQUYsRUFBV3FDLElBQVgsQ0FBZ0JuRSxTQUFTa0IsVUFBekI7QUFDQSxnQkFBSWxCLFNBQVNTLE9BQVQsSUFBb0IsQ0FBeEIsRUFBMEI7QUFDdEJULHlCQUFTTSxTQUFULEdBQXFCLEtBQXJCO0FBQ0FzRiw4QkFBYzVGLFNBQVN3RixRQUF2QjtBQUNBeEYseUJBQVNjLE9BQVQsQ0FBaUJkLFNBQVNJLEtBQTFCLEVBQWlDSixTQUFTa0IsVUFBMUM7QUFDQWxCLHlCQUFTbUIsV0FBVDtBQUNIO0FBQ0osU0F0Qm1CLEVBc0JqQixFQXRCaUIsQ0FBcEI7QUF1Qkg7QUFDSixDQW5DRDs7QUFxQ0FuQixTQUFTK0QsY0FBVCxHQUEwQixZQUFNO0FBQzVCO0FBQ0EsUUFBSThCLFlBQVksRUFBaEI7QUFDQSxTQUFLLElBQUloRSxJQUFFLENBQVgsRUFBY0EsS0FBRyxFQUFqQixFQUFxQkEsR0FBckIsRUFBeUI7QUFDckJnRSxrQkFBVTdFLElBQVYsQ0FBZWEsQ0FBZjtBQUNIOztBQUVEO0FBQ0FDLE1BQUUsY0FBRixFQUFrQmdFLElBQWxCLENBQXVCLFVBQUNqRSxDQUFELEVBQUlrRSxFQUFKLEVBQVc7QUFDOUJqRSxVQUFFaUUsRUFBRixFQUFNQyxLQUFOOztBQUVBO0FBQ0EsWUFBSUMsWUFBWUosVUFBVUssTUFBVixDQUFpQnhDLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS0UsTUFBTCxLQUFnQjVELFNBQVNHLFFBQVQsQ0FBa0IwRCxNQUE3QyxDQUFqQixFQUFzRSxDQUF0RSxDQUFoQjtBQUNBLFlBQUlzQyxZQUFZbkcsU0FBU0csUUFBekI7QUFDQSxZQUFJaUcsV0FBV0gsVUFBVVAsUUFBVixFQUFmOztBQUVBO0FBQ0EsWUFBSVcsd0JBQXNCSixTQUExQjs7QUFFQTtBQUNBLFlBQUlLLFVBQVU1QyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0J1QyxVQUFVdEMsTUFBckMsQ0FBZDtBQUNBLFlBQUkwQyxZQUFZSixVQUFVRCxNQUFWLENBQWlCSSxPQUFqQixFQUEwQixDQUExQixDQUFoQjtBQUNBeEUsVUFBRWlFLEVBQUYsRUFBTVMsSUFBTixDQUFXLE9BQVgsNkJBQTZDRCxVQUFVLENBQVYsQ0FBN0M7QUFDQXpFLFVBQUVpRSxFQUFGLEVBQU1VLFFBQU4sQ0FBZUosU0FBZjtBQUNILEtBaEJEO0FBaUJBO0FBQ0FyRyxhQUFTcUUsU0FBVDtBQUNILENBM0JEOztBQTZCQTtBQUNBckUsU0FBU2tGLFVBQVQsR0FBc0IsVUFBQ1osT0FBRCxFQUFVb0MsSUFBVixFQUFtQjtBQUNyQztBQUNBLFFBQUlDLHNCQUFzQixFQUExQjtBQUNBOUQsWUFBUUMsR0FBUixDQUFZd0IsT0FBWjtBQUNBcUMsMEJBQXNCckMsUUFBUXNDLFFBQVIsQ0FBaUIsY0FBakIsRUFBaUNKLElBQWpDLENBQXNDLE9BQXRDLENBQXRCO0FBQ0FHLDBCQUFzQixNQUFNQSxvQkFBb0JFLE9BQXBCLENBQTRCLGNBQTVCLEVBQTRDLEVBQTVDLENBQTVCO0FBQ0EsUUFBSUMsdUJBQXVCLEVBQTNCO0FBQ0FBLDJCQUF1QkosS0FBS0UsUUFBTCxDQUFjLGNBQWQsRUFBOEJKLElBQTlCLENBQW1DLE9BQW5DLENBQXZCO0FBQ0FNLDJCQUF1QixNQUFNQSxxQkFBcUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCOztBQUVBO0FBQ0EsUUFBSS9FLEVBQUU2RSxtQkFBRixFQUF1QkksR0FBdkIsQ0FBMkIsa0JBQTNCLE1BQW1EakYsRUFBRWdGLG9CQUFGLEVBQXdCQyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBdkQsRUFBd0c7QUFDcEd6QyxnQkFBUW1DLFFBQVIsQ0FBaUIsT0FBakI7QUFDQUMsYUFBS0QsUUFBTCxDQUFjLE9BQWQ7QUFDQXpHLGlCQUFTUyxPQUFUO0FBQ0gsS0Fmb0MsQ0FlbkM7QUFDRnVHLGVBQVksWUFBTTtBQUNkO0FBQ0E7QUFDQTFDLGdCQUFRMkMsV0FBUixDQUFvQixTQUFwQjtBQUNBUCxhQUFLTyxXQUFMLENBQWlCLFNBQWpCO0FBQ0FqSCxpQkFBU1EsWUFBVCxHQUF3QixJQUF4QjtBQUNILEtBTkQsRUFNRSxJQU5GO0FBT0gsQ0F2QkQ7QUF3QkE7O0FBRUFSLFNBQVNrSCxJQUFULEdBQWdCLFlBQU07QUFDbEJsSCxhQUFTZ0UsTUFBVDtBQUNILENBRkQ7O0FBSUFsQyxFQUFFLFlBQU07QUFDSjlCLGFBQVNrSCxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XHJcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XHJcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcclxuY2FyZEdhbWUucmFuZFBpY3MgPSBbXTtcclxuY2FyZEdhbWUudGltZXIgPSAwO1xyXG5jYXJkR2FtZS5jb3VudGVyID0gMFxyXG5jYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcclxuY2FyZEdhbWUucHJldmlvdXM7XHJcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbmNhcmRHYW1lLm1hdGNoZXMgPSAwO1xyXG5jYXJkR2FtZS5sZWFkQm9hcmQgPSBmaXJlYmFzZS5kYXRhYmFzZSgpLnJlZigpO1xyXG5cclxuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2VcclxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcclxuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxyXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxyXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXHJcbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cclxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXHJcbi8vbGVhZGVyYm9hcmQgRmlyZWJhc2VcclxuY2FyZEdhbWUubmV3TGVhZCA9ICh0aW1lciwgc3RyaW5nKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5sZWFkQm9hcmQucHVzaCh7XHJcbiAgICAgICAgLy8gbmFtZTogY2FyZEdhbWUucGxheWVyTmFtZSxcclxuICAgICAgICB0aW1lOiB0aW1lcixcclxuICAgICAgICB0aW1lU3RyaW5nOiBzdHJpbmdcclxuICAgIH0pXHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlMZWFkID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUubGVhZEJvYXJkLm9uKFwidmFsdWVcIiwgKHNjb3JlcykgPT4ge1xyXG4gICAgICAgIGxldCB0b3BGaXZlID0gW107XHJcbiAgICAgICAgbGV0IGRhdGFBcnJheSA9IHNjb3Jlcy52YWwoKTtcclxuICAgICAgICBsZXQgc2NvcmVzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGFBcnJheSkge1xyXG4gICAgICAgICAgICBzY29yZXNBcnJheS5wdXNoKGRhdGFBcnJheVtrZXldKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHNjb3Jlc0FycmF5LnNvcnQoIChhLCBiKSA9PiB7XHJcbiAgICAgICAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWU7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaT0wOyBpPDU7IGkrKykge1xyXG4gICAgICAgICAgICAkKCcubGVhZGVyYm9hcmQnKS5hcHBlbmQoYDxwPk5hbWU6IEZBS0VOQU1FLCBUaW1lOiAke3Njb3Jlc0FycmF5W2ldLnRpbWVTdHJpbmd9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufVxyXG4vL0FKQVggY2FsbCB0byBQZXRmaW5kZXIgQVBJXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIixcclxuICAgICAgICAgICAgYnJlZWQ6IFwiUHVnXCJcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgIGNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zKHJlcyk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcclxuY2FyZEdhbWUucGlja1JhbmRQaG90b3MgPSAocmVzKSA9PiB7XHJcbiAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XHJcblxyXG4gICAgLy9zYXZlIGFsbCBwZXQgcGhvdG9zXHJcbiAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xyXG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xyXG4gICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xyXG4gICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XHJcbiAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgLy9kb3VibGUgdXAgZm9yIG1hdGNoaW5nICg4IHBob3RvcyA9IDE2IGNhcmRzKVxyXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgIH1cclxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcclxuICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XHJcbn1cclxuXHJcbi8vZXZlbnQgaGFuZGxlciBmdW5jdGlvblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7ICAgIFxyXG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogJ1N3ZWV0IScsXHJcbiAgICAgICAgICAgIHRleHQ6ICdMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MgYXJjaGl0ZWN0byBxdWFlcmF0IG9tbmlzIG1pbnVzIGV4Y2VwdHVyaSB1dCBwcmFlc2VudGl1bSwgc29sdXRhIGxhdWRhbnRpdW0gcGVyc3BpY2lhdGlzIGludmVudG9yZT8gRWEgYXNzdW1lbmRhIHRlbXBvcmUgbmF0dXMgZHVjaW11cyBpcHN1bSBsYXVkYW50aXVtIG9mZmljaWlzLCBlbmltIHZvbHVwdGFzLicsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcclxuICAgICAgICB9KS50aGVuKCAoKSA9PiB7XHJcbiAgICAgICAgICAgIC8vbWFrZSBBSkFYIGNhbGwgYWZ0ZXIgdXNlciBjbGlja3MgT0sgb24gdGhlIGFsZXJ0XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGVzdFwiKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XHJcbiAgICBsZXQgY3VycmVudCA9ICcnO1xyXG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCl7XHJcbiAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlOyAgXHJcbiAgICAgICAgJCgnLmNhcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIC8vc3RhcnQgdGhlIHRpbWVyIGFmdGVyIHRoZSBmaXJzdCBjYXJkIGlzIGNsaWNrZWRcclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgLy9ydW4gZnVuY3Rpb24gaGFuZGxpbmcgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpOyAgICAgICAgICBcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy9mdW5jdGlvbiBmb3IgZ2FtZSBlZmZlY3RzIGFuZCBtZWNoYW5pY3NcclxuY2FyZEdhbWUuZ2FtZUZYID0gKGVsZW1lbnQsIGMsIGNvdW50ZXIpID0+IHtcclxuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xyXG4gICAgY29uc29sZS5sb2coZWxlbWVudCk7XHJcbiAgICBjb25zb2xlLmxvZyhjKTtcclxuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xyXG4gICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgLy9jaGVjayBmb3IgbWF0Y2ggYWZ0ZXIgMiBjYXJkcyBmbGlwcGVkXHJcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSBmYWxzZTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2hlY2tNYXRjaChlbGVtZW50LCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAvL29uIHRoZSBmaXJzdCBjbGljaywgc2F2ZSB0aGlzIGNhcmQgZm9yIGxhdGVyXHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcclxuICAgICAgICB9XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXHJcbmNhcmRHYW1lLnNob3dUaW1lciA9ICgpID0+IHtcclxuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxyXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IG1pbnV0ZXM7XHJcbiAgICBsZXQgc2Vjb25kcztcclxuICAgIGxldCBzdWJTZWNvbmRzO1xyXG4gICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KXtcclxuICAgICAgICAvL3RpbWVyIGZvcm1hdCBtbTpzcy54eFxyXG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYXJkR2FtZS5pbnRlcnZhbFwiLGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKzsgICBcclxuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyJTEwMDtcclxuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoY2FyZEdhbWUudGltZXIvMTAwKSU2MDtcclxuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIvMTAwKS82MCklNjA7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRzPD05KSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0nMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gICAgIFxyXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQoY2FyZEdhbWUudGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzID49IDgpe1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGNhcmRHYW1lLm5ld0xlYWQoY2FyZEdhbWUudGltZXIsIGNhcmRHYW1lLnRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZGlzcGxheUxlYWQoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIDEwKTtcclxuICAgIH1cclxufVxyXG5cclxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAvL21ha2UgYW4gYXJyYXkgb2YgbnVtYmVycyBmcm9tIDEtMTYgZm9yIGNhcmQgaWRlbnRpZmljYXRpb25cclxuICAgIGxldCBwaWNrQXJyYXkgPSBbXTtcclxuICAgIGZvciAobGV0IGk9MTsgaTw9MTY7IGkrKyl7XHJcbiAgICAgICAgcGlja0FycmF5LnB1c2goaSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy9hc3NpZ24gYSBjYXJkIHBpYyB0byBlYWNoIGRpdlxyXG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgICAkKGVsKS5lbXB0eSgpO1xyXG5cclxuICAgICAgICAvL2Fzc2lnbiBhIHJhbmRvbSBjYXJkIG51bWJlciB0byB0aGUgY3VycmVudCBkaXYuY2FyZFxyXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksMSk7XHJcbiAgICAgICAgbGV0IHBpY3NUb1VzZSA9IGNhcmRHYW1lLnJhbmRQaWNzO1xyXG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvL2Fzc2lnbiB0aGUgZXF1aXZhbGVudCAuZG9nUGljcyMgY2xhc3MgdG8gdGhlIGRpdlxyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XHJcblxyXG4gICAgICAgIC8vYmFja2dyb3VuZCBpbWFnZSBvZiB0aGUgZGl2IGlzIGEgcmFuZG9tIGRvZ1xyXG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XHJcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XHJcbiAgICAgICAgJChlbCkuYXR0cignc3R5bGUnLCBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cGljU3RyaW5nWzBdfSlgKTtcclxuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgfSk7XHJcbiAgICAvL3N0YXJ0IHRoZSBnYW1lXHJcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcclxufVxyXG5cclxuLy9jaGVjayBmb3IgbWF0Y2hlcyBiZXR3ZWVuIHRoZSB0d28gY2xpY2tlZCBjYXJkc1xyXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcclxuICAgIC8vaXNvbGF0ZSB0aGUgZG9nUGljcyMgY2xhc3MgZnJvbSAuY2FyZF9fZnJvbnQgb2YgYm90aCBjYXJkc1xyXG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xyXG4gICAgY29uc29sZS5sb2coY3VycmVudCk7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbignLmNhcmRfX2Zyb250JykuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xyXG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcuJyArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuIFxyXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxyXG4gICAgaWYgKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XHJcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLm1hdGNoZXMrKztcclxuICAgIH0gLy8gcmVtb3ZlIHRoZSBjbGFzcyBvZiBmbGlwcGVkXHJcbiAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IFxyXG4gICAgICAgIC8vaWYgY2FyZHMgZG9uJ3QgaGF2ZSBhIGZsaXBwZWQgY2xhc3MsIHRoZXkgZmxpcCBiYWNrXHJcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXHJcbiAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG4gICAgfSwxMDAwKTtcclxufVxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxufTtcclxuXHJcbiQoKCkgPT4geyAgICBcclxuICAgIGNhcmRHYW1lLmluaXQoKTtcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcclxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxyXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZFxyXG4iXX0=
