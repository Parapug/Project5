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
        url: 'http://api.petfinder.com/pet.find?format=json&key=' + cardGame.key + '&callback=?',
        method: 'GET',
        dataType: 'jsonp',
        data: {
            key: cardGame.key,
            location: 'Toronto, On',
            animal: 'dog',
            format: 'json'
        }
    }).then(function (res) {
        console.log(res.petfinder.pets.pet);
    });
};
cardGame.displayContent = function () {};

cardGame.events = function () {};

cardGame.init = function () {
    cardGame.events();
    cardGame.getContent();
};

$(function () {
    cardGame.init();
});

//----------------B O N U S--------------------
// 1. User enters username for leaderboard
// 2. Leaderboard sorted by lowest time at the top with username
// 3. Count number of tries and display at the end
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdHMuanMiXSwibmFtZXMiOlsiY2FyZEdhbWUiLCJrZXkiLCJnZXRDb250ZW50IiwiJCIsImFqYXgiLCJ1cmwiLCJtZXRob2QiLCJkYXRhVHlwZSIsImRhdGEiLCJsb2NhdGlvbiIsImFuaW1hbCIsImZvcm1hdCIsInRoZW4iLCJyZXMiLCJjb25zb2xlIiwibG9nIiwicGV0ZmluZGVyIiwicGV0cyIsInBldCIsImRpc3BsYXlDb250ZW50IiwiZXZlbnRzIiwiaW5pdCJdLCJtYXBwaW5ncyI6Ijs7QUFBQSxJQUFJQSxXQUFXLEVBQWY7QUFDQUEsU0FBU0MsR0FBVCxHQUFlLGtDQUFmOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQUQsU0FBU0UsVUFBVCxHQUFzQixZQUFNO0FBQ3hCQyxNQUFFQyxJQUFGLENBQU87QUFDSEMsb0VBQTBETCxTQUFTQyxHQUFuRSxnQkFERztBQUVISyxnQkFBUSxLQUZMO0FBR0hDLGtCQUFVLE9BSFA7QUFJSEMsY0FBTTtBQUNGUCxpQkFBS0QsU0FBU0MsR0FEWjtBQUVGUSxzQkFBVSxhQUZSO0FBR0ZDLG9CQUFRLEtBSE47QUFJRkMsb0JBQVE7QUFKTjtBQUpILEtBQVAsRUFVR0MsSUFWSCxDQVVRLFVBQVNDLEdBQVQsRUFBYztBQUNsQkMsZ0JBQVFDLEdBQVIsQ0FBWUYsSUFBSUcsU0FBSixDQUFjQyxJQUFkLENBQW1CQyxHQUEvQjtBQUNILEtBWkQ7QUFhSCxDQWREO0FBZUFsQixTQUFTbUIsY0FBVCxHQUEwQixZQUFNLENBRS9CLENBRkQ7O0FBSUFuQixTQUFTb0IsTUFBVCxHQUFrQixZQUFNLENBRXZCLENBRkQ7O0FBSUFwQixTQUFTcUIsSUFBVCxHQUFnQixZQUFNO0FBQ2xCckIsYUFBU29CLE1BQVQ7QUFDQXBCLGFBQVNFLFVBQVQ7QUFDSCxDQUhEOztBQUtBQyxFQUFFLFlBQU07QUFDSkgsYUFBU3FCLElBQVQ7QUFDSCxDQUZEOztBQUlBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNjcmlwdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2FyZEdhbWUgPSB7fTtcclxuY2FyZEdhbWUua2V5ID0gJzZjYzYyMTQ1MmNhZGQ2ZDZmODY3ZjQ0MzU3MjM4MDNmJztcclxuXHJcbi8vIFVzZXIgc2hvdWxkIHByZXNzICdTdGFydCcsIGZhZGVJbiBpbnN0cnVjdGlvbnMgb24gdG9wIHdpdGggYW4gXCJ4XCIgdG8gY2xvc2UgYW5kIGEgYnV0dG9uIGNsb3NlXHJcbi8vIExvYWRpbmcgc2NyZWVuLCBpZiBuZWVkZWQsIHdoaWxlIEFKQVggY2FsbHMgcmVxdWVzdCBwaWNzIG9mIGRvZ2VzXHJcbi8vIEdhbWUgYm9hcmQgbG9hZHMgd2l0aCA0eDQgbGF5b3V0LCBjYXJkcyBmYWNlIGRvd25cclxuLy8gVGltZXIgc3RhcnRzIHdoZW4gYSBjYXJkIGlzIGZsaXBwZWRcclxuLy8gXHRcdDEuIE9uIGNsaWNrIG9mIGEgY2FyZCwgaXQgZmxpcHMgYW5kIHJldmVhbHMgYSBkb2dlXHJcbi8vIFx0XHQyLiBPbiBjbGljayBvZiBhIHNlY29uZCBjYXJkLCBpdCBhbHNvIGZsaXBzIGFuZCByZXZlYWxzIGEgZG9nZVxyXG4vLyBcdFx0My4gQ29tcGFyZSB0aGUgcGljdHVyZXMgKGFrYSB0aGUgdmFsdWUgb3IgaWQpIGFuZCBpZiBlcXVhbCwgdGhlbiBtYXRjaCA9IHRydWUsIGVsc2UgZmxpcCB0aGVtIGJhY2sgb3Zlci4gSWYgbWF0Y2ggPSB0cnVlLCBjYXJkcyBzdGF5IGZsaXBwZWQuIENvdW50ZXIgZm9yICMgb2YgbWF0Y2hlcyBpbmNyZWFzZSBieSAxLlxyXG4vLyBcdFx0NC4gT25jZSB0aGUgIyBvZiBtYXRjaGVzID0gOCwgdGhlbiB0aGUgdGltZXIgc3RvcHMgYW5kIHRoZSBnYW1lIGlzIG92ZXIuXHJcbi8vIFx0XHQ1LiBQb3B1cCBib3ggY29uZ3JhdHVsYXRpbmcgdGhlIHBsYXllciB3aXRoIHRoZWlyIHRpbWUuIFJlc3RhcnQgYnV0dG9uIGlmIHRoZSB1c2VyIHdpc2hlcyB0byBwbGF5IGFnYWluLlxyXG5cclxuY2FyZEdhbWUuZ2V0Q29udGVudCA9ICgpID0+IHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgICAgdXJsOiBgaHR0cDovL2FwaS5wZXRmaW5kZXIuY29tL3BldC5maW5kP2Zvcm1hdD1qc29uJmtleT0ke2NhcmRHYW1lLmtleX0mY2FsbGJhY2s9P2AsXHJcbiAgICAgICAgbWV0aG9kOiAnR0VUJyxcclxuICAgICAgICBkYXRhVHlwZTogJ2pzb25wJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGtleTogY2FyZEdhbWUua2V5LFxyXG4gICAgICAgICAgICBsb2NhdGlvbjogJ1Rvcm9udG8sIE9uJyxcclxuICAgICAgICAgICAgYW5pbWFsOiAnZG9nJyxcclxuICAgICAgICAgICAgZm9ybWF0OiAnanNvbidcclxuICAgICAgICB9XHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5wZXRmaW5kZXIucGV0cy5wZXQpO1xyXG4gICAgfSk7XHJcbn1cclxuY2FyZEdhbWUuZGlzcGxheUNvbnRlbnQgPSAoKSA9PiB7XHJcblxyXG59XHJcblxyXG5jYXJkR2FtZS5ldmVudHMgPSAoKSA9PiB7XHJcblxyXG59XHJcblxyXG5jYXJkR2FtZS5pbml0ID0gKCkgPT4ge1xyXG4gICAgY2FyZEdhbWUuZXZlbnRzKCk7XHJcbiAgICBjYXJkR2FtZS5nZXRDb250ZW50KCk7XHJcbn07XHJcblxyXG4kKCgpID0+IHtcclxuICAgIGNhcmRHYW1lLmluaXQoKTtcclxufSk7XHJcblxyXG4vLy0tLS0tLS0tLS0tLS0tLS1CIE8gTiBVIFMtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG4vLyAxLiBVc2VyIGVudGVycyB1c2VybmFtZSBmb3IgbGVhZGVyYm9hcmRcclxuLy8gMi4gTGVhZGVyYm9hcmQgc29ydGVkIGJ5IGxvd2VzdCB0aW1lIGF0IHRoZSB0b3Agd2l0aCB1c2VybmFtZVxyXG4vLyAzLiBDb3VudCBudW1iZXIgb2YgdHJpZXMgYW5kIGRpc3BsYXkgYXQgdGhlIGVuZCJdfQ==
