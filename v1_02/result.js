function o(i) {
	switch(i) {
		case 0: return '1st';
		case 1: return '2nd';
		case 2: return '3rd';
		case 3: return '4th';
	}
}

var info = decodeURIComponent(location.search.substr(1)).split('&');
var numOfPlayers = info[1]

var lines = document.querySelector('tbody')
for (var i = 0; i < numOfPlayers; i++) {
	lines.innerHTML += 
		`<tr class="result__line-color-${i % 2}">
			<td><img src="images/${o(i)}-place.png"></td>
			<td class="result__player-name">${info[2 + 2 * i]}</td>
			<td>${info[3 + 2 * i]}</td>
		</tr>`
}