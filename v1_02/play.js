class Question {
	constructor(type = 'none', text = '', answer = '', A = '', B = '', C = '', D = '') {
		this.type = type
		this.text = text
		this.answer = answer
		this.option = [A, B, C, D]
	}
}

const TURNCOLOR = '#f67dcb'
var questions
var isFileInvalid
var numOfPlayers
var players
var turn
var whoseTry
var timer
var currentQuestionId
var numOfMoves
var numOfTries
var numOfNotNoneQuestions
var maxNumOfTurns
var followLinkOnlyWithConsent

function startPlay() {
	questions = []
	for (let i = 0; i < 5; i++) {
		questions.push('')
		for (let j = 0; j < 5; j++) {
			questions.push(new Question())
		}
	}
	isFileInvalid = true
	numOfMoves = 0
	numOfTries = 0
	numOfNotNoneQuestions = 0
	followLinkOnlyWithConsent = false
}

document.querySelector('.play_settings select').addEventListener('change', function() {
	switch(this.value) {
		case '2':
			document.querySelector('.p3').style.display = 'none'
			document.querySelector('.p4').style.display = 'none'
			break
		case '3':
			document.querySelector('.p3').style.display = 'block'
			document.querySelector('.p4').style.display = 'none'
			break
		case '4':
			document.querySelector('.p3').style.display = 'block'
			document.querySelector('.p4').style.display = 'block'
	}
})

function readFile(input) {
	isFileInvalid = true
	let file = input.files[0];
	let reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function() {
		let lines = reader.result.split('\n');
		for (let i = 0; i < 30; i++) {
			if (i % 6 === 0) {
				questions[i] = lines[i]
				continue
			}
			if (lines[i] === 'none') {
				questions[i].type = 'none'
				continue
			}
			numOfNotNoneQuestions++
			let line = lines[i].split('|')
			questions[i].type = line[0]
			questions[i].text = line[1]
			questions[i].answer = line[2]
			questions[i].option[0] = line[3]
			if (questions[i].type === 'open') continue
			questions[i].option[1] = line[4]
			questions[i].option[2] = line[5]
			questions[i].option[3] = line[6]
		}
		isFileInvalid = false
	}

	reader.onerror = function() {
		console.log(reader.error);
	}
}

const confirm$ = document.getElementById('confirm')
confirm$.addEventListener('click', async () => {
	//document.querySelectorAll('select option')
	if (isFileInvalid) {
		alert('Invalid file')
		return
	}
	numOfPlayers = Number(document.querySelector('.play_settings select').value)
	maxNumOfTurns = Math.floor(numOfNotNoneQuestions / numOfPlayers) * numOfPlayers
	if (maxNumOfTurns < 2) {
		alert('Small number of questions')
		return
	}
	if (document.getElementById('player1').value === '') {
		alert('Enter player 1')
		return
	}
	if (document.getElementById('player2').value === '') {
		alert('Enter player 2')
		return
	}
	if ((numOfPlayers === 3 || numOfPlayers === 4) && document.getElementById('player3').value === '')
	{
		alert('Enter player 3')
		return
	}
	if (numOfPlayers === 4 && document.getElementById('player4').value === '')
	{
		alert('Enter player 4')
		return
	}
	document.querySelector('div.play_settings').style.display = 'none'
	document.querySelector('.box').style.display = 'grid'
	//startGame(): createPlayers() + showTable()
	createPlayers()
	showTable()
	followLinkOnlyWithConsent = true
})

function createPlayers() {
	let playerOrder = getRandomOrder(numOfPlayers)
	players = []
	for (var i = 0; i < numOfPlayers; i++) {
		players.push(document.createElement('div'))
		players[i].className = 'player'
		players[i].name = document.getElementById('player' + (1 + playerOrder[i])).value
		document.getElementById('player' + (1 + playerOrder[i])).value = ''
		players[i].scores = 0
		//players[i].id = String(i)
		players[i].innerHTML = `${players[i].name}<p>${players[i].scores}</p>`
		document.getElementById('scores').appendChild(players[i])
	}
	turn = 0
	players[0].style.backgroundColor = TURNCOLOR
}

function showTable() {
	tds = document.querySelectorAll('.play_table td')
	for (let td of tds) {
		let i = Number(td.id)
		if (i % 6 == 0) {
			td.textContent = questions[i]
			td.style.opacity = '1'
			continue
		}
		if (questions[i].type === 'none') {
			td.style.opacity = '0'
			continue
		}
		td.style.backgroundColor = 'blue'
		td.onclick = () => chooseQuestion(i)
	}
}

