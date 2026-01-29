const resultScreen = document.getElementById("endScreen");
let resultHeading = document.getElementById("resultHeading");

function Win(){
    console.log("PLAYER WINS");
    
    resultScreen.classList.add("WinScreen");
    resultScreen.style.opacity = 0.5;
}

function Lose(){
    console.log("PLAYER LOSES");

    resultScreen.classList.add("LoseScreen");
    resultScreen.style.opacity = 0.5;
}
function Tie(){
    console.log("ITS A TIE");

    resultScreen.classList.add("TieScreen");
    resultScreen.style.opacity = 0.5;
}