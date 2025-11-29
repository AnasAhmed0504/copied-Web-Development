let amount = document.getElementById("amount");
let count = 0;
let history = document.getElementById("entries");
let greeting = document.getElementById("welcome-back");
let username = "Yahia";
greeting.innerText = "Welcome back, " + username + "!";
history.innerText = "";
function increment(){
    count++;
    console.log(count);
}

function save(){
    amount.innerText = count;
    console.log("Saved:", count);
    history.innerText += count + " - ";
}

