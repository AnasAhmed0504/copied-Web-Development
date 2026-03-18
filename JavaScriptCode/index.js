let amount = document.getElementById("amount");
let count = 0;
let history = document.getElementById("entries");
let greeting = document.getElementById("welcome-back");
let username = "Yahia";
greeting.textContent = "Welcome back, " + username + "!";
history.textContent = "";
function increment(){
    count++;
    console.log(count);
    amount.textContent = count;
}

function save(){
    console.log("Saved:", count);
    history.textContent += count + " - ";
    count = 0;
    amount.textContent = 0;
}

function clean(){
    count = 0;
    amount.textContent = 0;
    console.log(count);
}

