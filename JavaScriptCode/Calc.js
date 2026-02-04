let num1;
let dispnum ="";

function add(){
    let total = num1 + num2;
    document.getElementById("ans").textContent = "Answer: " + total;
}
function multiply(){
    let total = num1 * num2;
    document.getElementById("ans").textContent = "Answer: " + total;
}
function divide(){
    let total = num1 / num2;
    document.getElementById("ans").textContent = "Answer: " + total;
}
function subtract(){
    let total = num1 - num2;
    document.getElementById("ans").textContent = "Answer: " + total;
}
function show(value){
    dispnum += value;
    console.log(dispnum);
    console.log(num1);
    document.getElementById("display").textContent = dispnum;
}

function calculate(){
    try{
        let formula = dispnum.replace(/×/g, "*")
                            .replace(/÷/g, "/")
                            .replace(/²/, "**2")
                            .replace(/√(\d+\.?\d*)/g, "Math.sqrt($1)")
        let result = new Function('return ' + formula)();
        if (result === Infinity) {
            result = '∞';
        }
        document.getElementById("display").textContent = result;
        dispnum = "";
    } catch(err){
       document.getElementById("display").textContent = 'Math Error'; 
       dispnum = "";
    }
}