'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';
cardGame.dogPics = [];
cardGame.randPics = [];
cardGame.timer = 0;
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

            if (cardGame.gameStart) {
                console.log("timer");
                var timeString = "";
                var secondsString = "";
                var subSecondsString = "";
                var minutes = void 0;
                var seconds = void 0;
                var subSeconds = void 0;

                setInterval(function () {
                    cardGame.timer++;
                    subSeconds = cardGame.timer % 100;
                    subSecondsString = subSeconds.toString();
                    seconds = Math.floor(cardGame.timer / 100) % 60;
                    minutes = cardGame.timer / 100 / 60 % 60;
                    if (seconds <= 9) {
                        secondsString = "0" + seconds.toString();
                    } else {
                        secondsString = seconds.toString();
                    }

                    minutesString = Math.floor(minutes).toString();
                    timeString = minutesString + ':' + secondsString + '.' + subSeconds;
                    $("#time").text(timeString);
                }, 10);
            }
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJkb2dQaWNzIiwicmFuZFBpY3MiLCJ0aW1lciIsImdhbWVTdGFydCIsInByZXZpb3VzIiwiY2xpY2tBbGxvd2VkIiwiZ2V0Q29udGVudCIsIiQiLCJhamF4IiwidXJsIiwibWV0aG9kIiwiZGF0YVR5cGUiLCJkYXRhIiwibG9jYXRpb24iLCJhbmltYWwiLCJmb3JtYXQiLCJjYWxsYmFjayIsInRoZW4iLCJyZXMiLCJwZXREYXRhIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImZvckVhY2giLCJkb2ciLCJwdXNoIiwibWVkaWEiLCJwaG90b3MiLCJwaG90byIsImkiLCJyYW5kb21QaWNrIiwiTWF0aCIsImZsb29yIiwicmFuZG9tIiwibGVuZ3RoIiwicGljIiwiZGlzcGxheUNvbnRlbnQiLCJldmVudHMiLCJvbiIsInN3YWwiLCJ0aXRsZSIsInRleHQiLCJpbWFnZVVybCIsIm1hdGNoR2FtZSIsImNvdW50ZXIiLCJjdXJyZW50IiwiZSIsInByZXZlbnREZWZhdWx0Iiwic3RvcFByb3BhZ2F0aW9uIiwiY29uc29sZSIsImxvZyIsInRpbWVTdHJpbmciLCJzZWNvbmRzU3RyaW5nIiwic3ViU2Vjb25kc1N0cmluZyIsIm1pbnV0ZXMiLCJzZWNvbmRzIiwic3ViU2Vjb25kcyIsInNldEludGVydmFsIiwidG9TdHJpbmciLCJtaW51dGVzU3RyaW5nIiwiYyIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImFkZCIsImdhbWVGeCIsInBpY2tBcnJheSIsImVhY2giLCJlbCIsImVtcHR5IiwicmFuZENsYXNzIiwic3BsaWNlIiwicGljc1RvVXNlIiwiY2xhc3NOdW0iLCJjbGFzc05hbWUiLCJyYW5kUGljIiwicGljU3RyaW5nIiwiYXR0ciIsImFkZENsYXNzIiwicHJldiIsImN1cnJlbnREb2dQaWNzQ2xhc3MiLCJjaGlsZHJlbiIsInJlcGxhY2UiLCJwcmV2aW91c0Rv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QVF5QyxXQUFSLENBQW9CLFNBQXBCO0FBQ0FQLGFBQUtPLFdBQUwsQ0FBaUIsU0FBakI7QUFDQXhGLGlCQUFTTyxZQUFULEdBQXdCLElBQXhCO0FBQ0YsS0FKRCxFQUlFLEdBSkY7QUFLSixDQXRCRDtBQXVCQTs7QUFFQVAsU0FBU3lGLElBQVQsR0FBZ0IsWUFBTTtBQUNsQnpGLGFBQVN1QyxNQUFUO0FBQ0gsQ0FGRDs7QUFJQTlCLEVBQUUsWUFBTTtBQUNKVCxhQUFTeUYsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5jYXJkR2FtZS5kb2dQaWNzID0gW107XHJcbmNhcmRHYW1lLnJhbmRQaWNzID0gW107XHJcbmNhcmRHYW1lLnRpbWVyID0gMDtcclxuY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gZmFsc2U7XHJcbmNhcmRHYW1lLnByZXZpb3VzID0gXCJcIjtcclxuY2FyZEdhbWUuY2xpY2tBbGxvd2VkID0gdHJ1ZTtcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG5cclxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kYCxcclxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxyXG4gICAgICAgIGRhdGFUeXBlOiAnanNvbnAnLFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAga2V5OiBjYXJkR2FtZS5rZXksXHJcbiAgICAgICAgICAgIGxvY2F0aW9uOiAnVG9yb250bywgT24nLFxyXG4gICAgICAgICAgICBhbmltYWw6ICdkb2cnLFxyXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IFwiP1wiXHJcbiAgICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XHJcbiAgICAgICAgbGV0IHBldERhdGEgPSByZXMucGV0ZmluZGVyLnBldHMucGV0O1xyXG5cclxuICAgICAgICBwZXREYXRhLmZvckVhY2goKGRvZykgPT4ge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5kb2dQaWNzLnB1c2goZG9nLm1lZGlhLnBob3Rvcy5waG90b1syXVtcIiR0XCJdKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcclxuICAgICAgICAgICAgbGV0IHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgIGNhcmRHYW1lLnJhbmRQaWNzLmZvckVhY2goKHBpYykgPT4ge1xyXG4gICAgICAgICAgICAgICAgd2hpbGUgKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10gPT09IHBpYykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJhbmRvbVBpY2sgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5kb2dQaWNzLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5yYW5kUGljcy5wdXNoKGNhcmRHYW1lLmRvZ1BpY3NbcmFuZG9tUGlja10pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXJkR2FtZS5kaXNwbGF5Q29udGVudCgpO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLmV2ZW50cyA9ICgpID0+IHtcclxuICAgICQoJy5zdGFydEJ0bicpLm9uKCdjbGljaycsICgpID0+IHtcclxuICAgICAgICBzd2FsKHtcclxuICAgICAgICAgICAgdGl0bGU6IFwiU3dlZXQhXCIsXHJcbiAgICAgICAgICAgIHRleHQ6IFwiTG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQsIGNvbnNlY3RldHVyIGFkaXBpc2ljaW5nIGVsaXQuIERpZ25pc3NpbW9zIGFyY2hpdGVjdG8gcXVhZXJhdCBvbW5pcyBtaW51cyBleGNlcHR1cmkgdXQgcHJhZXNlbnRpdW0sIHNvbHV0YSBsYXVkYW50aXVtIHBlcnNwaWNpYXRpcyBpbnZlbnRvcmU/IEVhIGFzc3VtZW5kYSB0ZW1wb3JlIG5hdHVzIGR1Y2ltdXMgaXBzdW0gbGF1ZGFudGl1bSBvZmZpY2lpcywgZW5pbSB2b2x1cHRhcy5cIixcclxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaHR0cHM6Ly9pLnBpbmltZy5jb20vNzM2eC9mMi80MS80Ni9mMjQxNDYwOTZkMmY4N2UzMTc0NWExODJmZjM5NWIxMC0tcHVnLWNhcnRvb24tYXJ0LWlkZWFzLmpwZ1wiXHJcbiAgICAgICAgfSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xyXG4gICAgbGV0IGNvdW50ZXIgPSAwO1xyXG4gICAgY2FyZEdhbWUucHJldmlvdXMgPSAnJztcclxuICAgIGxldCBjdXJyZW50ID0gJyc7XHJcbiAgICBpZiAoY2FyZEdhbWUuY2xpY2tBbGxvd2VkKXtcclxuICAgICAgICAkKCcuY2FyZCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgY2FyZEdhbWUuZ2FtZVN0YXJ0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgY291bnRlcisrO1xyXG5cclxuICAgICAgICAgICAgaWYgKGNhcmRHYW1lLmdhbWVTdGFydCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJ0aW1lclwiKTtcclxuICAgICAgICAgICAgICAgIGxldCB0aW1lU3RyaW5nID0gXCJcIlxyXG4gICAgICAgICAgICAgICAgbGV0IHNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IHN1YlNlY29uZHNTdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgbGV0IG1pbnV0ZXM7XHJcbiAgICAgICAgICAgICAgICBsZXQgc2Vjb25kcztcclxuICAgICAgICAgICAgICAgIGxldCBzdWJTZWNvbmRzO1xyXG5cclxuICAgICAgICAgICAgICAgIHNldEludGVydmFsKCgpPT57XHJcbiAgICAgICAgICAgICAgICAgICAgY2FyZEdhbWUudGltZXIrKzsgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgc3ViU2Vjb25kcyA9IGNhcmRHYW1lLnRpbWVyJTEwMDtcclxuICAgICAgICAgICAgICAgICAgICBzdWJTZWNvbmRzU3RyaW5nID0gc3ViU2Vjb25kcy50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHNlY29uZHMgPSBNYXRoLmZsb29yKGNhcmRHYW1lLnRpbWVyLzEwMCklNjA7XHJcbiAgICAgICAgICAgICAgICAgICAgbWludXRlcyA9ICgoY2FyZEdhbWUudGltZXIvMTAwKS82MCklNjA7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlY29uZHM8PTkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2Vjb25kc1N0cmluZyA9XCIwXCIgKyBzZWNvbmRzLnRvU3RyaW5nKCk7ICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmRzU3RyaW5nID1zZWNvbmRzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICBtaW51dGVzU3RyaW5nID0gTWF0aC5mbG9vcihtaW51dGVzKS50b1N0cmluZygpO1xyXG4gICAgICAgICAgICAgICAgICAgIHRpbWVTdHJpbmcgPSBgJHttaW51dGVzU3RyaW5nfToke3NlY29uZHNTdHJpbmd9LiR7c3ViU2Vjb25kc31gICAgIFxyXG4gICAgICAgICAgICAgICAgICAgICQoXCIjdGltZVwiKS50ZXh0KHRpbWVTdHJpbmcpO1xyXG4gICAgICAgICAgICAgICAgfSwgMTApO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcclxuICAgICAgICAgICAgaWYgKCFjLmNvbnRhaW5zKCdmbGlwcGVkJykpIHtcclxuICAgICAgICAgICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcblxyXG4gICAgICAgICAgICAgaWYgKGNvdW50ZXIgPj0gMikge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLmNsaWNrQWxsb3dlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhcmRHYW1lLmdhbWVGeCgkKHRoaXMpLCBjYXJkR2FtZS5wcmV2aW91cyk7XHJcbiAgICAgICAgICAgICAgICAgICAgY291bnRlciA9IDA7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGNvdW50ZXIgPT09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXJkR2FtZS5wcmV2aW91cyA9ICQodGhpcyk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvdW50ZXIgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgbGV0IHBpY2tBcnJheSA9IFtdO1xyXG4gICAgZm9yIChsZXQgaT0xOyBpPD0xNjsgaSsrKXtcclxuICAgICAgICBwaWNrQXJyYXkucHVzaChpKTtcclxuICAgIH1cclxuICAgICQoJy5jYXJkX19mcm9udCcpLmVhY2goKGksIGVsKSA9PiB7XHJcbiAgICAgICAgJChlbCkuZW1wdHkoKTtcclxuICAgICAgICBcclxuICAgICAgICBsZXQgcmFuZENsYXNzID0gcGlja0FycmF5LnNwbGljZShNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjYXJkR2FtZS5yYW5kUGljcy5sZW5ndGgpLDEpO1xyXG4gICAgICAgIGxldCBwaWNzVG9Vc2UgPSBjYXJkR2FtZS5yYW5kUGljcztcclxuICAgICAgICBsZXQgY2xhc3NOdW0gPSByYW5kQ2xhc3MudG9TdHJpbmcoKTtcclxuICAgICAgICBsZXQgY2xhc3NOYW1lID0gYGRvZ1BpY3Mke3JhbmRDbGFzc31gO1xyXG4gICAgICAgIGxldCByYW5kUGljID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogcGljc1RvVXNlLmxlbmd0aCk7XHJcbiAgICAgICAgbGV0IHBpY1N0cmluZyA9IHBpY3NUb1VzZS5zcGxpY2UocmFuZFBpYywgMSk7XHJcbiAgICAgICAgJChlbCkuYXR0cignc3R5bGUnLCBgYmFja2dyb3VuZC1pbWFnZTogdXJsKCR7cGljU3RyaW5nWzBdfSlgKTtcclxuICAgICAgICAkKGVsKS5hZGRDbGFzcyhjbGFzc05hbWUpO1xyXG4gICAgfSk7XHJcbiAgICBjYXJkR2FtZS5tYXRjaEdhbWUoKTtcclxufVxyXG5cclxuY2FyZEdhbWUuZ2FtZUZ4ID0gKGN1cnJlbnQsIHByZXYpID0+IHtcclxuICAgIGxldCBjdXJyZW50RG9nUGljc0NsYXNzID0gXCJcIjtcclxuICAgIGN1cnJlbnREb2dQaWNzQ2xhc3MgPSBjdXJyZW50LmNoaWxkcmVuKFwiLmNhcmRfX2Zyb250XCIpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBjdXJyZW50RG9nUGljc0NsYXNzID0gXCIuXCIgKyBjdXJyZW50RG9nUGljc0NsYXNzLnJlcGxhY2UoXCJjYXJkX19mcm9udCBcIiwgXCJcIik7XHJcbiAgICBsZXQgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBcIlwiO1xyXG4gICAgcHJldmlvdXNEb2dQaWNzQ2xhc3MgPSBwcmV2LmNoaWxkcmVuKFwiLmNhcmRfX2Zyb250XCIpLmF0dHIoJ2NsYXNzJyk7XHJcbiAgICBwcmV2aW91c0RvZ1BpY3NDbGFzcyA9IFwiLlwiICsgcHJldmlvdXNEb2dQaWNzQ2xhc3MucmVwbGFjZShcImNhcmRfX2Zyb250IFwiLCBcIlwiKTtcclxuICAgIGNvbnNvbGUubG9nKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykpO1xyXG4gICAgY29uc29sZS5sb2coXCJWUy5cIik7XHJcbiAgICBjb25zb2xlLmxvZygkKHByZXZpb3VzRG9nUGljc0NsYXNzKS5jc3MoJ2JhY2tncm91bmQtaW1hZ2UnKSk7XHJcbiAgICBcclxuICAgIC8vICQoJy5jYXJkJykub2ZmKCdjbGljaycpO1xyXG4gICAgaWYgKCQoY3VycmVudERvZ1BpY3NDbGFzcykuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykgPT09ICQocHJldmlvdXNEb2dQaWNzQ2xhc3MpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpKSB7XHJcbiAgICAgICAgY3VycmVudC5hZGRDbGFzcygnbWF0Y2gnKTtcclxuICAgICAgICBwcmV2LmFkZENsYXNzKCdtYXRjaCcpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCBmb3VuZCcpO1xyXG4gICAgfVxyXG4gICAgIHNldFRpbWVvdXQoICgpID0+IHsgXHJcbiAgICAgICAgY3VycmVudC5yZW1vdmVDbGFzcygnZmxpcHBlZCcpO1xyXG4gICAgICAgIHByZXYucmVtb3ZlQ2xhc3MoJ2ZsaXBwZWQnKTtcclxuICAgICAgICBjYXJkR2FtZS5jbGlja0FsbG93ZWQgPSB0cnVlO1xyXG4gICAgIH0sNjAwKTtcclxufVxyXG4vLyAgICAzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC5cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxufTtcclxuXHJcbiQoKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuaW5pdCgpO1xyXG59KTtcclxuXHJcbi8vLS0tLS0tLS0tLS0tLS0tLUIgTyBOIFUgUy0tLS0tLS0tLS0tLS0tLS0tLS0tXHJcbi8vIDEuIFVzZXIgZW50ZXJzIHVzZXJuYW1lIGZvciBsZWFkZXJib2FyZFxyXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXHJcbi8vIDMuIENvdW50IG51bWJlciBvZiB0cmllcyBhbmQgZGlzcGxheSBhdCB0aGUgZW5kXHJcbiJdfQ==
