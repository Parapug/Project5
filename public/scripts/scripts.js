'use strict';

var cardGame = {};
cardGame.key = '6cc621452cadd6d6f867f4435723803f';

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
    });
};

cardGame.events = function () {
    $('.startBtn').on('click', function () {
        console.log('hi');
        return swal({
            title: "Sweet!",
            text: "Here's a custom image.",
            imageUrl: "images/thumbs-up.jpg"
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

cardGame.displayContent = function () {};

cardGame.init = function () {
    cardGame.events();
    cardGame.getContent();
    cardGame.matchGame();
};

$(function () {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJlIiwiYyIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInJlbW92ZSIsImFkZCIsImRpc3BsYXlDb250ZW50IiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUQsU0FBU0UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRlAsaUJBQUtELFNBQVNDLEdBRFo7QUFFRlEsc0JBQVUsYUFGUjtBQUdGQyxvQkFBUSxLQUhOO0FBSUZDLG9CQUFRLE1BSk47QUFLRkMsc0JBQVU7QUFMUjtBQUpILEtBQVAsRUFXR0MsSUFYSCxDQVdRLFVBQVVDLEdBQVYsRUFBZTtBQUNuQkMsZ0JBQVFDLEdBQVIsQ0FBWUYsSUFBSUcsU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUEvQjtBQUNILEtBYkQ7QUFjSCxDQWZEOztBQWlCQW5CLFNBQVNvQixNQUFULEdBQWtCLFlBQU07QUFDcEJqQixNQUFFLFdBQUYsRUFBZWtCLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsWUFBTTtBQUM3Qk4sZ0JBQVFDLEdBQVIsQ0FBWSxJQUFaO0FBQ0EsZUFBT00sS0FBSztBQUNSQyxtQkFBTyxRQURDO0FBRVJDLGtCQUFNLHdCQUZFO0FBR1JDLHNCQUFVO0FBSEYsU0FBTCxDQUFQO0FBS0gsS0FQRDtBQVFILENBVEQ7O0FBV0F6QixTQUFTMEIsU0FBVCxHQUFxQixZQUFNO0FBQzNCdkIsTUFBRSxPQUFGLEVBQVdrQixFQUFYLENBQWMsT0FBZCxFQUF1QixVQUFDTSxDQUFELEVBQU87QUFDdEIsWUFBSUMsSUFBSUQsRUFBRUUsYUFBRixDQUFnQkMsU0FBeEI7QUFDQSxZQUFJRixFQUFFRyxRQUFGLENBQVcsU0FBWCxNQUEwQixJQUE5QixFQUFvQztBQUNoQ0gsY0FBRUksTUFBRixDQUFTLFNBQVQ7QUFDSCxTQUZELE1BRVE7QUFDSkosY0FBRUssR0FBRixDQUFNLFNBQU47QUFDSDtBQUNKLEtBUEw7QUFRQyxDQVREOztBQVdBakMsU0FBU2tDLGNBQVQsR0FBMEIsWUFBTSxDQUUvQixDQUZEOztBQUlBbEMsU0FBU21DLElBQVQsR0FBZ0IsWUFBTTtBQUNsQm5DLGFBQVNvQixNQUFUO0FBQ0FwQixhQUFTRSxVQUFUO0FBQ0FGLGFBQVMwQixTQUFUO0FBQ0gsQ0FKRDs7QUFNQXZCLEVBQUUsWUFBSztBQUNISCxhQUFTbUMsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcblxuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2Vcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXG4vLyBHYW1lIGJvYXJkIGxvYWRzIHdpdGggNHg0IGxheW91dCwgY2FyZHMgZmFjZSBkb3duXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXG4vLyBcdFx0Mi4gT24gY2xpY2sgb2YgYSBzZWNvbmQgY2FyZCwgaXQgYWxzbyBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2Vcbi8vIFx0XHQzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXG4vLyBcdFx0NS4gUG9wdXAgYm94IGNvbmdyYXR1bGF0aW5nIHRoZSBwbGF5ZXIgd2l0aCB0aGVpciB0aW1lLiBSZXN0YXJ0IGJ1dHRvbiBpZiB0aGUgdXNlciB3aXNoZXMgdG8gcGxheSBhZ2Fpbi5cblxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxuICAgICAgICBtZXRob2Q6ICdHRVQnLFxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAga2V5OiBjYXJkR2FtZS5rZXksXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXG4gICAgICAgICAgICBmb3JtYXQ6ICdqc29uJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiBcIj9cIlxuICAgICAgICB9XG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5wZXRmaW5kZXIucGV0cy5wZXQpO1xuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XG4gICAgJCgnLnN0YXJ0QnRuJykub24oJ2NsaWNrJywgKCkgPT4ge1xuICAgICAgICBjb25zb2xlLmxvZygnaGknKVxuICAgICAgICByZXR1cm4gc3dhbCh7XG4gICAgICAgICAgICB0aXRsZTogXCJTd2VldCFcIixcbiAgICAgICAgICAgIHRleHQ6IFwiSGVyZSdzIGEgY3VzdG9tIGltYWdlLlwiLFxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaW1hZ2VzL3RodW1icy11cC5qcGdcIlxuICAgICAgICB9KTtcbiAgICB9KTtcbn1cblxuY2FyZEdhbWUubWF0Y2hHYW1lID0gKCkgPT4ge1xuJCgnLmNhcmQnKS5vbignY2xpY2snLCAoZSkgPT4ge1xuICAgICAgICBsZXQgYyA9IGUuY3VycmVudFRhcmdldC5jbGFzc0xpc3Q7XG4gICAgICAgIGlmIChjLmNvbnRhaW5zKCdmbGlwcGVkJykgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGMucmVtb3ZlKCdmbGlwcGVkJyk7XG4gICAgICAgIH0gIGVsc2Uge1xuICAgICAgICAgICAgYy5hZGQoJ2ZsaXBwZWQnKTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5jYXJkR2FtZS5kaXNwbGF5Q29udGVudCA9ICgpID0+IHtcbiAgICBcbn1cblxuY2FyZEdhbWUuaW5pdCA9ICgpID0+IHtcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcbiAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XG4gICAgY2FyZEdhbWUubWF0Y2hHYW1lKCk7XG59O1xuXG4kKCgpID0+e1xuICAgIGNhcmRHYW1lLmluaXQoKTtcbn0pO1xuXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxuLy8gMS4gVXNlciBlbnRlcnMgdXNlcm5hbWUgZm9yIGxlYWRlcmJvYXJkXG4vLyAyLiBMZWFkZXJib2FyZCBzb3J0ZWQgYnkgbG93ZXN0IHRpbWUgYXQgdGhlIHRvcCB3aXRoIHVzZXJuYW1lXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZFxuIl19