function nextTurn() {
	document.querySelector('.play_table').style.display = 'block'
	document.getElementById("app").innerHTML = ''
	players[whoseTry].style.backgroundColor = 'inherit'
	if (questions[currentQuestionId].type === 'open')
		document.getElementById('answer').value = ''
	if (questions[currentQuestionId].type === 'choice')
		removeAllChilds(document.getElementById('possible_answers'))
	if (questions[currentQuestionId].type === 'order')
		removeAllChilds(document.getElementById('dropzone'))
	turn++
	if (turn === maxNumOfTurns)
		finish()
	numOfTries = 0
	players[turn % numOfPlayers].style.backgroundColor = TURNCOLOR
	document.getElementById(questions[currentQuestionId].type).style.display = 'none'
	document.getElementById(currentQuestionId).style.opacity = 0
	document.getElementById(currentQuestionId).onclick = ''
}

function chooseQuestion(id) {
	currentQuestionId = id
	document.querySelector('.play_table').style.display = 'none'
	document.getElementById(questions[id].type).style.display = 'block'
	document.querySelector(`#${questions[id].type} .question_text`).textContent = questions[id].text
	let node
	switch(questions[id].type) {
		case 'choice':
			node = document.getElementById('possible_answers')
			for (let i = 0; i < 4; i++) {
				let child = document.createElement('div')
				child.className = 'possible_answer'
				child.id = `c${i + 1}`
				child.onclick = () => chooseAnswer(i + 1) //maybe error
				child.textContent = questions[id].option[i]
				node.appendChild(child)
			}
			break
		case 'order':
			node = document.getElementById('dropzone')
			for (let i = 0; i < 4; i++) {
				let child = document.createElement('div')
				child.className = 'possible_answer'
				child.draggable = true
				child.id = `o${i+1}`
				child.ondragstart = () => onDragStart(event) //maybe error
				child.textContent = questions[id].option[i]
				node.appendChild(child)
			}
	}
	whoseTry = turn % numOfPlayers
	startTimer(60);
	timer = setTimeout(nextTry, 60100) //maybe error
	//nextTurn()
}

function nextTry(isOver = true) {
	if (isOver) alert('Time is over for ' + players[whoseTry].name)
	players[whoseTry].style.backgroundColor = 'inherit'
	whoseTry = (whoseTry + 1) % numOfPlayers
	players[whoseTry].style.backgroundColor = TURNCOLOR
	numOfTries++
	if (numOfTries === 2 * numOfPlayers) {
		//tries are over
		alert('Tries are over')
		nextTurn()
		return
	}
	else if (numOfTries === numOfPlayers && questions[currentQuestionId].type === 'open') {
		document
			.querySelector(`#${questions[currentQuestionId].type} .question_text`)
			.innerHTML += `<br>Подсказка: ${questions[currentQuestionId].option[0]}`
	}
	startTimer(30);
	timer = setTimeout(nextTry, 30100)
}

function chooseAnswer(answer) {
	onTimesUp()
	clearTimeout(timer)
	if (questions[currentQuestionId].answer == answer) {
		document.getElementById('c' + answer).style.backgroundColor = 'green'
		players[whoseTry].scores += (currentQuestionId % 6) * 100
		players[whoseTry].innerHTML = `${players[whoseTry].name}<p>${players[whoseTry].scores}</p>`
		for (let i = 1; i < 5; i++)
			document.getElementById('c' + i).onclick = ''
		setTimeout(nextTurn, 3000)
	}
	else {
		document.getElementById('c' + answer).style.backgroundColor = 'red'
		document.getElementById('c' + answer).onclick = ''
		//alert('Wrong')
		nextTry(false)
	}
}

