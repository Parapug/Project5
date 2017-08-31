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
        e.preventDefault();
        e.stopPropagation();
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
        var randPic = Math.floor(Math.random() * picsToUse.length);
        var picString = picsToUse.splice(randPic, 1);
        $(el).attr('style', 'background-image: url(' + picString[0] + ')');
        $(el).addClass(className);
        cardGame.gameFx(picString);
    });
};

cardGame.gameFx = function (pic) {
    //after when two cards are flipped, flip them back
    //when two cards are flipped and pic === pic, than stay flipped
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsInBldERhdGEiLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZm9yRWFjaCIsImRvZyIsInB1c2giLCJtZWRpYSIsInBob3RvcyIsInBob3RvIiwiaSIsInJhbmRvbVBpY2siLCJNYXRoIiwiZmxvb3IiLCJyYW5kb20iLCJsZW5ndGgiLCJwaWMiLCJkaXNwbGF5Q29udGVudCIsImV2ZW50cyIsIm9uIiwic3dhbCIsInRpdGxlIiwidGV4dCIsImltYWdlVXJsIiwibWF0Y2hHYW1lIiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiYyIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInJlbW92ZSIsImFkZCIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJ0b1N0cmluZyIsImNsYXNzTmFtZSIsInJhbmRQaWMiLCJwaWNTdHJpbmciLCJzcGxpY2UiLCJjb25zb2xlIiwibG9nIiwiYXR0ciIsImFkZENsYXNzIiwiZ2FtZUZ4IiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFILFNBQVNJLFVBQVQsR0FBc0IsWUFBTTtBQUN4QkMsTUFBRUMsSUFBRixDQUFPO0FBQ0hDLGdEQURHO0FB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QUFzQkosU0FBMUI7QUFDQSxZQUFJSyxVQUFVOUIsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCd0IsVUFBVXZCLE1BQXJDLENBQWQ7QUFDQSxZQUFJNEIsWUFBWUwsVUFBVU0sTUFBVixDQUFpQkYsT0FBakIsRUFBMEIsQ0FBMUIsQ0FBaEI7QUFDQUcsZ0JBQVFDLEdBQVIsQ0FBWUgsU0FBWjtBQUNBdkQsVUFBRStDLEVBQUYsRUFBTVksSUFBTixDQUFXLE9BQVgsNkJBQTZDSixVQUFVLENBQVYsQ0FBN0M7QUFDQXZELFVBQUUrQyxFQUFGLEVBQU1hLFFBQU4sQ0FBZVAsU0FBZjtBQUNBMUQsaUJBQVNrRSxNQUFULENBQWdCTixTQUFoQjtBQUNILEtBWkQ7QUFhSCxDQWREOztBQWdCQTVELFNBQVNrRSxNQUFULEdBQWtCLFVBQUNqQyxHQUFELEVBQVM7QUFDdkI7QUFDQTtBQUNILENBSEQ7O0FBS0FqQyxTQUFTbUUsSUFBVCxHQUFnQixZQUFNO0FBQ2xCbkUsYUFBU21DLE1BQVQ7QUFDQW5DLGFBQVN5QyxTQUFUO0FBQ0gsQ0FIRDs7QUFLQXBDLEVBQUUsWUFBTTtBQUNKTCxhQUFTbUUsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XG5cbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG5cbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XG5cbiAgICAgICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcbiAgICAgICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdW1wiJHRcIl0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoKSA9PiB7XG4gICAgICAgIHN3YWwoe1xuICAgICAgICAgICAgdGl0bGU6IFwiU3dlZXQhXCIsXG4gICAgICAgICAgICB0ZXh0OiBcIkhlcmUncyBhIGN1c3RvbSBpbWFnZS5cIixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImltYWdlcy90aHVtYnMtdXAuanBnXCJcbiAgICAgICAgfSwgKCkgPT4ge1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgKGUpID0+IHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBsZXQgYyA9IGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3Q7XG4gICAgICAgIGlmIChjLmNvbnRhaW5zKCdmbGlwcGVkJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGMucmVtb3ZlKCdmbGlwcGVkJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XG4gICAgICAgICQoZWwpLmVtcHR5KCk7XG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpO1xuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xuICAgICAgICBsZXQgcmFuZFBpYyA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHBpY3NUb1VzZS5sZW5ndGgpO1xuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcbiAgICAgICAgY29uc29sZS5sb2cocGljU3RyaW5nKTtcbiAgICAgICAgJChlbCkuYXR0cignc3R5bGUnLCBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cGljU3RyaW5nWzBdfSlgKTtcbiAgICAgICAgJChlbCkuYWRkQ2xhc3MoY2xhc3NOYW1lKTtcbiAgICAgICAgY2FyZEdhbWUuZ2FtZUZ4KHBpY1N0cmluZyk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLmdhbWVGeCA9IChwaWMpID0+IHtcbiAgICAvL2FmdGVyIHdoZW4gdHdvIGNhcmRzIGFyZSBmbGlwcGVkLCBmbGlwIHRoZW0gYmFja1xuICAgIC8vd2hlbiB0d28gY2FyZHMgYXJlIGZsaXBwZWQgYW5kIHBpYyA9PT0gcGljLCB0aGFuIHN0YXkgZmxpcHBlZFxufVxuXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufTtcblxuJCgoKSA9PiB7XG4gICAgY2FyZEdhbWUuaW5pdCgpO1xufSk7XG5cbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kXG4iXX0=
