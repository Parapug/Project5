'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.gameStart = false;
cardGame.previous = "";
cardGame.clickAllowed = true;

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
    if (cardGame.clickAllowed) {
        $('.card').on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            cardGame.gameStart = true;
            counter++;

            var c = e.currentTarget.classList;
            if (!c.contains('flipped')) {
                c.add('flipped');
                if (counter >= 2) {
                    cardGame.clickAllowed = false;
                    cardGame.gameFx($(this), cardGame.previous);
                    counter = 0;
                } else if (counter === 1) {
                    cardGame.previous = $(this);
                } else {
                    counter = 0;
                }
            }
        });
    }
};

cardGame.displayContent = function () {
    var pickArray = [];
    for (var i = 1; i <= 16; i++) {
        pickArray.push(i);
    }
    $('.card__front').each(function (i, el) {
        $(el).empty();

        var randClass = pickArray.splice(Math.floor(Math.random() * cardGame.randPics.length), 1);
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
    console.log($(currentDogPicsClass).css('background-image'));
    console.log("VS.");
    console.log($(previousDogPicsClass).css('background-image'));

    // $('.card').off('click');
    if ($(currentDogPicsClass).css('background-image') === $(previousDogPicsClass).css('background-image')) {
        current.addClass('match');
        prev.addClass('match');
        console.log('match found');
    }
    setTimeout(function () {
        current.removeClass('flipped');
        prev.removeClass('flipped');
        cardGame.clickAllowed = true;
    }, 600);

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsImdldENvbnRlbnQiLCIkIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJ0aGVuIiwicmVzIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjb3VudGVyIiwiY3VycmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImMiLCJjdXJyZW50VGFyZ2V0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJhZGQiLCJnYW1lRngiLCJwaWNrQXJyYXkiLCJlYWNoIiwiZWwiLCJlbXB0eSIsInJhbmRDbGFzcyIsInNwbGljZSIsInBpY3NUb1VzZSIsImNsYXNzTnVtIiwidG9TdHJpbmciLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsImNvbnNvbGUiLCJsb2ciLCJjc3MiLCJzZXRUaW1lb3V0IiwicmVtb3ZlQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsa0NBQWY7QUFDQUQsU0FBU0UsT0FBVCxHQUFtQixFQUFuQjtBQUNBRixTQUFTRyxRQUFULEdBQW9CLEVBQXBCO0FBQ0FILFNBQVNJLFNBQVQsR0FBcUIsS0FBckI7QUFDQUosU0FBU0ssUUFBVCxHQUFvQixFQUFwQjtBQUNBTCxTQUFTTSxZQUFULEdBQXdCLElBQXhCOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQU4sU0FBU08sVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRlosaUJBQUtELFNBQVNDLEdBRFo7QUFFRmEsc0JBQVUsYUFGUjtBQUdGQyxvQkFBUSxLQUhOO0FBSUZDLG9CQUFRLE1BSk47QUFLRkMsc0JBQVU7QUFMUjtBQUpILEtBQVAsRUFXR0MsSUFYSCxDQVdRLFVBQVVDLEdBQVYsRUFBZTtBQUNuQixZQUFJQyxVQUFVRCxJQUFJRSxTQUFKLENBQWNDLElBQWQsQ0FBbUJDLEdBQWpDOztBQUVBSCxnQkFBUUksT0FBUixDQUFnQixVQUFDQyxHQUFELEVBQVM7QUFDckJ6QixxQkFBU0UsT0FBVCxDQUFpQndCLElBQWpCLENBQXNCRCxJQUFJRSxLQUFKLENBQVVDLE1BQVYsQ0FBaUJDLEtBQWpCLENBQXVCLENBQXZCLEVBQTBCLElBQTFCLENBQXRCO0FBQ0gsU0FGRDs7QUFIbUIsbUNBT1ZDLENBUFU7QUFRZixnQkFBSUMsYUFBYUMsS0FBS0MsS0FBTCxDQUFXRCxLQUFLRSxNQUFMLEtBQWdCbEMsU0FBU0UsT0FBVCxDQUFpQmlDLE1BQTVDLENBQWpCO0FBQ0FuQyxxQkFBU0csUUFBVCxDQUFrQnFCLE9BQWxCLENBQTBCLFVBQUNZLEdBQUQsRUFBUztBQUMvQix1QkFBT3BDLFNBQVNFLE9BQVQsQ0FBaUI2QixVQUFqQixNQUFpQ0ssR0FBeEMsRUFBNkM7QUFDekNMLGlDQUFhQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0JsQyxTQUFTRSxPQUFULENBQWlCaUMsTUFBNUMsQ0FBYjtBQUNIO0FBQ0osYUFKRDtBQUtBbkMscUJBQVNHLFFBQVQsQ0FBa0J1QixJQUFsQixDQUF1QjFCLFNBQVNFLE9BQVQsQ0FBaUI2QixVQUFqQixDQUF2QjtBQUNBL0IscUJBQVNHLFFBQVQsQ0FBa0J1QixJQUFsQixDQUF1QjFCLFNBQVNFLE9BQVQsQ0FBaUI2QixVQUFqQixDQUF2QjtBQWZlOztBQU9uQixhQUFLLElBQUlELElBQUksQ0FBYixFQUFnQkEsSUFBSSxDQUFwQixFQUF1QkEsR0FBdkIsRUFBNEI7QUFBQSxrQkFBbkJBLENBQW1CO0FBUzNCO0FBQ0Q5QixpQkFBU3FDLGNBQVQ7QUFDSCxLQTdCRDtBQThCSCxDQS9CRDs7QUFpQ0FyQyxTQUFTc0MsTUFBVCxHQUFrQixZQUFNO0FBQ3BCOUIsTUFBRSxXQUFGLEVBQWUrQixFQUFmLENBQWtCLE9BQWxCLEVBQTJCLFlBQU07QUFDN0JDLGFBQUs7QUFDREMsbUJBQU8sUUFETjtBQUVEQyxrQkFBTSx1UEFGTDtBQUdEQyxzQkFBVTtBQUhULFNBQUwsRUFJRyxZQUFNO0FBQ0wzQyxxQkFBU08sVUFBVDtBQUNILFNBTkQ7QUFPSCxLQVJEO0FBU0gsQ0FWRDs7QUFZQVAsU0FBUzRDLFNBQVQsR0FBcUIsWUFBTTtBQUN2QixRQUFJQyxVQUFVLENBQWQ7QUFDQTdDLGFBQVNLLFFBQVQsR0FBb0IsRUFBcEI7QUFDQSxRQUFJeUMsVUFBVSxFQUFkO0FBQ0EsUUFBSTlDLFNBQVNNLFlBQWIsRUFBMEI7QUFDdEJFLFVBQUUsT0FBRixFQUFXK0IsRUFBWCxDQUFjLE9BQWQsRUFBdUIsVUFBVVEsQ0FBVixFQUFhO0FBQ2hDQSxjQUFFQyxjQUFGO0FBQ0FELGNBQUVFLGVBQUY7QUFDQWpELHFCQUFTSSxTQUFULEdBQXFCLElBQXJCO0FBQ0F5Qzs7QUFFQSxnQkFBSUssSUFBSUgsRUFBRUksYUFBRixDQUFnQkMsU0FBeEI7QUFDQSxnQkFBSSxDQUFDRixFQUFFRyxRQUFGLENBQVcsU0FBWCxDQUFMLEVBQTRCO0FBQ3hCSCxrQkFBRUksR0FBRixDQUFNLFNBQU47QUFDQSxvQkFBSVQsV0FBVyxDQUFmLEVBQWtCO0FBQ2Q3Qyw2QkFBU00sWUFBVCxHQUF3QixLQUF4QjtBQUNBTiw2QkFBU3VELE1BQVQsQ0FBZ0IvQyxFQUFFLElBQUYsQ0FBaEIsRUFBeUJSLFNBQVNLLFFBQWxDO0FBQ0F3Qyw4QkFBVSxDQUFWO0FBQ0gsaUJBSkQsTUFJTyxJQUFJQSxZQUFZLENBQWhCLEVBQW1CO0FBQ3RCN0MsNkJBQVNLLFFBQVQsR0FBb0JHLEVBQUUsSUFBRixDQUFwQjtBQUNILGlCQUZNLE1BRUE7QUFDSHFDLDhCQUFVLENBQVY7QUFDSDtBQUNKO0FBQ0osU0FuQkQ7QUFvQkg7QUFDSixDQTFCRDs7QUE0QkE3QyxTQUFTcUMsY0FBVCxHQUEwQixZQUFNO0FBQzVCLFFBQUltQixZQUFZLEVBQWhCO0FBQ0EsU0FBSyxJQUFJMUIsSUFBRSxDQUFYLEVBQWNBLEtBQUcsRUFBakIsRUFBcUJBLEdBQXJCLEVBQXlCO0FBQ3JCMEIsa0JBQVU5QixJQUFWLENBQWVJLENBQWY7QUFDSDtBQUNEdEIsTUFBRSxjQUFGLEVBQWtCaUQsSUFBbEIsQ0FBdUIsVUFBQzNCLENBQUQsRUFBSTRCLEVBQUosRUFBVztBQUM5QmxELFVBQUVrRCxFQUFGLEVBQU1DLEtBQU47O0FBRUEsWUFBSUMsWUFBWUosVUFBVUssTUFBVixDQUFpQjdCLEtBQUtDLEtBQUwsQ0FBV0QsS0FBS0UsTUFBTCxLQUFnQmxDLFNBQVNHLFFBQVQsQ0FBa0JnQyxNQUE3QyxDQUFqQixFQUFzRSxDQUF0RSxDQUFoQjtBQUNBLFlBQUkyQixZQUFZOUQsU0FBU0csUUFBekI7QUFDQSxZQUFJNEQsV0FBV0gsVUFBVUksUUFBVixFQUFmO0FBQ0EsWUFBSUMsd0JBQXNCTCxTQUExQjtBQUNBLFlBQUlNLFVBQVVsQyxLQUFLQyxLQUFMLENBQVdELEtBQUtFLE1BQUwsS0FBZ0I0QixVQUFVM0IsTUFBckMsQ0FBZDtBQUNBLFlBQUlnQyxZQUFZTCxVQUFVRCxNQUFWLENBQWlCSyxPQUFqQixFQUEwQixDQUExQixDQUFoQjtBQUNBMUQsVUFBRWtELEVBQUYsRUFBTVUsSUFBTixDQUFXLE9BQVgsNkJBQTZDRCxVQUFVLENBQVYsQ0FBN0M7QUFDQTNELFVBQUVrRCxFQUFGLEVBQU1XLFFBQU4sQ0FBZUosU0FBZjtBQUNILEtBWEQ7QUFZQWpFLGFBQVM0QyxTQUFUO0FBQ0gsQ0FsQkQ7O0FBb0JBNUMsU0FBU3VELE1BQVQsR0FBa0IsVUFBQ1QsT0FBRCxFQUFVd0IsSUFBVixFQUFtQjtBQUNqQyxRQUFJQyxzQkFBc0IsRUFBMUI7QUFDQUEsMEJBQXNCekIsUUFBUTBCLFFBQVIsQ0FBaUIsY0FBakIsRUFBaUNKLElBQWpDLENBQXNDLE9BQXRDLENBQXRCO0FBQ0FHLDBCQUFzQixNQUFNQSxvQkFBb0JFLE9BQXBCLENBQTRCLGNBQTVCLEVBQTRDLEVBQTVDLENBQTVCO0FBQ0EsUUFBSUMsdUJBQXVCLEVBQTNCO0FBQ0FBLDJCQUF1QkosS0FBS0UsUUFBTCxDQUFjLGNBQWQsRUFBOEJKLElBQTlCLENBQW1DLE9BQW5DLENBQXZCO0FBQ0FNLDJCQUF1QixNQUFNQSxxQkFBcUJELE9BQXJCLENBQTZCLGNBQTdCLEVBQTZDLEVBQTdDLENBQTdCO0FBQ0FFLFlBQVFDLEdBQVIsQ0FBWXBFLEVBQUUrRCxtQkFBRixFQUF1Qk0sR0FBdkIsQ0FBMkIsa0JBQTNCLENBQVo7QUFDQUYsWUFBUUMsR0FBUixDQUFZLEtBQVo7QUFDQUQsWUFBUUMsR0FBUixDQUFZcEUsRUFBRWtFLG9CQUFGLEVBQXdCRyxHQUF4QixDQUE0QixrQkFBNUIsQ0FBWjs7QUFFQTtBQUNBLFFBQUlyRSxFQUFFK0QsbUJBQUYsRUFBdUJNLEdBQXZCLENBQTJCLGtCQUEzQixNQUFtRHJFLEVBQUVrRSxvQkFBRixFQUF3QkcsR0FBeEIsQ0FBNEIsa0JBQTVCLENBQXZELEVBQXdHO0FBQ3BHL0IsZ0JBQVF1QixRQUFSLENBQWlCLE9BQWpCO0FBQ0FDLGFBQUtELFFBQUwsQ0FBYyxPQUFkO0FBQ0FNLGdCQUFRQyxHQUFSLENBQVksYUFBWjtBQUNIO0FBQ0FFLGVBQVksWUFBTTtBQUNmaEMsZ0JBQVFpQyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FULGFBQUtTLFdBQUwsQ0FBaUIsU0FBakI7QUFDQS9FLGlCQUFTTSxZQUFULEdBQXdCLElBQXhCO0FBQ0YsS0FKRCxFQUlFLEdBSkY7O0FBVUQ7QUFDQTtBQUNBO0FBQ0gsQ0E5QkQ7O0FBb0NBOzs7QUFJQU4sU0FBU2dGLElBQVQsR0FBZ0IsWUFBTTtBQUNsQmhGLGFBQVNzQyxNQUFUO0FBQ0gsQ0FGRDs7QUFJQTlCLEVBQUUsWUFBTTtBQUNKUixhQUFTZ0YsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLmdhbWVTdGFydCA9IGZhbHNlO1xyXG5jYXJkR2FtZS5wcmV2aW91cyA9IFwiXCI7XHJcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcblxyXG4vLyBVc2VyIHNob3VsZCBwcmVzcyAnU3RhcnQnLCBmYWRlSW4gaW5zdHJ1Y3Rpb25zIG9uIHRvcCB3aXRoIGFuIFwieFwiIHRvIGNsb3NlIGFuZCBhIGJ1dHRvbiBjbG9zZVxyXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xyXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXHJcbi8vIFRpbWVyIHN0YXJ0cyB3aGVuIGEgY2FyZCBpcyBmbGlwcGVkXHJcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0Mi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDMuIENvbXBhcmUgdGhlIHBpY3R1cmVzIChha2EgdGhlIHZhbHVlIG9yIGlkKSBhbmQgaWYgZXF1YWwsIHRoZW4gbWF0Y2ggPSB0cnVlLCBlbHNlIGZsaXAgdGhlbSBiYWNrIG92ZXIuIElmIG1hdGNoID0gdHJ1ZSwgY2FyZHMgc3RheSBmbGlwcGVkLiBDb3VudGVyIGZvciAjIG9mIG1hdGNoZXMgaW5jcmVhc2UgYnkgMS5cclxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxyXG4vLyBcdFx0NS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cclxuXHJcbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICAkLmFqYXgoe1xyXG4gICAgICAgIHVybDogYGh0dHA6Ly9hcGkucGV0ZmluZGVyLmNvbS9wZXQuZmluZGAsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIlxyXG4gICAgICAgIH1cclxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xyXG4gICAgICAgIGxldCBwZXREYXRhID0gcmVzLnBldGZpbmRlci5wZXRzLnBldDtcclxuXHJcbiAgICAgICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZG9nUGljcy5wdXNoKGRvZy5tZWRpYS5waG90b3MucGhvdG9bMl1bXCIkdFwiXSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgODsgaSsrKSB7XHJcbiAgICAgICAgICAgIGxldCByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcclxuICAgICAgICAgICAgICAgIHdoaWxlIChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdID09PSBwaWMpIHtcclxuICAgICAgICAgICAgICAgICAgICByYW5kb21QaWNrID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogY2FyZEdhbWUuZG9nUGljcy5sZW5ndGgpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQoKTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XHJcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgc3dhbCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlN3ZWV0IVwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIkxvcmVtIGlwc3VtIGRvbG9yIHNpdCBhbWV0LCBjb25zZWN0ZXR1ciBhZGlwaXNpY2luZyBlbGl0LiBEaWduaXNzaW1vcyBhcmNoaXRlY3RvIHF1YWVyYXQgb21uaXMgbWludXMgZXhjZXB0dXJpIHV0IHByYWVzZW50aXVtLCBzb2x1dGEgbGF1ZGFudGl1bSBwZXJzcGljaWF0aXMgaW52ZW50b3JlPyBFYSBhc3N1bWVuZGEgdGVtcG9yZSBuYXR1cyBkdWNpbXVzIGlwc3VtIGxhdWRhbnRpdW0gb2ZmaWNpaXMsIGVuaW0gdm9sdXB0YXMuXCIsXHJcbiAgICAgICAgICAgIGltYWdlVXJsOiBcImh0dHBzOi8vaS5waW5pbWcuY29tLzczNngvZjIvNDEvNDYvZjI0MTQ2MDk2ZDJmODdlMzE3NDVhMTgyZmYzOTViMTAtLXB1Zy1jYXJ0b29uLWFydC1pZGVhcy5qcGdcIlxyXG4gICAgICAgIH0sICgpID0+IHtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2V0Q29udGVudCgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcclxuICAgIGxldCBjb3VudGVyID0gMDtcclxuICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJyc7XHJcbiAgICBsZXQgY3VycmVudCA9ICcnO1xyXG4gICAgaWYgKGNhcmRHYW1lLmNsaWNrQWxsb3dlZCl7XHJcbiAgICAgICAgJCgnLmNhcmQnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVTdGFydCA9IHRydWU7XHJcbiAgICAgICAgICAgIGNvdW50ZXIrKztcclxuXHJcbiAgICAgICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcclxuICAgICAgICAgICAgaWYgKCFjLmNvbnRhaW5zKCdmbGlwcGVkJykpIHtcclxuICAgICAgICAgICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY291bnRlciA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZUZ4KCQodGhpcyksIGNhcmRHYW1lLnByZXZpb3VzKTtcclxuICAgICAgICAgICAgICAgICAgICBjb3VudGVyID0gMDtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLnByZXZpb3VzID0gJCh0aGlzKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XHJcbiAgICBsZXQgcGlja0FycmF5ID0gW107XHJcbiAgICBmb3IgKGxldCBpPTE7IGk8PTE2OyBpKyspe1xyXG4gICAgICAgIHBpY2tBcnJheS5wdXNoKGkpO1xyXG4gICAgfVxyXG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcclxuICAgICAgICAkKGVsKS5lbXB0eSgpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksMSk7XHJcbiAgICAgICAgbGV0IHBpY3NUb1VzZSA9IGNhcmRHYW1lLnJhbmRQaWNzO1xyXG4gICAgICAgIGxldCBjbGFzc051bSA9IHJhbmRDbGFzcy50b1N0cmluZygpO1xyXG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XHJcbiAgICAgICAgbGV0IHJhbmRQaWMgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBwaWNzVG9Vc2UubGVuZ3RoKTtcclxuICAgICAgICBsZXQgcGljU3RyaW5nID0gcGljc1RvVXNlLnNwbGljZShyYW5kUGljLCAxKTtcclxuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xyXG4gICAgICAgICQoZWwpLmFkZENsYXNzKGNsYXNzTmFtZSk7XHJcbiAgICB9KTtcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59XHJcblxyXG5jYXJkR2FtZS5nYW1lRnggPSAoY3VycmVudCwgcHJldikgPT4ge1xyXG4gICAgbGV0IGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIlwiO1xyXG4gICAgY3VycmVudERvZ1BpY3NDbGFzcyA9IGN1cnJlbnQuY2hpbGRyZW4oXCIuY2FyZF9fZnJvbnRcIikuYXR0cignY2xhc3MnKTtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZShcImNhcmRfX2Zyb250IFwiLCBcIlwiKTtcclxuICAgIGxldCBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IFwiXCI7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IHByZXYuY2hpbGRyZW4oXCIuY2FyZF9fZnJvbnRcIikuYXR0cignY2xhc3MnKTtcclxuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gXCIuXCIgKyBwcmV2aW91c0RvZ1BpY3NDbGFzcy5yZXBsYWNlKFwiY2FyZF9fZnJvbnQgXCIsIFwiXCIpO1xyXG4gICAgY29uc29sZS5sb2coJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSk7XHJcbiAgICBjb25zb2xlLmxvZyhcIlZTLlwiKTtcclxuICAgIGNvbnNvbGUubG9nKCQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKTtcclxuICAgIFxyXG4gICAgLy8gJCgnLmNhcmQnKS5vZmYoJ2NsaWNrJyk7XHJcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcclxuICAgICAgICBjdXJyZW50LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIHByZXYuYWRkQ2xhc3MoJ21hdGNoJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ21hdGNoIGZvdW5kJyk7XHJcbiAgICB9XHJcbiAgICAgc2V0VGltZW91dCggKCkgPT4geyBcclxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgcHJldi5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XHJcbiAgICAgfSw2MDApO1xyXG4gICBcclxuXHJcblxyXG5cclxuXHJcbiAgICAvLyAgICBpZiAoJCgnJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQoJycpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XHJcbiAgICAvLyAgICAgICAgXHJcbiAgICAvLyAgICB9XHJcbn1cclxuXHJcblxyXG5cclxuXHJcblxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcblxyXG5cclxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcclxuICAgIGNhcmRHYW1lLmV2ZW50cygpO1xyXG59O1xyXG5cclxuJCgoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5pbml0KCk7XHJcbn0pO1xyXG5cclxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXHJcbi8vIDIuIExlYWRlcmJvYXJkIHNvcnRlZCBieSBsb3dlc3QgdGltZSBhdCB0aGUgdG9wIHdpdGggdXNlcm5hbWVcclxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcclxuIl19