function submitAnswer() {
	onTimesUp()
	clearTimeout(timer)
	let openInput = document.getElementById('answer')
	openInput.disabled = true
	document.getElementById('submit_answer').disabled = true
	let answer = questions[currentQuestionId].answer.toLowerCase()
	let diff = damerau_levenshtein_distance(openInput.value.toLowerCase(), answer)
	if (diff === 0 || diff <= answer.length / 4) {
		openInput.style.backgroundColor = 'green'
		players[whoseTry].scores += (currentQuestionId % 6) * 100
		players[whoseTry].innerHTML = `${players[whoseTry].name}<p>${players[whoseTry].scores}</p>`
		setTimeout(() => {
			nextTurn()
			openInput.disabled = false
			openInput.style.backgroundColor = 'white'
			document.getElementById('submit_answer').disabled = false
		}, 3000)
	}
	else {
		openInput.style.backgroundColor = 'red'
		openInput.disabled = true
		//alert('Wrong')
		setTimeout(() => {
			openInput.style.backgroundColor = 'white'
			openInput.value = ''
			openInput.disabled = false
			document.getElementById('submit_answer').disabled = false
			nextTry(false)
		}, 3000)
	}
}

function submitOrder() {
	onTimesUp()
	clearTimeout(timer)
	let answer = ''
	document.getElementById('submit_order').disabled = true
	for (node of document.getElementById('dropzone').childNodes)
		answer += node.id[1]
	if (questions[currentQuestionId].answer === answer) {
		document.getElementById('submit_order').style.backgroundColor = 'green'
		players[whoseTry].scores += (currentQuestionId % 6) * 100
		players[whoseTry].innerHTML = `${players[whoseTry].name}<p>${players[whoseTry].scores}</p>`
		setTimeout(() => {
			document.getElementById('submit_order').style.backgroundColor = 'white'
			document.getElementById('submit_order').disabled = false
			nextTurn()
		}, 3000)
	}
	else {
		document.getElementById('submit_order').style.backgroundColor = 'red'
		//alert('Wrong')
		setTimeout(() => {
			document.getElementById('submit_order').disabled = false
			document.getElementById('submit_order').style.backgroundColor = 'white'
			nextTry(false)
		}, 3000)
	}
}

function removeAllChilds(parent) {
	while (parent.firstChild) parent.removeChild(parent.firstChild)
}

function getRandomInt(max) {
	return Math.floor(Math.random() * max)
}

function getRandomOrder(length) {
	let order = []
	let a
	switch(length) {
		case 2:
			order.push(getRandomInt(2))
			order.push(1 - order[0])
			break
		case 3:
			order.push(getRandomInt(3))
			order.push(getRandomInt(2))
			if (order[0] === order[1])
				order[1] = 2
			order.push(3 - order[0] - order[1])
			break
		case 4:
			order.push(getRandomInt(4))
			order.push(getRandomInt(3))
			if (order[0] === order[1])
				order[1] = 3
			a = 6 - order[0] - order[1]
			if (order[0] * order[1])
				order.push(a * getRandomInt(2))
			else
				order.push(Math.floor((a - 1) / 2) + (2 - a % 2) * getRandomInt(2))
			order.push(a - order[2])
	}
	return order
}

//from python
function damerau_levenshtein_distance(s1, s2) {
	let d = {}
	let cost
	lenstr1 = s1.length
    lenstr2 = s2.length
    for (let i = -1; i < lenstr1 + 1; i++)
        d[`(${i},-1)`] = i+1
    for (let j = -1; j < lenstr2 + 1; j++)
        d[`(-1,${j})`] = j+1
 
    for (let i = 0; i < lenstr1; i++) {
    	for (let j = 0; j < lenstr2; j++) {
            if (s1[i] === s2[j]) {
                cost = 0
            }
            else {
                cost = 1
            }
            d[`(${i},${j})`] = Math.min(d[`(${i-1},${j})`] + 1, d[`(${i},${j-1})`] + 1, d[`(${i-1},${j-1})`] + cost);
            if (i && j && (s1[i] === s2[j-1]) && (s1[i-1] === s2[j]))
                d[`(${i},${j})`] = Math.min(d[`(${i},${j})`], d[`(${i-2},${j-2})`] + 1);
        }
    }
    return d[`(${lenstr1 - 1},${lenstr2 - 1})`]
}

//timer

function finish() {
	let url = 'result.html?&' + numOfPlayers
	players.sort((a, b) => {return b.scores - a.scores})
	for (let i = 0; i < numOfPlayers; i++)
		url += '&' + players[i].name + '&' + players[i].scores
	document.location.replace(url)
}

document.addEventListener('click', function(e) {
	if((e.target.tagName === 'A' || e.target.width === 32) && followLinkOnlyWithConsent) {
	    if (!confirm('Вы действительно хотите прервать игру?'))
	    	e.preventDefault();
	}
})