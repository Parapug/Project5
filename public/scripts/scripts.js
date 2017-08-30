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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsImNhbGxiYWNrIiwidGhlbiIsInJlcyIsImNvbnNvbGUiLCJsb2ciLCJwZXRmaW5kZXIiLCJwZXRzIiwicGV0IiwiZXZlbnRzIiwib24iLCJzd2FsIiwidGl0bGUiLCJ0ZXh0IiwiaW1hZ2VVcmwiLCJtYXRjaEdhbWUiLCJlIiwiYyIsImN1cnJlbnRUYXJnZXQiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsInJlbW92ZSIsImFkZCIsImRpc3BsYXlDb250ZW50IiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUQsU0FBU0UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsZ0RBREc7QUFFSEMsZ0JBQVEsS0FGTDtBQUdIQyxrQkFBVSxPQUhQO0FBSUhDLGNBQU07QUFDRlAsaUJBQUtELFNBQVNDLEdBRFo7QUFFRlEsc0JBQVUsYUFGUjtBQUdGQyxvQkFBUSxLQUhOO0FBSUZDLG9CQUFRLE1BSk47QUFLRkMsc0JBQVU7QUFMUjtBQUpILEtBQVAsRUFXR0MsSUFYSCxDQVdRLFVBQVVDLEdBQVYsRUFBZTtBQUNuQkMsZ0JBQVFDLEdBQVIsQ0FBWUYsSUFBSUcsU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUEvQjtBQUNILEtBYkQ7QUFjSCxDQWZEOztBQWlCQW5CLFNBQVNvQixNQUFULEdBQWtCLFlBQU07QUFDcEJqQixNQUFFLFdBQUYsRUFBZWtCLEVBQWYsQ0FBa0IsT0FBbEIsRUFBMkIsWUFBTTtBQUM3Qk4sZ0JBQVFDLEdBQVIsQ0FBWSxJQUFaO0FBQ0EsZUFBT00sS0FBSztBQUNSQyxtQkFBTyxRQURDO0FBRVJDLGtCQUFNLHdCQUZFO0FBR1JDLHNCQUFVO0FBSEYsU0FBTCxDQUFQO0FBS0gsS0FQRDtBQVFILENBVEQ7O0FBV0F6QixTQUFTMEIsU0FBVCxHQUFxQixZQUFNO0FBQzNCdkIsTUFBRSxPQUFGLEVBQVdrQixFQUFYLENBQWMsT0FBZCxFQUF1QixVQUFDTSxDQUFELEVBQU87QUFDdEIsWUFBSUMsSUFBSUQsRUFBRUUsYUFBRixDQUFnQkMsU0FBeEI7QUFDQSxZQUFJRixFQUFFRyxRQUFGLENBQVcsU0FBWCxNQUEwQixJQUE5QixFQUFvQztBQUNoQ0gsY0FBRUksTUFBRixDQUFTLFNBQVQ7QUFDSCxTQUZELE1BRVE7QUFDSkosY0FBRUssR0FBRixDQUFNLFNBQU47QUFDSDtBQUNKLEtBUEw7QUFRQyxDQVREOztBQVdBakMsU0FBU2tDLGNBQVQsR0FBMEIsWUFBTSxDQUUvQixDQUZEOztBQUlBbEMsU0FBU21DLElBQVQsR0FBZ0IsWUFBTTtBQUNsQm5DLGFBQVNvQixNQUFUO0FBQ0FwQixhQUFTRSxVQUFUO0FBQ0FGLGFBQVMwQixTQUFUO0FBQ0gsQ0FKRDs7QUFNQXZCLEVBQUUsWUFBSztBQUNISCxhQUFTbUMsSUFBVDtBQUNILENBRkQ7O0FBSUE7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoic2NyaXB0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBjYXJkR2FtZSA9IHt9O1xyXG5jYXJkR2FtZS5rZXkgPSAnNmNjNjIxNDUyY2FkZDZkNmY4NjdmNDQzNTcyMzgwM2YnO1xyXG5cclxuLy8gVXNlciBzaG91bGQgcHJlc3MgJ1N0YXJ0JywgZmFkZUluIGluc3RydWN0aW9ucyBvbiB0b3Agd2l0aCBhbiBcInhcIiB0byBjbG9zZSBhbmQgYSBidXR0b24gY2xvc2VcclxuLy8gTG9hZGluZyBzY3JlZW4sIGlmIG5lZWRlZCwgd2hpbGUgQUpBWCBjYWxscyByZXF1ZXN0IHBpY3Mgb2YgZG9nZXNcclxuLy8gR2FtZSBib2FyZCBsb2FkcyB3aXRoIDR4NCBsYXlvdXQsIGNhcmRzIGZhY2UgZG93blxyXG4vLyBUaW1lciBzdGFydHMgd2hlbiBhIGNhcmQgaXMgZmxpcHBlZFxyXG4vLyBcdFx0MS4gT24gY2xpY2sgb2YgYSBjYXJkLCBpdCBmbGlwcyBhbmQgcmV2ZWFscyBhIGRvZ2VcclxuLy8gXHRcdDIuIE9uIGNsaWNrIG9mIGEgc2Vjb25kIGNhcmQsIGl0IGFsc28gZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQzLiBDb21wYXJlIHRoZSBwaWN0dXJlcyAoYWthIHRoZSB2YWx1ZSBvciBpZCkgYW5kIGlmIGVxdWFsLCB0aGVuIG1hdGNoID0gdHJ1ZSwgZWxzZSBmbGlwIHRoZW0gYmFjayBvdmVyLiBJZiBtYXRjaCA9IHRydWUsIGNhcmRzIHN0YXkgZmxpcHBlZC4gQ291bnRlciBmb3IgIyBvZiBtYXRjaGVzIGluY3JlYXNlIGJ5IDEuXHJcbi8vIFx0XHQ0LiBPbmNlIHRoZSAjIG9mIG1hdGNoZXMgPSA4LCB0aGVuIHRoZSB0aW1lciBzdG9wcyBhbmQgdGhlIGdhbWUgaXMgb3Zlci5cclxuLy8gXHRcdDUuIFBvcHVwIGJveCBjb25ncmF0dWxhdGluZyB0aGUgcGxheWVyIHdpdGggdGhlaXIgdGltZS4gUmVzdGFydCBidXR0b24gaWYgdGhlIHVzZXIgd2lzaGVzIHRvIHBsYXkgYWdhaW4uXHJcblxyXG5jYXJkR2FtZS5nZXRDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgICB1cmw6IGBodHRwOi8vYXBpLnBldGZpbmRlci5jb20vcGV0LmZpbmRgLFxyXG4gICAgICAgIG1ldGhvZDogJ0dFVCcsXHJcbiAgICAgICAgZGF0YVR5cGU6ICdqc29ucCcsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBrZXk6IGNhcmRHYW1lLmtleSxcclxuICAgICAgICAgICAgbG9jYXRpb246ICdUb3JvbnRvLCBPbicsXHJcbiAgICAgICAgICAgIGFuaW1hbDogJ2RvZycsXHJcbiAgICAgICAgICAgIGZvcm1hdDogJ2pzb24nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogXCI/XCJcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhyZXMucGV0ZmluZGVyLnBldHMucGV0KTtcclxuICAgIH0pO1xyXG59XHJcblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XHJcbiAgICAkKCcuc3RhcnRCdG4nKS5vbignY2xpY2snLCAoKSA9PiB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2hpJylcclxuICAgICAgICByZXR1cm4gc3dhbCh7XHJcbiAgICAgICAgICAgIHRpdGxlOiBcIlN3ZWV0IVwiLFxyXG4gICAgICAgICAgICB0ZXh0OiBcIkhlcmUncyBhIGN1c3RvbSBpbWFnZS5cIixcclxuICAgICAgICAgICAgaW1hZ2VVcmw6IFwiaW1hZ2VzL3RodW1icy11cC5qcGdcIlxyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLm1hdGNoR2FtZSA9ICgpID0+IHtcclxuJCgnLmNhcmQnKS5vbignY2xpY2snLCAoZSkgPT4ge1xyXG4gICAgICAgIGxldCBjID0gZS5jdXJyZW50VGFyZ2V0LmNsYXNzTGlzdDtcclxuICAgICAgICBpZiAoYy5jb250YWlucygnZmxpcHBlZCcpID09PSB0cnVlKSB7XHJcbiAgICAgICAgICAgIGMucmVtb3ZlKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgfSAgZWxzZSB7XHJcbiAgICAgICAgICAgIGMuYWRkKCdmbGlwcGVkJyk7XHJcbiAgICAgICAgfVxyXG4gICAgfSk7XHJcbn1cclxuXHJcbmNhcmRHYW1lLmRpc3BsYXlDb250ZW50ID0gKCkgPT4ge1xyXG4gICAgXHJcbn1cclxuXHJcbmNhcmRHYW1lLmluaXQgPSAoKSA9PiB7XHJcbiAgICBjYXJkR2FtZS5ldmVudHMoKTtcclxuICAgIGNhcmRHYW1lLmdldENvbnRlbnQoKTtcclxuICAgIGNhcmRHYW1lLm1hdGNoR2FtZSgpO1xyXG59O1xyXG5cclxuJCgoKSA9PntcclxuICAgIGNhcmRHYW1lLmluaXQoKTtcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcclxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxyXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZFxyXG4iXX0=
