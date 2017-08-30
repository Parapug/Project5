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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwicGV0RGF0YSIsImZvckVhY2giLCJkb2ciLCJwdXNoIiwibWVkaWEiLCJwaG90b3MiLCJwaG90byIsImkiLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJvbiIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsIm1hdGNoR2FtZSIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImMiLCJjdXJyZW50VGFyZ2V0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJyZW1vdmUiLCJhZGQiLCJlYWNoIiwiZWwiLCJlbXB0eSIsInJhbmRDbGFzcyIsInBpY3NUb1VzZSIsImNsYXNzTnVtIiwidG9TdHJpbmciLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwic3BsaWNlIiwiYXR0ciIsImFkZENsYXNzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmO0FBQ0FELFNBQVNFLE9BQVQsR0FBbUIsRUFBbkI7QUFDQUYsU0FBU0csUUFBVCxHQUFvQixFQUFwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUFILFNBQVNJLFVBQVQsR0FBc0IsWUFBTTtBQUN4QkMsTUFBRUMsSUFBRixDQUFPO0FBQ0hDLGdEQURHO0FBRUhDLGdCQUFR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Q0EsWUFBSXVELFdBQVdGLFVBQVVHLFFBQVYsRUFBZjtBQUNBLFlBQUlDLHdCQUFzQkosU0FBMUI7QUFDQSxZQUFJSyxVQUFVOUIsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWN3QixVQUFVdkIsTUFBbkMsQ0FBZDtBQUNBLFlBQUk0QixZQUFZTCxVQUFVTSxNQUFWLENBQWlCRixPQUFqQixFQUF5QixDQUF6QixDQUFoQjtBQUNBeEQsVUFBRWlELEVBQUYsRUFBTVUsSUFBTixDQUFXLE9BQVgsNkJBQTZDRixVQUFVLENBQVYsQ0FBN0M7QUFDQXpELFVBQUVpRCxFQUFGLEVBQU1XLFFBQU4sQ0FBZUwsU0FBZjtBQUNILEtBVkQ7QUFXSCxDQVpEOztBQWNBNUQsU0FBU2tFLElBQVQsR0FBZ0IsWUFBTTtBQUNsQmxFLGFBQVNxQyxNQUFUO0FBQ0FyQyxhQUFTMkMsU0FBVDtBQUNILENBSEQ7O0FBS0F0QyxFQUFFLFlBQUs7QUFDSEwsYUFBU2tFLElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcbmNhcmRHYW1lLmtleSA9ICc2Y2M2MjE0NTJjYWRkNmQ2Zjg2N2Y0NDM1NzIzODAzZic7XG5jYXJkR2FtZS5kb2dQaWNzID0gW107XG5jYXJkR2FtZS5yYW5kUGljcyA9IFtdO1xuXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxuXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiXG4gICAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLnBldGZpbmRlci5wZXRzLnBldCk7XG4gICAgICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcblxuICAgICAgICBwZXREYXRhLmZvckVhY2goKGRvZyk9PntcbiAgICAgICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdW1wiJHRcIl0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpPTA7IGk8ODsgaSsrKXtcbiAgICAgICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goIChwaWMpPT4ge1xuICAgICAgICAgICAgICAgIHdoaWxlKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xuICAgICAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNhcmRHYW1lLmRvZ1BpY3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICB9XG5cbiAgICAgICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc3dhbCh7XG4gICAgICAgICAgICB0aXRsZTogXCJTd2VldCFcIixcbiAgICAgICAgICAgIHRleHQ6IFwiSGVyZSdzIGEgY3VzdG9tIGltYWdlLlwiLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaW1hZ2VzL3RodW1icy11cC5qcGdcIlxuICAgICAgICB9LCAoKT0+e1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xuICAgICAgICB9KTsgICBcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuJCgnLmNhcmQnKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcbiAgICAgICAgaWYgKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYy5yZW1vdmUoJ2ZsaXBwZWQnKTtcbiAgICAgICAgfSAgZWxzZSB7XG4gICAgICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goIChpLGVsKT0+e1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuICAgICAgICBsZXQgcmFuZENsYXNzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKmNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKnBpY3NUb1VzZS5sZW5ndGgpO1xuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLDEpO1xuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH0pOyAgIFxufVxuXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufTtcblxuJCgoKSA9PntcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
