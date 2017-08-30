'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];

// User should press 'Start', fadeIn instructions on top with an "x" to close and a button close
// Loading screen, if needed, while AJAX calls request pics of doges
// Game board loads with 4x4 layout, cards face down
// Timer starts when a card is flipped
// 		1. On click of a card, it flips and reveals a doge
// 		2. On click of a second card, it also flips and reveals a doge
// 		3. Compare the pictures (aka the value or id) and if equal, then match = true, else flip them back over. If match = true, cards stay flipped. Counter for # of matches increase by 1.
// 		4. Once the # of matches = 8, then the timer stops and the game is over.
// 		5. Popup box congratulating the player with their time. Restart button if the user wishes to play again.

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
        console.log(res.petfinder.pets.pet);
        var petData = res.petfinder.pets.pet;

        petData.forEach(function (dog) {
            cardGame.dogPics.push(dog.media.photos.photo[2]["$t"]);
        });

        var _loop = function _loop(i) {
            var randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
            cardGame.randPics.forEach(function (pic) {
                while (cardGame.dogPics[randomPick] === pic) {
                    randomPick = Math.floor(Math.random() * cardGame.dogPics.length);
                }
            });
            cardGame.randPics.push(cardGame.dogPics[randomPick]);
            cardGame.randPics.push(cardGame.dogPics[randomPick]);
        };

        for (var i = 0; i < 8; i++) {
            _loop(i);
        }

        cardGame.displayContent();
    });
};

cardGame.events = function () {
    $('.startBtn').on('click', function () {
        swal({
            title: "Sweet!",
            text: "Here's a custom image.",
            imageUrl: "images/thumbs-up.jpg"
        }, function () {
            cardGame.getContent();
        });
    });
};

cardGame.matchGame = function () {
    $('.card').on('click', function (e) {
        var c = e.currentTarget.classList;
        if (c.contains('flipped') === true) {
            c.remove('flipped');
        } else {
            c.add('flipped');
        }
    });
};

cardGame.displayContent = function () {
    $('.card__front').each(function (i, el) {
        $(el).empty();
        var randClass = Math.floor(Math.random() * cardGame.randPics.length);
        var picsToUse = cardGame.randPics;
        var classNum = randClass.toString();
        var className = 'dogPics' + randClass;

        $(el).append('<img src=' + picsToUse.splice(Math.floor(Math.random() * picsToUse.length), 1) + '>');
        console.log(picsToUse);
        $(el).addClass(className);
    });
};

cardGame.init = function () {
    cardGame.events();
    cardGame.matchGame();
};

$(function () {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwicGV0RGF0YSIsImZvckVhY2giLCJkb2ciLCJwdXNoIiwibWVkaWEiLCJwaG90b3MiLCJwaG90byIsImkiLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJvbiIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsIm1hdGNoR2FtZSIsImUiLCJjIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsInRvU3RyaW5nIiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwic3BsaWNlIiwiYWRkQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsa0NBQWY7QUFDQUQsU0FBU0UsT0FBVCxHQUFtQixFQUFuQjtBQUNBRixTQUFTRyxRQUFULEdBQW9CLEVBQXBCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUgsU0FBU0ksVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRlQsaUJBQUtELFNBQVNDLEdB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QUF5QkosVUFBVUssTUFBVixDQUFpQjdCLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS0UsTUFBTCxLQUFjc0IsVUFBVXJCLE1BQW5DLENBQWpCLEVBQTRELENBQTVELENBQXpCO0FBQ0FqQixnQkFBUUMsR0FBUixDQUFZcUMsU0FBWjtBQUNBbEQsVUFBRStDLEVBQUYsRUFBTVMsUUFBTixDQUFlSCxTQUFmO0FBQ0gsS0FWRDtBQVdILENBWkQ7O0FBY0ExRCxTQUFTOEQsSUFBVCxHQUFnQixZQUFNO0FBQ2xCOUQsYUFBU3FDLE1BQVQ7QUFDQXJDLGFBQVMyQyxTQUFUO0FBQ0gsQ0FIRDs7QUFLQXRDLEVBQUUsWUFBSztBQUNITCxhQUFTOEQsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XG5cbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG5cbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMucGV0ZmluZGVyLnBldHMucGV0KTtcbiAgICAgICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xuXG4gICAgICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKT0+e1xuICAgICAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bXCIkdFwiXSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZvciAobGV0IGk9MDsgaTw4OyBpKyspe1xuICAgICAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCggKHBpYyk9PiB7XG4gICAgICAgICAgICAgICAgd2hpbGUoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgIH1cblxuICAgICAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlN3ZWV0IVwiLFxuICAgICAgICAgICAgdGV4dDogXCJIZXJlJ3MgYSBjdXN0b20gaW1hZ2UuXCIsXG4gICAgICAgICAgICBpbWFnZVVybDogXCJpbWFnZXMvdGh1bWJzLXVwLmpwZ1wiXG4gICAgICAgIH0sICgpPT57XG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XG4gICAgICAgIH0pOyAgIFxuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XG4kKCcuY2FyZCcpLm9uKCdjbGljaycsIChlKSA9PiB7XG4gICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcbiAgICAgICAgaWYgKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYy5yZW1vdmUoJ2ZsaXBwZWQnKTtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goIChpLGVsKT0+e1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuICAgICAgICBsZXQgcmFuZENsYXNzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XG5cbiAgICAgICAgJChlbCkuYXBwZW5kKGA8aW1nIHNyYz0ke3BpY3NUb1VzZS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBpY3NUb1VzZS5sZW5ndGgpLDEpfT5gKTtcbiAgICAgICAgY29uc29sZS5sb2cocGljc1RvVXNlKTtcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICB9KTsgICBcbn1cblxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcbn07XG5cbiQoKCkgPT57XG4gICAgY2FyZEdhbWUuaW5pdCgpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kXG4iXX0=
