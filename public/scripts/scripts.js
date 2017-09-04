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
            timeString = minutesString + ':' + secondsString + '.' + subSeconds;
            $('#time').text(timeString);
            if (cardGame.matches >= 8) {
                cardGame.gameStart = false;
                clearInterval(cardGame.interval);
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
    cardGame.checkMatch();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsInBpY2tSYW5kUGhvdG9zIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwidGltZVN0cmluZyIsInNlY29uZHNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNvbnNvbGUiLCJsb2ciLCJ0b1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJzdG9wIiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJzcGxpY2UiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJhdHRyIiwiYWRkQ2xhc3MiLCJwcmV2IiwiY3VycmVudERvZ1BpY3NDbGFzcyIsImNoaWxkcmVuIiwicmVwbGFjZSIsInByZXZpb3VzRG9nUGljc0NsYXNzIiwiY3NzIiwic2V0VGltZW91dCIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsU0FBU1UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRmYsaUJBQUtELFNBQVNDLEdBRFo7QUFFRmdCLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVO0FBTFI7QUFKSCxLQUFQLEVBV0dDLElBWEgsQ0FXUSxVQUFVQyxHQUFWLEVBQWU7QUFDbkI7QUFDQXRCLGlCQUFTdUIsY0FBVCxDQUF3QkQsR0FBeEI7QUFDSCxLQWREO0FBZUgsQ0FoQkQ7O0FBa0JBO0FBQ0F0QixTQUFTdUIsY0FBVCxHQUEwQixVQUFDRCxHQUFELEVBQVM7QUFDL0IsUUFBSUUsVUFBVUYsSUFBSUcsU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUFqQzs7QUFFQTtBQUNBSCxZQUFRSSxPQUFSLENBQWdC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Y2FyZEdhbWUgPSB7fTtcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XG5jYXJkR2FtZS5kb2dQaWNzID0gW107XG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xuY2FyZEdhbWUudGltZXIgPSAwO1xuY2FyZEdhbWUuY291bnRlciA9IDBcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuY2FyZEdhbWUucHJldmlvdXM7XG5jYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuY2FyZEdhbWUubWF0Y2hlcyA9IDA7XG5cbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG5cbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAvL3BpY2sgcmFuZG9tIHBob3RvcyBmcm9tIHRoZSBBUElcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcbiAgICB9KTtcbn1cblxuLy9mdW5jdGlvbiB0byBncmFiIDggcmFuZG9tIHBob3RvcyBmcm9tIEFQSSBmb3IgdGhlIGNhcmQgZmFjZXNcbmNhcmRHYW1lLnBpY2tSYW5kUGhvdG9zID0gKHJlcykgPT4ge1xuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcblxuICAgIC8vc2F2ZSBhbGwgcGV0IHBob3Rvc1xuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XG4gICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdWyckdCddKTtcbiAgICB9KTtcblxuICAgIC8vcGljayA4IHJhbmRvbSBvbmVzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xuICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgfVxuICAgIC8vYXBwZW5kIHRoZSBkb2cgcGljcyB0byB0aGUgY2FyZHMgb24gdGhlIHBhZ2VcbiAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xufVxuXG4vL2V2ZW50IGhhbmRsZXIgZnVuY3Rpb25cbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHN3YWwoe1xuICAgICAgICAgICAgdGl0bGU6ICdTd2VldCEnLFxuICAgICAgICAgICAgdGV4dDogJ0xvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcyBhcmNoaXRlY3RvIHF1YWVyYXQgb21uaXMgbWludXMgZXhjZXB0dXJpIHV0IHByYWVzZW50aXVtLCBzb2x1dGEgbGF1ZGFudGl1bSBwZXJzcGljaWF0aXMgaW52ZW50b3JlPyBFYSBhc3N1bWVuZGEgdGVtcG9yZSBuYXR1cyBkdWNpbXVzIGlwc3VtIGxhdWRhbnRpdW0gb2ZmaWNpaXMsIGVuaW0gdm9sdXB0YXMuJyxcbiAgICAgICAgICAgIGltYWdlVXJsOiAnaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZydcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgLy9tYWtlIEFKQVggY2FsbCBhZnRlciB1c2VyIGNsaWNrcyBPSyBvbiB0aGUgYWxlcnRcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICcnO1xuICAgIGxldCBjdXJyZW50ID0gJyc7XG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCkge1xuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlcisrO1xuXG4gICAgICAgICAgICAvL3N0YXJ0IHRoZSB0aW1lciBhZnRlciB0aGUgZmlyc3QgY2FyZCBpcyBjbGlja2VkXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUuZ2FtZVN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc2hvd1RpbWVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvL3J1biBmdW5jdGlvbiBoYW5kbGluZyBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZYKCQodGhpcyksIGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3QsIGNhcmRHYW1lLmNvdW50ZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8vZnVuY3Rpb24gZm9yIGdhbWUgZWZmZWN0cyBhbmQgbWVjaGFuaWNzXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xuICAgIC8vZmxpcCBjYXJkIGlmIGNhcmQgaXMgZmFjZSBkb3duLCBvdGhlcndpc2UgZG8gbm90aGluZ1xuICAgIGlmICghKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSB8fCBjLmNvbnRhaW5zKCdtYXRjaCcpKSkge1xuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICAvL2NoZWNrIGZvciBtYXRjaCBhZnRlciAyIGNhcmRzIGZsaXBwZWRcbiAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XG4gICAgICAgICAgICBjYXJkR2FtZS5jaGVja01hdGNoKGVsZW1lbnQsIGNhcmRHYW1lLnByZXZpb3VzKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLmNvdW50ZXIgPSAwO1xuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcbiAgICAgICAgICAgIC8vb24gdGhlIGZpcnN0IGNsaWNrLCBzYXZlIHRoaXMgY2FyZCBmb3IgbGF0ZXJcbiAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gZWxlbWVudDtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5cbi8vY2FsY3VsYXRlIGFuZCBkaXNwbGF5IHRpbWVyIG9uIHBhZ2VcbmNhcmRHYW1lLnNob3dUaW1lciA9ICgpID0+IHtcbiAgICBsZXQgdGltZVN0cmluZyA9IFwiXCJcbiAgICBsZXQgc2Vjb25kc1N0cmluZyA9IFwiXCI7XG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xuICAgIGxldCBtaW51dGVzO1xuICAgIGxldCBzZWNvbmRzO1xuICAgIGxldCBzdWJTZWNvbmRzO1xuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KSB7XG4gICAgICAgIC8vdGltZXIgZm9ybWF0IG1tOnNzLnh4XG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYXJkR2FtZS5pbnRlcnZhbFwiLCBjYXJkR2FtZS5pbnRlcnZhbCk7XG4gICAgICAgICAgICBjYXJkR2FtZS50aW1lcisrO1xuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyICUgMTAwO1xuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyIC8gMTAwKSAlIDYwO1xuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIgLyAxMDApIC8gNjApICUgNjA7XG4gICAgICAgICAgICBpZiAoc2Vjb25kcyA8PSA5KSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9ICcwJyArIHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9IHNlY29uZHMudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbWludXRlc1N0cmluZyA9IE1hdGguZmxvb3IobWludXRlcykudG9TdHJpbmcoKTtcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQodGltZVN0cmluZyk7XG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUubWF0Y2hlcyA+PSA4KSB7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCAxMCk7XG4gICAgfVxufVxuXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcbiAgICAvL21ha2UgYW4gYXJyYXkgb2YgbnVtYmVycyBmcm9tIDEtMTYgZm9yIGNhcmQgaWRlbnRpZmljYXRpb25cbiAgICBsZXQgcGlja0FycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gMTY7IGkrKykge1xuICAgICAgICBwaWNrQXJyYXkucHVzaChpKTtcbiAgICB9XG5cbiAgICAvL2Fzc2lnbiBhIGNhcmQgcGljIHRvIGVhY2ggZGl2XG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcblxuICAgICAgICAvL2Fzc2lnbiBhIHJhbmRvbSBjYXJkIG51bWJlciB0byB0aGUgY3VycmVudCBkaXYuY2FyZFxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLCAxKTtcbiAgICAgICAgbGV0IHBpY3NUb1VzZSA9IGNhcmRHYW1lLnJhbmRQaWNzO1xuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcblxuICAgICAgICAvL2Fzc2lnbiB0aGUgZXF1aXZhbGVudCAuZG9nUGljcyMgY2xhc3MgdG8gdGhlIGRpdlxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xuXG4gICAgICAgIC8vYmFja2dyb3VuZCBpbWFnZSBvZiB0aGUgZGl2IGlzIGEgcmFuZG9tIGRvZ1xuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcbiAgICAgICAgJChlbCkuYXR0cignc3R5bGUnLCBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cGljU3RyaW5nWzBdfSlgKTtcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB9KTtcbiAgICAvL3N0YXJ0IHRoZSBnYW1lXG4gICAgY2FyZEdhbWUuY2hlY2tNYXRjaCgpO1xufVxuXG4vL2NoZWNrIGZvciBtYXRjaGVzIGJldHdlZW4gdGhlIHR3byBjbGlja2VkIGNhcmRzXG5jYXJkR2FtZS5jaGVja01hdGNoID0gKGN1cnJlbnQsIHByZXYpID0+IHtcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcbiAgICBsZXQgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgY29uc29sZS5sb2coY3VycmVudCk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XG4gICAgbGV0IHByZXZpb3VzRG9nUGljc0NsYXNzID0gJyc7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gJy4nICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZSgnY2FyZF9fZnJvbnQgJywgJycpO1xuXG4gICAgLy8gaWYgdGhlIGNhcmRzIG1hdGNoLCBnaXZlIHRoZW0gYSBjbGFzcyBvZiBtYXRjaFxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XG4gICAgfSAvLyByZW1vdmUgdGhlIGNsYXNzIG9mIGZsaXBwZWRcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgLy9pZiBjYXJkcyBkb24ndCBoYXZlIGEgZmxpcHBlZCBjbGFzcywgdGhleSBmbGlwIGJhY2tcbiAgICAgICAgLy9pZiBjYXJkcyBoYXZlIGEgY2xhc3Mgb2YgbWF0Y2gsIHRoZXkgc3RheSBmbGlwcGVkXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xuICAgIH0sIDEwMDApO1xufVxuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
