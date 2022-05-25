
const grids=document.querySelector(".grid-container");
const submit=document.querySelector("#submit");
submit.style.display="none";
grids.style.display="none";
for(var i =0;i<81;i++){
    var newDiv=document.createElement("input");
    newDiv.className='grid-item';
    
    newDiv.type="text";
    newDiv.setAttribute("input","this.value=this.value.replace(/[^0-9]/g,'');")
    
    newDiv.setAttribute("maxlength","1")
    grids.appendChild(newDiv);
}
var id=(str)=>{
    return document.getElementById(str);
}
var clns=(str)=>{
    return document.getElementsByClassName(str);
}
var timer;
var timeremaining;
var difficulty;
var solution;
var sudoku;
function startTimer(){
    if(id("time-1").checked)timeremaining= 180;
    else if(id("time-2").checked)timeremaining= 300;
    else timeremaining= 600;
    id("timer").textContent=timeConversion(timeremaining);
    timer=setInterval(function(){
        timeremaining=timeremaining-1;
        if(timeremaining===0){timeOut();clearInterval(timer);}
        id("timer").textContent=timeConversion(timeremaining);
        },1000)

}
function timeOut(){
    clearInterval(timer);
    alert("Timeout")
    submit.style.display="none";
    grids.style.display="none";
    id("timer").innerHTML="Timeout Start a New Game"
}

function setDifficulty(){
    var diffi;
    if(id("diff-1").checked) diffi = "easy";
    else if(id("diff-2").checked) diffi = "medium";
    else diffi="hard";
    return diffi;
}
function timeConversion(time){
    var min=Math.floor(time/60);
    if(min<10)min="0"+min;
    var sec = Math.floor(time%60);
    if(sec<10)sec="0"+sec;
    return min+":"+sec;
}

async function handleStart(){
    const grids=document.querySelector(".grid-container");
    grids.style.display="none";
    const boards = document.getElementById("box")
    boards.style.display="none";
    difficulty=setDifficulty();
    clearInterval(timer);
    
    var url='https://sugoku.herokuapp.com/board?difficulty='+difficulty;
    const arr=clns('grid-item');
    for (var i =0;i<arr.length;i++){
            arr[i].value=null;
            arr[i].readOnly=false;
                
        }
    sudoku=await fetch(url)
    .then(res => res.json())
        .then(data=>{
            
            const board=data.board;

            const arr=clns('grid-item');
            for (var i =0;i<arr.length;i++){
                var num=board[Math.floor(i/9)][Math.floor(i%9)];
                if(num!=0){
                    arr[i].value=num;
                    arr[i].readOnly=true;
                    arr[i].style.backgroundColor="lightgrey";
                }
                else{
                    arr[i].maxlength="1";
                    arr[i].style.backgroundColor="white";
                    arr[i].oninput="this.value=this.value.replace(/[^0-9]/g,'');";
                }
                arr[i].style.backgroundColor="none";

                
            }
            return board;
        });
    console.log(sudoku);
    
    data={board:sudoku};
    solution = await fetch('https://sugoku.herokuapp.com/solve', {
        method: 'POST',
        body: encodeParams(data),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
        .then(response => response.json())
            .then(response => {
                return response.solution;
                }).catch(console.warn);
    console.log(solution);

    
    boards.style.display="grid";
    grids.style.display="grid";
    submit.style.display="block";
    startTimer();
}
function submitAnswer(){
    var x = new Array(9);

    for (var i = 0; i < x.length; i++) {
    x[i] = new Array(9);
    }
    const arr=clns('grid-item');
    for (var i = 0; i < arr.length; i++) {
        if(arr[i].value===null){
            x[Math.floor(i/9)][Math.floor(i%9)]=0;
        }
        else{
            x[Math.floor(i/9)][Math.floor(i%9)]=Number(arr[i].value);
        }
    }

    var result;

    var flag=0;
    for(var i=0; i <9; i++) {
        for(var j=0; j < 9; j++) {
            if(arr[9*i+j].readOnly===true){
                continue;
            }
            if(x[i][j]!==solution[i][j]){
                flag=1;
                arr[9*i+j].setAttribute("style","background-color: tomato")
            }
            else{
                arr[9*i+j].style.backgroundColor="lightgreen"
            }
        }
    }
    if(flag){
        endGame("Puzzle Not Solved");
    }
    else{
        endGame("Puzzle Solved")
    }
}
function endGame(strin){
    if(strin=="Puzzle Solved"){
        clearInterval(timer);
    }


    alert(strin);
}

const encodeBoard = (board) => board.reduce((result, row, i) => result + `%5B${encodeURIComponent(row)}%5D${i === board.length -1 ? '' : '%2C'}`, '')

const encodeParams = (params) => 
  Object.keys(params)
  .map(key => key + '=' + `%5B${encodeBoard(params[key])}%5D`)
  .join('&');