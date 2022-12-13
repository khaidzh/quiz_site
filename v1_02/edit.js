class Question {
	constructor(type = 'none', text = '', answer = '', A = '', B = '', C = '', D = '') {
		this.type = type
		this.text = text
		this.answer = answer
		this.optionA = A
		this.optionB = B
		this.optionC = C
		this.optionD = D
	}
	clear() {
		this.type = 'none'
		this.text = ''
		this.answer = ''
		this.optionA = ''
		this.optionB = ''
		this.optionC = ''
		this.optionD = ''
	}
}

var questions
var id
var question

function startEdit() {
	questions = []
	for (let i = 0; i < 5; i++) {
		questions.push('Theme' + i)
		for (let j = 0; j < 5; j++) {
			questions.push(new Question())
		}
	}
	id = 1
	question = questions[1]
	preview(1)
}

function preview(question_id) {
	//if (!confirm("Are you sure?")) {return}
	document.getElementById(id).style.background = ((question.type === 'none') ? 'inherit' : 'green')
	document.getElementById(question_id).style.background = 'orange'
	question = questions[question_id]
	id = question_id
	document.getElementById(question.type).selected = true
	document.getElementById('text').value = question.text
	document.getElementById('answer').value = question.answer
	document.getElementById('option_a').value = question.optionA
	document.getElementById('option_b').value = question.optionB
	document.getElementById('option_c').value = question.optionC
	document.getElementById('option_d').value = question.optionD
	change();
	toggleEditOff();
	//(question.type === 'none') ? toggleEditOn() : toggleEditOff()
}

function change() {
	if (document.getElementById('type').value === 'none') {
		document.getElementById('toggle').style.display = 'none';
		return
	}	
	document.getElementById('toggle').style.display = 'block';
	
	if (document.getElementById('type').value === 'open') {
		document.getElementById('answer').placeholder = 'Ответ'
		document.getElementById('option_a').placeholder = 'Подсказка'
		document.getElementById('option_a').style.width = '600px'
		document.getElementById('option_b').style.display = 'none'
		document.getElementById('option_c').style.display = 'none'
		document.getElementById('option_d').style.display = 'none'
	}
	else {
		if (document.getElementById('type').value === 'choice')
			document.getElementById('answer').placeholder = 'Ответ (число от 1 до 4)'
		else
			document.getElementById('answer').placeholder = 'Ответ (перестановка чисел от 1 до 4)'
		document.getElementById('option_a').placeholder = '1)'
		document.getElementById('option_a').style.width = '300px'
		document.getElementById('option_b').style.display = 'inline'
		document.getElementById('option_c').style.display = 'inline'
		document.getElementById('option_d').style.display = 'inline'
	}
}

document.getElementById('type').addEventListener('change', change)

const editQuestion$ = document.getElementById('edit_question')
const cancelQuestion$ = document.getElementById('cancel_question')
const saveQuestion$ = document.getElementById('save_question')
const saveAll$ = document.getElementById('save_all')

function toggleEditOn() {
	document.querySelector('.edit_preview select').disabled = false
	let inputs = document.querySelectorAll('.edit_preview input')
	for (let input of inputs) {
		input.disabled = false
	}
	editQuestion$.style.display = 'none'
	cancelQuestion$.style.display = 'inline'
	saveQuestion$.style.display = 'inline'
	saveAll$.style.display = 'none'
}

function toggleEditOff() {
	document.querySelector('.edit_preview select').disabled = true
	let inputs = document.querySelectorAll('.edit_preview input')
	for (let input of inputs) {
		input.disabled = true
	}
	editQuestion$.style.display = 'inline'
	cancelQuestion$.style.display = 'none'
	saveQuestion$.style.display = 'none'
	saveAll$.style.display = 'inline'
}

editQuestion$.addEventListener('click', async () => {
	toggleEditOn()
})

cancelQuestion$.addEventListener('click', async () => {
	preview(id)
	//change() in preview
	//toggleEditOff() in preview
})

saveQuestion$.addEventListener('click', async () => {
	question.type = document.getElementById('type').value
	if (question.type === 'none') {
		question.clear()
		toggleEditOff()
		return
	}
	question.text = document.getElementById('text').value
	question.answer = document.getElementById('answer').value
	question.optionA = document.getElementById('option_a').value
	question.optionB = document.getElementById('option_b').value
	question.optionC = document.getElementById('option_c').value
	question.optionD = document.getElementById('option_d').value
	preview(id)
	//toggleEditOff() in preview
})

saveAll$.addEventListener('click', async () => {
	var options = {
		suggestedName: document.getElementById('title').value,
		types: [
		    {
		    	description: 'Text',
		    	accept: {
		    		'text/plain': '.txt'
		    	}
		    }
		],
		excludeAcceptAllOption: true
	}
	const fileHandle = await window.showSaveFilePicker(options)
	const writableStream = await fileHandle.createWritable()
	for (let i = 0; i < 30; i++) {
		if (i % 6 === 0) {
			await writableStream.write(document.getElementById(String(i)).value + '\n')
			continue
		}
		if (questions[i].type === 'none') {
			await writableStream.write('none\n')
			continue
		}
		await writableStream.write(questions[i].type)
		await writableStream.write('|' + questions[i].text)
		await writableStream.write('|' + questions[i].answer)
		await writableStream.write('|' + questions[i].optionA)
		if (questions[i].type === 'open') {
			await writableStream.write('\n')
			continue
		}
		await writableStream.write('|' + questions[i].optionB)
		await writableStream.write('|' + questions[i].optionC)
		await writableStream.write('|' + questions[i].optionD)
		await writableStream.write('\n')
	}
	await writableStream.close()
})