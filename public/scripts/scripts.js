'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.gameStart = false;
cardGame.previous = "";

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
            text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dignissimos architecto quaerat omnis minus excepturi ut praesentium, soluta laudantium perspiciatis inventore? Ea assumenda tempore natus ducimus ipsum laudantium officiis, enim voluptas.",
            imageUrl: "https://i.pinimg.com/736x/f2/41/46/f24146096d2f87e31745a182ff395b10--pug-cartoon-art-ideas.jpg"
        }, function () {
            cardGame.getContent();
        });
    });
};

cardGame.matchGame = function () {
    var counter = 0;
    cardGame.previous = '';
    var current = '';

    $('.card').on('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        cardGame.gameStart = true;
        counter++;
        var c = e.currentTarget.classList;
        if (c.contains('flipped') === true) {
            c.remove('flipped');
            console.log("remove flip");
        } else {
            c.add('flipped');
        }

        if (counter === 2) {
            cardGame.gameFx($(this), cardGame.previous);
            counter = 0;
        } else if (counter === 1) {
            cardGame.previous = $(this);
        } else {
            counter = 0;
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
    cardGame.matchGame();
};

cardGame.gameFx = function (current, prev) {
    var currentDogPicsClass = "";
    currentDogPicsClass = current.children(".card__front").attr('class');
    currentDogPicsClass = "." + currentDogPicsClass.replace("card__front ", "");
    var previousDogPicsClass = "";
    previousDogPicsClass = prev.children(".card__front").attr('class');
    previousDogPicsClass = "." + previousDogPicsClass.replace("card__front ", "");
    if ($(currentDogPicsClass).css('background-image') === $(previousDogPicsClass).css('background-image')) {
        current.addClass('match');
    } else {
        setTimeout(function () {
            current.removeClass('flipped');
            prev.removeClass('flipped');
        }, 1500);
    }

    //    if ($('').css('background-image') === $('').css('background-image')) {
    //        
    //    }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImdldENvbnRlbnQiLCIkIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJ0aGVuIiwicmVzIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjb3VudGVyIiwiY3VycmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImMiLCJjdXJyZW50VGFyZ2V0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJyZW1vdmUiLCJjb25zb2xlIiwibG9nIiwiYWRkIiwiZ2FtZUZ4IiwiZWFjaCIsImVsIiwiZW1wdHkiLCJyYW5kQ2xhc3MiLCJwaWNzVG9Vc2UiLCJjbGFzc051bSIsInRvU3RyaW5nIiwiY2xhc3NOYW1lIiwicmFuZFBpYyIsInBpY1N0cmluZyIsInNwbGljZSIsImF0dHIiLCJhZGRDbGFzcyIsInByZXYiLCJjdXJyZW50RG9nUGljc0NsYXNzIiwiY2hpbGRyZW4iLCJyZXBsYWNlIiwicHJldmlvdXNEb2dQaWNzQ2xhc3MiLCJjc3MiLCJzZXRUaW1lb3V0IiwicmVtb3ZlQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsa0NBQWY7QUFDQUQsU0FBU0UsT0FBVCxHQUFt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QUFELEVBQVUwQixJQUFWLEVBQW1CO0FBQ2pDLFFBQUlDLHNCQUFzQixFQUExQjtBQUNBQSwwQkFBc0IzQixRQUFRNEIsUUFBUixDQUFpQixjQUFqQixFQUFpQ0osSUFBakMsQ0FBc0MsT0FBdEMsQ0FBdEI7QUFDQUcsMEJBQXNCLE1BQU1BLG9CQUFvQkUsT0FBcEIsQ0FBNEIsY0FBNUIsRUFBNEMsRUFBNUMsQ0FBNUI7QUFDQSxRQUFJQyx1QkFBdUIsRUFBM0I7QUFDQUEsMkJBQXVCSixLQUFLRSxRQUFMLENBQWMsY0FBZCxFQUE4QkosSUFBOUIsQ0FBbUMsT0FBbkMsQ0FBdkI7QUFDQU0sMkJBQXVCLE1BQU1BLHFCQUFxQkQsT0FBckIsQ0FBNkIsY0FBN0IsRUFBNkMsRUFBN0MsQ0FBN0I7QUFDQSxRQUFJbkUsRUFBRWlFLG1CQUFGLEVBQXVCSSxHQUF2QixDQUEyQixrQkFBM0IsTUFBbURyRSxFQUFFb0Usb0JBQUYsRUFBd0JDLEdBQXhCLENBQTRCLGtCQUE1QixDQUF2RCxFQUF3RztBQUNwRy9CLGdCQUFReUIsUUFBUixDQUFpQixPQUFqQjtBQUNILEtBRkQsTUFFTztBQUNITyxtQkFBWSxZQUFNO0FBQ2RoQyxvQkFBUWlDLFdBQVIsQ0FBb0IsU0FBcEI7QUFDQVAsaUJBQUtPLFdBQUwsQ0FBaUIsU0FBakI7QUFDSCxTQUhELEVBR0UsSUFIRjtBQUlIOztBQU9EO0FBQ0E7QUFDQTtBQUNILENBeEJEOztBQThCQTs7O0FBSUE5RSxTQUFTK0UsSUFBVCxHQUFnQixZQUFNO0FBQ2xCL0UsYUFBU3FDLE1BQVQ7QUFDSCxDQUZEOztBQUlBOUIsRUFBRSxZQUFNO0FBQ0pQLGFBQVMrRSxJQUFUO0FBQ0gsQ0FGRDs7QUFJQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzY3JpcHRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIGNhcmRHYW1lID0ge307XG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xuY2FyZEdhbWUuZG9nUGljcyA9IFtdO1xuY2FyZEdhbWUucmFuZFBpY3MgPSBbXTtcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xuY2FyZEdhbWUucHJldmlvdXMgPSBcIlwiO1xuXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxuXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiXG4gICAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xuXG4gICAgICAgIHBldERhdGEuZm9yRWFjaCgoZG9nKSA9PiB7XG4gICAgICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVtcIiR0XCJdKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MuZm9yRWFjaCgocGljKSA9PiB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xuICAgICAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICAgICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLnB1c2goY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSk7XG4gICAgICAgIH1cbiAgICAgICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUuZXZlbnRzID0gKCkgPT4ge1xuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsICgpID0+IHtcbiAgICAgICAgc3dhbCh7XG4gICAgICAgICAgICB0aXRsZTogXCJTd2VldCFcIixcbiAgICAgICAgICAgIHRleHQ6IFwiTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zIGFyY2hpdGVjdG8gcXVhZXJhdCBvbW5pcyBtaW51cyBleGNlcHR1cmkgdXQgcHJhZXNlbnRpdW0sIHNvbHV0YSBsYXVkYW50aXVtIHBlcnNwaWNpYXRpcyBpbnZlbnRvcmU/IEVhIGFzc3VtZW5kYSB0ZW1wb3JlIG5hdHVzIGR1Y2ltdXMgaXBzdW0gbGF1ZGFudGl1bSBvZmZpY2lpcywgZW5pbSB2b2x1cHRhcy5cIixcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGdcIlxuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5tYXRjaEdhbWUgPSAoKSA9PiB7XG4gICAgbGV0IGNvdW50ZXIgPSAwO1xuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XG4gICAgbGV0IGN1cnJlbnQgPSAnJztcblxuICAgICQoJy5jYXJkJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBjYXJkR2FtZS5nYW1lU3RhcnQgPSB0cnVlO1xuICAgICAgICBjb3VudGVyKys7XG4gICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcbiAgICAgICAgaWYgKGMuY29udGFpbnMoJ2ZsaXBwZWQnKSA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgYy5yZW1vdmUoJ2ZsaXBwZWQnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVtb3ZlIGZsaXBcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvdW50ZXIgPT09IDIpIHtcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGeCgkKHRoaXMpLCBjYXJkR2FtZS5wcmV2aW91cyk7XG4gICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgfSBlbHNlIGlmIChjb3VudGVyID09PSAxKSB7XG4gICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICQodGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb3VudGVyID0gMDtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcbiAgICAkKCcuY2FyZF9fZnJvbnQnKS5lYWNoKChpLCBlbCkgPT4ge1xuICAgICAgICAkKGVsKS5lbXB0eSgpO1xuICAgICAgICBsZXQgcmFuZENsYXNzID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUucmFuZFBpY3MubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY3NUb1VzZSA9IGNhcmRHYW1lLnJhbmRQaWNzO1xuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcbiAgICAgICAgbGV0IGNsYXNzTmFtZSA9IGBkb2dQaWNzJHtyYW5kQ2xhc3N9YDtcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XG4gICAgICAgICQoZWwpLmF0dHIoJ3N0eWxlJywgYGJhY2tncm91bmQtaW1hZ2U6IHVybCgke3BpY1N0cmluZ1swXX0pYCk7XG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XG4gICAgfSk7XG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XG59XG5cbmNhcmRHYW1lLmdhbWVGeCA9IChjdXJyZW50LCBwcmV2KSA9PiB7XG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKFwiLmNhcmRfX2Zyb250XCIpLmF0dHIoJ2NsYXNzJyk7XG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IFwiLlwiICsgY3VycmVudERvZ1BpY3NDbGFzcy5yZXBsYWNlKFwiY2FyZF9fZnJvbnQgXCIsIFwiXCIpO1xuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IFwiXCI7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKFwiLmNhcmRfX2Zyb250XCIpLmF0dHIoJ2NsYXNzJyk7XG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBcIi5cIiArIHByZXZpb3VzRG9nUGljc0NsYXNzLnJlcGxhY2UoXCJjYXJkX19mcm9udCBcIiwgXCJcIik7XG4gICAgaWYgKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XG4gICAgICAgIGN1cnJlbnQuYWRkQ2xhc3MoJ21hdGNoJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCggKCkgPT4ge1xuICAgICAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xuICAgICAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpOyAgICAgICAgICAgIFxuICAgICAgICB9LDE1MDApO1xuICAgIH1cblxuXG5cblxuXG5cbiAgICAvLyAgICBpZiAoJCgnJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQoJycpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XG4gICAgLy8gICAgICAgIFxuICAgIC8vICAgIH1cbn1cblxuXG5cblxuXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cblxuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
