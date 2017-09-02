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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJnYW1lU3RhcnQiLCJwcmV2aW91cyIsImNsaWNrQWxsb3dlZCIsImdldENvbnRlbnQiLCIkIiwiYWpheCIsInVybCIsIm1ldGhvZCIsImRhdGFUeXBlIiwiZGF0YSIsImxvY2F0aW9uIiwiYW5pbWFsIiwiZm9ybWF0IiwiY2FsbGJhY2siLCJ0aGVuIiwicmVzIiwicGV0RGF0YSIsInBldGZpbmRlciIsInBldHMiLCJwZXQiLCJmb3JFYWNoIiwiZG9nIiwicHVzaCIsIm1lZGlhIiwicGhvdG9zIiwicGhvdG8iLCJpIiwicmFuZG9tUGljayIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsInBpYyIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJjb3VudGVyIiwiY3VycmVudCIsImUiLCJwcmV2ZW50RGVmYXVsdCIsInN0b3BQcm9wYWdhdGlvbiIsImMiLCJjdXJyZW50VGFyZ2V0IiwiY2xhc3NMaXN0IiwiY29udGFpbnMiLCJhZGQiLCJnYW1lRngiLCJwaWNrQXJyYXkiLCJlYWNoIiwiZWwiLCJlbXB0eSIsInJhbmRDbGFzcyIsInNwbGljZSIsInBpY3NUb1VzZSIsImNsYXNzTnVtIiwidG9TdHJpbmciLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0RvZ1BpY3NDbGFzcyIsImNvbnNvbGUiLCJsb2ciLCJjc3MiLCJzZXRUaW1lb3V0IiwicmVtb3ZlQ2xhc3MiLCJpbml0Il0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVcsRUFBZjtBQUNBQSxTQUFTQyxHQUFULEdBQWUsa0NBQWY7QUFD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YUFBWjtBQUNIO0FBQ0FFLGVBQVksWUFBTTtBQUNmaEMsZ0JBQVFpQyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FULGFBQUtTLFdBQUwsQ0FBaUIsU0FBakI7QUFDQS9FLGlCQUFTTSxZQUFULEdBQXdCLElBQXhCO0FBQ0YsS0FKRCxFQUlFLEdBSkY7O0FBVUQ7QUFDQTtBQUNBO0FBQ0gsQ0E5QkQ7O0FBb0NBOzs7QUFJQU4sU0FBU2dGLElBQVQsR0FBZ0IsWUFBTTtBQUNsQmhGLGFBQVNzQyxNQUFUO0FBQ0gsQ0FGRDs7QUFJQTlCLEVBQUUsWUFBTTtBQUNKUixhQUFTZ0YsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcbmNhcmRHYW1lLmRvZ1BpY3MgPSBbXTtcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XG5jYXJkR2FtZS5nYW1lU3RhcnQgPSBmYWxzZTtcbmNhcmRHYW1lLnByZXZpb3VzID0gXCJcIjtcbmNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IHRydWU7XG5cbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXG4vLyBMb2FkaW5nIHNjcmVlbiwgaWYgbmVlZGVkLCB3aGlsZSBBSkFYIGNhbGxzIHJlcXVlc3QgcGljcyBvZiBkb2dlc1xuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcbi8vIFx0XHQxLiBPbiBjbGljayBvZiBhIGNhcmQsIGl0IGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxuLy8gXHRcdDQuIE9uY2UgdGhlICMgb2YgbWF0Y2hlcyA9IDgsIHRoZW4gdGhlIHRpbWVyIHN0b3BzIGFuZCB0aGUgZ2FtZSBpcyBvdmVyLlxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXG5cbmNhcmRHYW1lLmdldENvbnRlbnQgPSAoKSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbicsXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcbiAgICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICBsZXQgcGV0RGF0YSA9IHJlcy5wZXRmaW5kZXIucGV0cy5wZXQ7XG5cbiAgICAgICAgcGV0RGF0YS5mb3JFYWNoKChkb2cpID0+IHtcbiAgICAgICAgICAgIGNhcmRHYW1lLmRvZ1BpY3MucHVzaChkb2cubWVkaWEucGhvdG9zLnBob3RvWzJdW1wiJHRcIl0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDg7IGkrKykge1xuICAgICAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5mb3JFYWNoKChwaWMpID0+IHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoY2FyZEdhbWUuZG9nUGljc1tyYW5kb21QaWNrXSA9PT0gcGljKSB7XG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xuICAgICAgICAgICAgY2FyZEdhbWUucmFuZFBpY3MucHVzaChjYXJkR2FtZS5kb2dQaWNzW3JhbmRvbVBpY2tdKTtcbiAgICAgICAgfVxuICAgICAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBzd2FsKHtcbiAgICAgICAgICAgIHRpdGxlOiBcIlN3ZWV0IVwiLFxuICAgICAgICAgICAgdGV4dDogXCJMb3JlbSBpcHN1bSBkb2xvciBzaXQgYW1ldCwgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gRGlnbmlzc2ltb3MgYXJjaGl0ZWN0byBxdWFlcmF0IG9tbmlzIG1pbnVzIGV4Y2VwdHVyaSB1dCBwcmFlc2VudGl1bSwgc29sdXRhIGxhdWRhbnRpdW0gcGVyc3BpY2lhdGlzIGludmVudG9yZT8gRWEgYXNzdW1lbmRhIHRlbXBvcmUgbmF0dXMgZHVjaW11cyBpcHN1bSBsYXVkYW50aXVtIG9mZmljaWlzLCBlbmltIHZvbHVwdGFzLlwiLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZ1wiXG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcbiAgICBsZXQgY291bnRlciA9IDA7XG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcbiAgICBsZXQgY3VycmVudCA9ICcnO1xuICAgIGlmIChjYXJkR2FtZS5jbGlja0FsbG93ZWQpe1xuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvdW50ZXIrKztcblxuICAgICAgICAgICAgbGV0IGMgPSBlLmN1cnJlbnRUYXJnZXQuY2xhc3NMaXN0O1xuICAgICAgICAgICAgaWYgKCFjLmNvbnRhaW5zKCdmbGlwcGVkJykpIHtcbiAgICAgICAgICAgICAgICBjLmFkZCgnZmxpcHBlZCcpO1xuICAgICAgICAgICAgICAgIGlmIChjb3VudGVyID49IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGeCgkKHRoaXMpLCBjYXJkR2FtZS5wcmV2aW91cyk7XG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoY291bnRlciA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xuICAgIGxldCBwaWNrQXJyYXkgPSBbXTtcbiAgICBmb3IgKGxldCBpPTE7IGk8PTE2OyBpKyspe1xuICAgICAgICBwaWNrQXJyYXkucHVzaChpKTtcbiAgICB9XG4gICAgJCgnLmNhcmRfX2Zyb250JykuZWFjaCgoaSwgZWwpID0+IHtcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcbiAgICAgICAgXG4gICAgICAgIGxldCByYW5kQ2xhc3MgPSBwaWNrQXJyYXkuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGNhcmRHYW1lLnJhbmRQaWNzLmxlbmd0aCksMSk7XG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcbiAgICAgICAgbGV0IGNsYXNzTnVtID0gcmFuZENsYXNzLnRvU3RyaW5nKCk7XG4gICAgICAgIGxldCBjbGFzc05hbWUgPSBgZG9nUGljcyR7cmFuZENsYXNzfWA7XG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XG4gICAgICAgIGxldCBwaWNTdHJpbmcgPSBwaWNzVG9Vc2Uuc3BsaWNlKHJhbmRQaWMsIDEpO1xuICAgICAgICAkKGVsKS5hdHRyKCdzdHlsZScsIGBiYWNrZ3JvdW5kLWltYWdlOiB1cmwoJHtwaWNTdHJpbmdbMF19KWApO1xuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xuICAgIH0pO1xuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xufVxuXG5jYXJkR2FtZS5nYW1lRnggPSAoY3VycmVudCwgcHJldikgPT4ge1xuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gY3VycmVudC5jaGlsZHJlbihcIi5jYXJkX19mcm9udFwiKS5hdHRyKCdjbGFzcycpO1xuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBcIi5cIiArIGN1cnJlbnREb2dQaWNzQ2xhc3MucmVwbGFjZShcImNhcmRfX2Zyb250IFwiLCBcIlwiKTtcbiAgICBsZXQgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBcIlwiO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gcHJldi5jaGlsZHJlbihcIi5jYXJkX19mcm9udFwiKS5hdHRyKCdjbGFzcycpO1xuICAgIHByZXZpb3VzRG9nUGljc0NsYXNzID0gXCIuXCIgKyBwcmV2aW91c0RvZ1BpY3NDbGFzcy5yZXBsYWNlKFwiY2FyZF9fZnJvbnQgXCIsIFwiXCIpO1xuICAgIGNvbnNvbGUubG9nKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpO1xuICAgIGNvbnNvbGUubG9nKFwiVlMuXCIpO1xuICAgIGNvbnNvbGUubG9nKCQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKTtcbiAgICBcbiAgICAvLyAkKCcuY2FyZCcpLm9mZignY2xpY2snKTtcbiAgICBpZiAoJChjdXJyZW50RG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSA9PT0gJChwcmV2aW91c0RvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpIHtcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgcHJldi5hZGRDbGFzcygnbWF0Y2gnKTtcbiAgICAgICAgY29uc29sZS5sb2coJ21hdGNoIGZvdW5kJyk7XG4gICAgfVxuICAgICBzZXRUaW1lb3V0KCAoKSA9PiB7IFxuICAgICAgICBjdXJyZW50LnJlbW92ZUNsYXNzKCdmbGlwcGVkJyk7XG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcbiAgICAgICAgY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcbiAgICAgfSw2MDApO1xuICAgXG5cblxuXG5cbiAgICAvLyAgICBpZiAoJCgnJykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQoJycpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XG4gICAgLy8gICAgICAgIFxuICAgIC8vICAgIH1cbn1cblxuXG5cblxuXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cblxuXG5cbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XG59O1xuXG4kKCgpID0+IHtcbiAgICBjYXJkR2FtZS5pbml0KCk7XG59KTtcblxuLy8tLS0tLS0tLS0tLS0tLS0tQiBPIE4gVSBTLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxuLy8gMy4gQ291bnQgbnVtYmVyIG9mIHRyaWVzIGFuZCBkaXNwbGF5IGF0IHRoZSBlbmRcbiJdfQ==
