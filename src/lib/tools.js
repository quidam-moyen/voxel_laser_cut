sq = (x) => { return x*x }

function map(val, in_min, in_max, out_min, out_max) {
	return (val - in_min) * (out_max - out_min) / (in_max - in_min) + out_min
}

function constrain(val, min, max) {
	var res = val
	if (val < min) res = min
	if (val > max) res = max

	return res
}


function confirmBox(message, valid_callback) {
	// creation of the box
	var backBox = document.createElement("DIV")
	var box = document.createElement("DIV")
	var text = document.createElement("SPAN")
		text.innerText = message
	var spanBtns = document.createElement("SPAN")
	var btnYes = document.createElement("BUTTON"); btnYes.innerText = "Yes"
	var btnNo  = document.createElement("BUTTON"); btnNo.innerText  = "No"
		btnYes.onclick = function() {
			backBox.style.display = "none"
			valid_callback()
		}
		btnNo.onclick = function() {
			backBox.style.display = "none"
		}

		backBox.appendChild(box)
		box.appendChild(text)
		spanBtns.appendChild(btnYes)
		spanBtns.appendChild(btnNo)
		box.appendChild(spanBtns)

		// styles and classes
		text.style.padding = "5px"
		spanBtns.style.display = "flex"
		btnYes.style.width = "100%"
		btnNo.style.width  = "100%"
		backBox.classList.add("modal")
		box.classList.add("confirm-box")
		btnYes.classList.add("w3-button")
		btnYes.classList.add("w3-hover-white-black")
		btnNo.classList.add("w3-button")
		btnNo.classList.add("w3-hover-white-black")

		// set the position of the box with mouse position
		box.style.top  = event.clientY
		box.style.left = event.clientX

		if (event.clientX + 100 >= window.innerWidth) {
			box.style.left = event.clientX - 200
		}

		// display the box
		backBox.style.display = "block"
		document.body.appendChild(backBox)

	// security div
	var divSafe = document.createElement("div")
		divSafe.classList.add("modal")

} // confirmBox




function modalManagement(id) {
	var modal = document.getElementById(id)
	var span = document.getElementById("close-" + id)

	modal.style.display = "block"
	
	span.onclick = function() {
		modal.style.display = "none"
	}
	window.onclick = function(event) {
		if (event.target == modal) {
			modal.style.display = "none"
		}
	}
}// modalManagement

function modalClose(id) {
	document.getElementById(id).style.display = "none"
}// modalClose


function deg2Rad(val) {
	return val * 3.14 / 180
}