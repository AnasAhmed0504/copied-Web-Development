let list = document.getElementById("list-container");
let textBox = document.getElementById("text-box");

displayList();

function addTask(){
    if(textBox.value === ''){
        alert("The Text Box is empty");
    }else{
        let li = document.createElement("li");
        let span = document.createElement("span")

        li.innerHTML = textBox.value;
        list.appendChild(li);
        span.innerHTML = "\u00d7";
        textBox.value = '';
        li.appendChild(span);
    }
    save();
}

list.addEventListener("click", function(e){
    if(e.target.tagName === 'LI'){
        e.target.classList.toggle("checked")
        save();
    }else if(e.target.tagName ==='SPAN'){
        e.target.parentElement.remove();
        save();
    }
}, false);

function save(){
    localStorage.setItem("data", list.innerHTML)
}

function displayList(){
    list.innerHTML = localStorage.getItem("data");
}