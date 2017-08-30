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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwicGV0RGF0YSIsImZvckVhY2giLCJkb2ciLCJwdXNoIiwibWVkaWEiLCJwaG90b3MiLCJwaG90byIsImkiLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJvbiIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsIm1hdGNoR2FtZSIsImUiLCJjIiwiY3VycmVudFRhcmdldCIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwicmVtb3ZlIiwiYWRkIiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsInRvU3RyaW5nIiwiY2xhc3NOYW1lIiwiYXBwZW5kIiwic3BsaWNlIiwiYWRkQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsa0NBQWY7QUFDQUQsU0FBU0UsT0FBVCxHQUFtQixFQUFuQjtBQUNBRixTQUFTRyxRQUFULEdBQW9CLEVBQXBCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUgsU0FBU0ksVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRlQsaUJBQUtELFNBQVNDLEdB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QUF5QkosVUFBVUssTUFBVixDQUFpQjdCLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS0UsTUFBTCxLQUFjc0IsVUFBVXJCLE1BQW5DLENBQWpCLEVBQTRELENBQTVELENBQXpCO0FBQ0FqQixnQkFBUUMsR0FBUixDQUFZcUMsU0FBWjtBQUNBbEQsVUFBRStDLEVBQUYsRUFBTVMsUUFBTixDQUFlSCxTQUFmO0FBQ0gsS0FWRDtBQVdILENBWkQ7O0FBY0ExRCxTQUFTOEQsSUFBVCxHQUFnQixZQUFNO0FBQ2xCOUQsYUFBU3FDLE1BQVQ7QUFDQXJDLGFBQVMyQyxTQUFUO0FBQ0gsQ0FIRDs7QUFLQXRDLEVBQUUsWUFBSztBQUNITCxhQUFTOEQsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcblxyXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxyXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xyXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXHJcbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXHJcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0Mi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cclxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxyXG4vLyBcdFx0NS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cclxuXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIlxyXG4gICAgICAgIH1cclxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5wZXRmaW5kZXIucGV0cy5wZXQpO1xyXG4gICAgICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcclxuXHJcbiAgICAgICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpPT57XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdW1wiJHRcIl0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8ODsgaSsrKXtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKCAocGljKT0+IHtcclxuICAgICAgICAgICAgICAgIHdoaWxlKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNhcmRHYW1lLmRpc3BsYXlDb250ZW50KCk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xyXG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xyXG4gICAgICAgIHN3YWwoe1xyXG4gICAgICAgICAgICB0aXRsZTogXCJTd2VldCFcIixcclxuICAgICAgICAgICAgdGV4dDogXCJIZXJlJ3MgYSBjdXN0b20gaW1hZ2UuXCIsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImltYWdlcy90aHVtYnMtdXAuanBnXCJcclxuICAgICAgICB9LCAoKT0+e1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgfSk7ICAgXHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4kKCcuY2FyZCcpLm9uKCdjbGljaycsIChlKSA9PiB7XHJcbiAgICAgICAgbGV0IGMgPSBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0O1xyXG4gICAgICAgIGlmIChjLmNvbnRhaW5zKCdmbGlwcGVkJykgPT09IHRydWUpIHtcclxuICAgICAgICAgICAgYy5yZW1vdmUoJ2ZsaXBwZWQnKTtcclxuICAgICAgICB9ICBlbHNlIHtcclxuICAgICAgICAgICAgYy5hZGQoJ2ZsaXBwZWQnKTtcclxuICAgICAgICB9XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKCAoaSxlbCk9PntcclxuICAgICAgICAkKGVsKS5lbXB0eSgpO1xyXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljc1RvVXNlID0gY2FyZEdhbWUucmFuZFBpY3M7XHJcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcclxuXHJcbiAgICAgICAgJChlbCkuYXBwZW5kKGA8aW1nIHNyYz0ke3BpY3NUb1VzZS5zcGxpY2UoTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBpY3NUb1VzZS5sZW5ndGgpLDEpfT5gKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhwaWNzVG9Vc2UpO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTsgICBcclxufVxyXG5cclxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xyXG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XHJcbn07XHJcblxyXG4kKCgpID0+e1xyXG4gICAgY2FyZEdhbWUuaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxyXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXHJcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kXHJcbiJdfQ==
