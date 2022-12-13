document.getElementById('open').style.display = 'none'
document.getElementById('order').style.display = 'none'
document.getElementById('choice').style.display = 'none'

function onDragStart(event) {
	event.dataTransfer.setData('text/plain', event.target.id)
	//event.currentTarget.style.backgroundColor = 'yellow'
}

function onDragOver(event) {
	event.preventDefault();
}

function onDrop(event) {
	const id = event.dataTransfer.getData('text')
	const draggableElement = document.getElementById(id)
	const dropzone = event.target
	if (dropzone.id === 'dropzone') {
		return
	}
	//bottom-up and top-down algorithms differ in the removal of the target element
	let upwards = false
	for (const child of document.getElementById('dropzone').childNodes) {
		if (child === event.target) {
			upwards = true
			break
		}
		if (child === draggableElement) break//top down
	}
	document.getElementById('dropzone').removeChild(draggableElement)
	let childs = document.querySelectorAll('#dropzone div')
	let code = false
	let tmpNodes = []
	for (const node of childs) {
		if (code) {
			tmpNodes.push(node.parentNode.removeChild(node))
		}
		if (node === event.target) {
			code = true
			if (upwards) tmpNodes.push(node.parentNode.removeChild(node))
		}
	}
	document.getElementById('dropzone').appendChild(draggableElement)
	for (const node of tmpNodes) {
		document.getElementById('dropzone').appendChild(node)
	}
	event.dataTransfer.clearData()
}