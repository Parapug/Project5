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
                cardGame.stop();
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImNvdW50ZXIiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsIm1hdGNoZXMiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsInBpY2tSYW5kUGhvdG9zIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwic2hvd1RpbWVyIiwiZ2FtZUZYIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImVsZW1lbnQiLCJjIiwiY29udGFpbnMiLCJhZGQiLCJjaGVja01hdGNoIiwidGltZVN0cmluZyIsInNlY29uZHNTdHJpbmciLCJzdWJTZWNvbmRzU3RyaW5nIiwibWludXRlcyIsInNlY29uZHMiLCJzdWJTZWNvbmRzIiwiaW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImNvbnNvbGUiLCJsb2ciLCJ0b1N0cmluZyIsIm1pbnV0ZXNTdHJpbmciLCJzdG9wIiwicGlja0FycmF5IiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJzcGxpY2UiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJhdHRyIiwiYWRkQ2xhc3MiLCJwcmV2IiwiY3VycmVudERvZ1BpY3NDbGFzcyIsImNoaWxkcmVuIiwicmVwbGFjZSIsInByZXZpb3VzRG9nUGljc0NsYXNzIiwiY3NzIiwic2V0VGltZW91dCIsInJlbW92ZUNsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjtBQUNBSCxTQUFTSSxLQUFULEdBQWlCLENBQWpCO0FBQ0FKLFNBQVNLLE9BQVQsR0FBbUIsQ0FBbkI7QUFDQUwsU0FBU00sU0FBVCxHQUFxQixLQUFyQjtBQUNBTixTQUFTTyxRQUFUO0FBQ0FQLFNBQVNRLFlBQVQsR0FBd0IsSUFBeEI7QUFDQVIsU0FBU1MsT0FBVCxHQUFtQixDQUFuQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQVQsU0FBU1UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRmYsaUJBQUtELFNBQVNDLEdBRFo7QUFFRmdCLHNCQUFVLGFBRlI7QUFHRkMsb0JBQVEsS0FITjtBQUlGQyxvQkFBUSxNQUpOO0FBS0ZDLHNCQUFVO0FBTFI7QUFKSCxLQUFQLEVBV0dDLElBWEgsQ0FXUSxVQUFVQyxHQUFWLEVBQWU7QUFDbkI7QUFDQXRCLGlCQUFTdUIsY0FBVCxDQUF3QkQsR0FBeEI7QUFDSCxLQWREO0FBZUgsQ0FoQkQ7O0FBa0JBO0FBQ0F0QixTQUFTdUIsY0FBVCxHQUEwQixVQUFDRCxHQUFELEVBQVM7QUFDL0IsUUFBSUUsVUFBVUYsSUFBSUcsU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUFqQzs7QUFFQTtBQUNBSCxZQUFRSSxPQUFSLENBQWdC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Y2FyZEdhbWUgPSB7fTtcclxuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcclxuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xyXG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xyXG5jYXJkR2FtZS50aW1lciA9IDA7XHJcbmNhcmRHYW1lLmNvdW50ZXIgPSAwXHJcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5jYXJkR2FtZS5wcmV2aW91cztcclxuY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuY2FyZEdhbWUubWF0Y2hlcyA9IDA7XHJcblxyXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxyXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xyXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXHJcbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXHJcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0Mi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cclxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxyXG4vLyBcdFx0NS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cclxuXHJcbi8vQUpBWCBjYWxsIHRvIFBldGZpbmRlciBBUElcclxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcclxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAga2V5OiBjYXJkR2FtZS5rZXksXHJcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxyXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxyXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgLy9waWNrIHJhbmRvbSBwaG90b3MgZnJvbSB0aGUgQVBJXHJcbiAgICAgICAgY2FyZEdhbWUucGlja1JhbmRQaG90b3MocmVzKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG4vL2Z1bmN0aW9uIHRvIGdyYWIgOCByYW5kb20gcGhvdG9zIGZyb20gQVBJIGZvciB0aGUgY2FyZCBmYWNlc1xyXG5jYXJkR2FtZS5waWNrUmFuZFBob3RvcyA9IChyZXMpID0+IHtcclxuICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcclxuXHJcbiAgICAvL3NhdmUgYWxsIHBldCBwaG90b3NcclxuICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XHJcbiAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bJyR0J10pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy9waWNrIDggcmFuZG9tIG9uZXNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCgocGljKSA9PiB7XHJcbiAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcclxuICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAvL2RvdWJsZSB1cCBmb3IgbWF0Y2hpbmcgKDggcGhvdG9zID0gMTYgY2FyZHMpXHJcbiAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgfVxyXG4gICAgLy9hcHBlbmQgdGhlIGRvZyBwaWNzIHRvIHRoZSBjYXJkcyBvbiB0aGUgcGFnZVxyXG4gICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcclxufVxyXG5cclxuLy9ldmVudCBoYW5kbGVyIGZ1bmN0aW9uXHJcbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcclxuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgdGl0bGU6ICdTd2VldCEnLFxyXG4gICAgICAgICAgICB0ZXh0OiAnTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zIGFyY2hpdGVjdG8gcXVhZXJhdCBvbW5pcyBtaW51cyBleGNlcHR1cmkgdXQgcHJhZXNlbnRpdW0sIHNvbHV0YSBsYXVkYW50aXVtIHBlcnNwaWNpYXRpcyBpbnZlbnRvcmU/IEVhIGFzc3VtZW5kYSB0ZW1wb3JlIG5hdHVzIGR1Y2ltdXMgaXBzdW0gbGF1ZGFudGl1bSBvZmZpY2lpcywgZW5pbSB2b2x1cHRhcy4nLFxyXG4gICAgICAgICAgICBpbWFnZVVybDogJ2h0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGcnXHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICAvL21ha2UgQUpBWCBjYWxsIGFmdGVyIHVzZXIgY2xpY2tzIE9LIG9uIHRoZSBhbGVydFxyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcclxuICAgIGxldCBjdXJyZW50ID0gJyc7XHJcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKXtcclxuICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7ICBcclxuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY291bnRlcisrO1xyXG5cclxuICAgICAgICAgICAgLy9zdGFydCB0aGUgdGltZXIgYWZ0ZXIgdGhlIGZpcnN0IGNhcmQgaXMgY2xpY2tlZFxyXG4gICAgICAgICAgICBpZiAoY2FyZEdhbWUuZ2FtZVN0YXJ0KSB7XHJcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5zaG93VGltZXIoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAvL3J1biBmdW5jdGlvbiBoYW5kbGluZyBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nYW1lRlgoJCh0aGlzKSwgZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdCwgY2FyZEdhbWUuY291bnRlcik7ICAgICAgICAgIFxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vL2Z1bmN0aW9uIGZvciBnYW1lIGVmZmVjdHMgYW5kIG1lY2hhbmljc1xyXG5jYXJkR2FtZS5nYW1lRlggPSAoZWxlbWVudCwgYywgY291bnRlcikgPT4ge1xyXG4gICAgLy9mbGlwIGNhcmQgaWYgY2FyZCBpcyBmYWNlIGRvd24sIG90aGVyd2lzZSBkbyBub3RoaW5nXHJcbiAgICBpZiAoIShjLmNvbnRhaW5zKCdmbGlwcGVkJykgfHwgYy5jb250YWlucygnbWF0Y2gnKSkpIHtcclxuICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xyXG4gICAgICAgIC8vY2hlY2sgZm9yIG1hdGNoIGFmdGVyIDIgY2FyZHMgZmxpcHBlZFxyXG4gICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmNoZWNrTWF0Y2goZWxlbWVudCwgY2FyZEdhbWUucHJldmlvdXMpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5jb3VudGVyID0gMDtcclxuICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgLy9vbiB0aGUgZmlyc3QgY2xpY2ssIHNhdmUgdGhpcyBjYXJkIGZvciBsYXRlclxyXG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9IGVsZW1lbnQ7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIFxyXG59XHJcblxyXG4vL2NhbGN1bGF0ZSBhbmQgZGlzcGxheSB0aW1lciBvbiBwYWdlXHJcbmNhcmRHYW1lLnNob3dUaW1lciA9ICgpID0+IHtcclxuICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxyXG4gICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgbGV0IG1pbnV0ZXM7XHJcbiAgICBsZXQgc2Vjb25kcztcclxuICAgIGxldCBzdWJTZWNvbmRzO1xyXG4gICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcblxyXG4gICAgaWYgKGNhcmRHYW1lLm1hdGNoZXMgPCA4KXtcclxuICAgICAgICAvL3RpbWVyIGZvcm1hdCBtbTpzcy54eFxyXG4gICAgICAgIGNhcmRHYW1lLmludGVydmFsID0gc2V0SW50ZXJ2YWwoKCk9PntcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJjYXJkR2FtZS5pbnRlcnZhbFwiLGNhcmRHYW1lLmludGVydmFsKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKzsgICBcclxuICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyJTEwMDtcclxuICAgICAgICAgICAgc3ViU2Vjb25kc1N0cmluZyA9IHN1YlNlY29uZHMudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgc2Vjb25kcyA9IE1hdGguZmxvb3IoY2FyZEdhbWUudGltZXIvMTAwKSU2MDtcclxuICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIvMTAwKS82MCklNjA7XHJcbiAgICAgICAgICAgIGlmIChzZWNvbmRzPD05KSB7XHJcbiAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID0nMCcgKyBzZWNvbmRzLnRvU3RyaW5nKCk7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlY29uZHNTdHJpbmcgPSBzZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIG1pbnV0ZXNTdHJpbmcgPSBNYXRoLmZsb29yKG1pbnV0ZXMpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIHRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gICAgIFxyXG4gICAgICAgICAgICAkKCcjdGltZScpLnRleHQodGltZVN0cmluZyk7XHJcbiAgICAgICAgICAgIGlmIChjYXJkR2FtZS5tYXRjaGVzID49IDgpe1xyXG4gICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjYXJkR2FtZS5zdG9wKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCAxMCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgLy9tYWtlIGFuIGFycmF5IG9mIG51bWJlcnMgZnJvbSAxLTE2IGZvciBjYXJkIGlkZW50aWZpY2F0aW9uXHJcbiAgICBsZXQgcGlja0FycmF5ID0gW107XHJcbiAgICBmb3IgKGxldCBpPTE7IGk8PTE2OyBpKyspe1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vYXNzaWduIGEgY2FyZCBwaWMgdG8gZWFjaCBkaXZcclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gYSByYW5kb20gY2FyZCBudW1iZXIgdG8gdGhlIGN1cnJlbnQgZGl2LmNhcmRcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLDEpO1xyXG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcclxuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy9hc3NpZ24gdGhlIGVxdWl2YWxlbnQgLmRvZ1BpY3MjIGNsYXNzIHRvIHRoZSBkaXZcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xyXG5cclxuICAgICAgICAvL2JhY2tncm91bmQgaW1hZ2Ugb2YgdGhlIGRpdiBpcyBhIHJhbmRvbSBkb2dcclxuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xyXG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xyXG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XHJcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcclxuICAgIH0pO1xyXG4gICAgLy9zdGFydCB0aGUgZ2FtZVxyXG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XHJcbn1cclxuXHJcbi8vY2hlY2sgZm9yIG1hdGNoZXMgYmV0d2VlbiB0aGUgdHdvIGNsaWNrZWQgY2FyZHNcclxuY2FyZEdhbWUuY2hlY2tNYXRjaCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XHJcbiAgICAvL2lzb2xhdGUgdGhlIGRvZ1BpY3MjIGNsYXNzIGZyb20gLmNhcmRfX2Zyb250IG9mIGJvdGggY2FyZHNcclxuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcclxuICAgIGNvbnNvbGUubG9nKGN1cnJlbnQpO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oJy5jYXJkX19mcm9udCcpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gXCIuXCIgKyBjdXJyZW50RG9nUGljc0NsYXNzLnJlcGxhY2UoJ2NhcmRfX2Zyb250ICcsICcnKTtcclxuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9ICcnO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKCcuY2FyZF9fZnJvbnQnKS5hdHRyKCdjbGFzcycpO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSAnLicgKyBwcmV2aW91c0RvZ1BpY3NDbGFzcy5yZXBsYWNlKCdjYXJkX19mcm9udCAnLCAnJyk7XHJcbiBcclxuICAgIC8vIGlmIHRoZSBjYXJkcyBtYXRjaCwgZ2l2ZSB0aGVtIGEgY2xhc3Mgb2YgbWF0Y2hcclxuICAgIGlmICgkKGN1cnJlbnREb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpID09PSAkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSkge1xyXG4gICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBjYXJkR2FtZS5tYXRjaGVzKys7XHJcbiAgICB9IC8vIHJlbW92ZSB0aGUgY2xhc3Mgb2YgZmxpcHBlZFxyXG4gICAgc2V0VGltZW91dCggKCkgPT4geyBcclxuICAgICAgICAvL2lmIGNhcmRzIGRvbid0IGhhdmUgYSBmbGlwcGVkIGNsYXNzLCB0aGV5IGZsaXAgYmFja1xyXG4gICAgICAgIC8vaWYgY2FyZHMgaGF2ZSBhIGNsYXNzIG9mIG1hdGNoLCB0aGV5IHN0YXkgZmxpcHBlZFxyXG4gICAgICAgIGN1cnJlbnQucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBwcmV2LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuICAgIH0sMTAwMCk7XHJcbn1cclxuLy8gICAgMy4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuXHJcblxyXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XHJcbn07XHJcblxyXG4kKCgpID0+IHtcclxuICAgIGNhcmRHYW1lLmluaXQoKTtcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcclxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxyXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZFxyXG4iXX0=
