const letters = document.querySelectorAll(".div-input");
const loadingDiv = document.querySelector(".separator");
const ANSWER_LENGTH = 5;

async function init() {
    let currentWord = '';
    let currentRow = 0;
    let isLoading = false;
    let finish = false;
    

    const response = await fetch("https://words.dev-apis.com/word-of-the-day");
    const responseObj = await response.json();
    const word = responseObj.word.toUpperCase();
    console.log(word);
    const wordParts = word.split("");
    const ROUNDS = 5;
    

    function addLetter(letter) {
        //controllo se la lettera è tra le prime 5 o no
        if (currentWord.length < ANSWER_LENGTH) {
            //add letter to the end
            currentWord += letter;
        } else {
            //replace the last letter
            currentWord = currentWord.substring(0, currentWord.length - 1) + letter;
        }
        //associo la lettera al contenitore div    
        letters[currentRow * ANSWER_LENGTH + currentWord.length - 1].innerText = letter;
    }

    async function backspace() {
        currentWord = currentWord.substring(0, currentWord.length - 1);
        letters[currentRow * ANSWER_LENGTH + currentWord.length].innerText = "";
    }

    function markInvalidWord () {
        alert('not a valid word');
    }

    async function commit() {
        if (currentWord ===! ANSWER_LENGTH) {
            //do nothing - I need 5 letters
            return;
        } 

        //TODO - validate the word
        //isLoading = true;
        //setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({  word: currentWord })
        });
        
        const resObj = await res.json();
        const validWord = resObj.validWord;

        if (!validWord) {
           markInvalidWord();
           for (let i = 0; i < ANSWER_LENGTH; i++) {
               letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
               setTimeout (function () {
                    letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");
               }, 10)  
           }
           return; 
        }

        //function that mark every letter
        const myWordParts = currentWord.split("");
        const map = makeMap(wordParts);

        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (myWordParts[i] === wordParts[i]) {
                //color green
                letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
                map[myWordParts[i]]--;
            }
        }   
            
        for (let i = 0; i < ANSWER_LENGTH; i++) {
            if (myWordParts[i] === wordParts[i]) {
                //do nothing
            } else if (map[myWordParts[i]] && map[myWordParts[i]] > 0) {
                //color yellow
                letters[currentRow * ANSWER_LENGTH + i].classList.add("close");   
                map[myWordParts[i]]--;
            } else {
                //color grey
                letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
            } 
        }    
        
        //if win
        if (currentWord === word) {
            alert("You win!");
            finish = true;
            return;
        }

        //if lose
        if (currentRow === ROUNDS) {
            alert(`You lose, the word was: ${word}`);
            finish = true;
            return;
        }

        currentRow++;
        currentWord = '';
    }

    //gestisco l'evento dei tasti premuti
    document.addEventListener("keydown", function handleKeyPress(event) {
        if (finish || isLoading) {
            //do nothing
            return;
        }

        const action = event.key;
        //gestisco i vari tasti che voglio premere    
        if (action === "Enter") {
            commit();
        } else if (action === "Backspace") {
            backspace();
        } else if (isLetter(action)) {
            addLetter(action.toUpperCase());
        } else {
            //do nothing
        }
    });
}

//show the loading state when neccesary
function setLoading(isLoading) {
    loadingDiv.classList.toggle("hidden", !isLoading)
} 


//control if the symbol is a letter or no
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

function makeMap(array) {
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        if (obj[array[i]]) {
            obj[array[i]]++;
        } else {
            obj[array[i]] = 1;
        }
    }
    return obj;
}

init();