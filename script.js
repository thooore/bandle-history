let answers_text_url = "https://sound.bandle.app/answers202311.txt";
let ANSWERS = JSON.parse(decrypt("isItReallyWorthIt", answers_text));
let guessesForThisSong = 0;
let combinedGuessNumberForThisSong = 0; 
createDateList(ANSWERS);

// https://dev.to/am20dipi/how-to-build-a-simple-search-bar-in-javascript-4onf
searchInput.addEventListener("input", (e) => {
	resultsList.innerHTML = '';
	let value = e.target.value;
	if (value && value.trim().length > 0) {
		value = value.trim().toLowerCase();
		// 4. return the results only if the value of the search is included in the person's name
		// we need to write code (a function for filtering through our data to include the search input value)

		setList(songs.filter(song => {
			return song.toLowerCase().includes(value)
		}))
	} else {
		// 5. return nothing
		// input is invalid -- show an error message or show no results

	}

});


function decrypt(salt, encoded) {
	const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
	const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
	return encoded.match(/.{1,2}/g).map((hex) => parseInt(hex, 16)).map(applySaltToChar)
		.map((charCode) => String.fromCharCode(charCode)).join("");
}

async function getAnswersUrl() {
	answerFileInput = document.getElementById("answerFileInput");
	answers_text_url = "https://sound.bandle.app/answers" + answerFileInput.value;
	let encryptedFile = fetch(answers_text_url)
		.then(r => r.text())
		.then(t => {
			let file = decrypt("isItReallyWorthIt", t)
			ANSWERS = JSON.parse(file);
			console.log(ANSWERS)
			createDateList(ANSWERS);
			return true;
		})
}



function parseAnswersToDate(answers) {
	let list = [];
	answers.forEach((element, index) => {
		list.push({ text: element.day, value: index });
	});
	return list;

}

function addSongNamesToAnswers(answers) {
	answers.forEach((element, index) => {
		if (!songs.includes(element.song)) {
			songs.push(element.song)
		}
	});	
}

//Create array of options to be added

function createDateList(answers) {
	let selectListParent = document.getElementById("selectListParent");
	selectListParent.innerHTML = '';

	let array = parseAnswersToDate(answers)

	// we also add the song titles of the correct songs to the large list
	addSongNamesToAnswers(answers)
	


	//Create and append select list
	let selectList = document.createElement("select");
	selectList.setAttribute("id", "dateSelect");
	selectListParent.appendChild(selectList);

	//Create and append the options
	for (let i = 0; i < array.length; i++) {
		let option = document.createElement("option");
		option.setAttribute("value", array[i].value);
		option.text = array[i].text;
		selectList.appendChild(option);
	}
}

function setAnswerCurrentMonth() {
	const d = new Date();
	let month = (d.getMonth() + 1);
	let year = (d.getFullYear());
	// let day = (d.getDate());
	let answerString = "" + year + ((month < 10) ? '0' + month.toString() : month.toString()) + ".txt";
	console.log(answerString);
	document.getElementById("answerFileInput").value = answerString;
	getAnswersUrl()
}

function loadSong() {
	guessesForThisSong = 0;
	combinedGuessNumberForThisSong = 0;
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let text = e.options[e.selectedIndex].text;

	let song = ANSWERS[answersIndex]
	let audioParent = document.getElementById("audioParent");
	audioParent.innerHTML = ''; // reset children


	for (let audioFileNr = 1; audioFileNr <= 5; audioFileNr++) { // the url uses 1-indexing
		// instrument text
		let text = document.createElement("b");
		text.innerText = song.instruments[audioFileNr - 1] // the instrument array uses 0-indexing
		audioParent.appendChild(text);
		// audio file


		let audioButton = document.createElement("button");
		audioButton.innerText = "REVEAL"
		audioButton.id = "audioElement_" + audioFileNr;
		audioButton.onclick = function() {getAudioFile(song.folder, audioFileNr)};
		audioParent.appendChild(audioButton);

		
	}
	// reset other strings as well
	let songReveal = document.getElementById("song");
	let hint = document.getElementById("hint");
	let info = document.getElementById("info");
	songReveal.innerText = ""
	hint.innerText = ""
	info.innerText = "";

}

function getAudioFile(songFolder, audioFileNr) {
	htmlObject = document.getElementById("audioElement_" + audioFileNr);
	audioSourceString = "https://sound.bandle.app/song/" + songFolder + "/" + audioFileNr + ".mp3";
	console.log("audioSourceString", audioSourceString);
	audio = document.createElement("audio");
	audio.setAttribute("src", audioSourceString);
	audio.controls = true;
	htmlObject.replaceWith(audio);
	combinedGuessNumberForThisSong = Math.max(combinedGuessNumberForThisSong, audioFileNr);
	// audioParent.appendChild(audio);
}

function revealHint() {
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let song = ANSWERS[answersIndex]

	let hint = document.getElementById("hint");

	if (song.clue) {
		if (song.clue.en) {
			hint.innerText = "HINT: " + song.clue.en;
			const hintRevealGuessNr = 6;
			combinedGuessNumberForThisSong = Math.max(combinedGuessNumberForThisSong, hintRevealGuessNr);
		}
	}
}

function revealSong() {
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let song = ANSWERS[answersIndex]

	let songReveal = document.getElementById("song");

	songReveal.innerText = song.song
}

function revealInfo() {
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let song = ANSWERS[answersIndex]

	let skinString = ""
	if (song.skin != null) {
		skinString = "\nSkin: " + song.skin;
	}

	let info = document.getElementById("info");

	info.innerText = "Release year: " + song.year + " \nYouTube views: " + song.view + "M " + "\nPar: " + song.par + skinString;
}

function openYoutube() {
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let song = ANSWERS[answersIndex]
	let youtubeUrl = "https://youtu.be/" + song.youtube + "?t=" + song.youtubeStart;
	window.open(youtubeUrl, "_blank");
}



// creating and declaring a function called "setList"
// setList takes in a param of "results"
function setList(results) {

	for (let i = 0; i < Math.min(results.length, 20); i++) {

		const resultItem = document.createElement('button')
		resultItem.classList.add('result-item')
		const text = document.createTextNode(results[i])
		resultItem.style = "text-align: left;"

		// appending the text to the result item
		resultItem.appendChild(text)
		resultItem.setAttribute("onclick", "makeGuess(\"" + results[i] + "\")");


		// appending the result item to the list
		resultsList.appendChild(resultItem)

	}
}

function makeGuess(guess) {
	let e = document.getElementById("dateSelect");
	let answersIndex = e.value;
	let song = ANSWERS[answersIndex];
	
	if (song.song.toLowerCase().trim() === guess.toLowerCase().trim()) {
		let guessCounter = document.getElementById("guessCounter");
		guessCounter.innerText = "CORRECT! " + combinedGuessNumberForThisSong + " guess(es) : " + song.song;
	}
	else {
		guessCounter.innerText = "INCORRECT! " + combinedGuessNumberForThisSong + " guess(es)";
	}
	combinedGuessNumberForThisSong += 1; // do this after and not before to ignore case when song revealed and then guess made
}






