let lastTimePainted = 0;
let lastMoveTime = 0;
let lastPlayedTime = 0;
let lastClickedTime=0;
let speed = 5;
let score = 0;
let screenX = 12;
let screenY = 18;

let lastPlatform = screenY;
let allColors = ['cyan', 'yellow', 'purple', 'green', 'red', 'blue', 'orange', 'grey']

let currentBlockArray = new Set()
let currentAssume = []
let currentColor = null;
let currentCenter = {};

let allBlockArray = []

let audio = document.querySelector('Audio') 
setTimeout(()=>{
    audio.play()
}, 500)

if (localStorage.getItem('hiScore')===null) {
    localStorage.setItem('hiScore', 0);
}

function putBoxOn(x, y, color, status='current'){
    let newBox = document.createElement('div');
    newBox.classList.add('box');
    newBox.classList.add(status);
    newBox.style.gridColumnStart = x;
    newBox.style.gridRowStart = y;
    newBox.style.background = color;
    document.querySelector('.board').appendChild(newBox)
}
function render(){
    Array.from(document.getElementsByClassName('current')).forEach(e=>{
        e.remove()
    })
    currentBlockArray.forEach(e=>{
        putBoxOn(e['x'], e['y'], currentColor)
    })
}
function renderRestBlocks(ylevel=null){
    Array.from(document.getElementsByClassName('restBlocks')).forEach(e=>{
        e.remove()
    })
    allBlockArray.forEach(e=>{
            putBoxOn(e['x'], e['y'], e['color'],'restBlocks')
    })
    if (ylevel !== null) {
        handleHangingBlock(ylevel)
    }
}
function handleHangingBlock(ylevel) {
        counter=0
        allBlockArray.forEach(e=>{
            if (e['y']<ylevel) {
            allBlockArray[counter] = {x : e['x'], y: e['y']+1, color:e['color']}    
        }
        counter++;
    })
    renderRestBlocks()
}
function genarateRandomNumber(x, y){
    let randomNumber = Math.round(((y-x)*(Math.random()))+x)
    return randomNumber
}
function generateBlock(center={}){
    if (currentBlockArray.size===0) {  // If we are generating a new Block from the starting of screen then we have to set that (center :y-axis = 1 and :x-axis = random) otherwise the case will be of changing the shape of an existing block, we weill pass the center of that block.
        if (Object.keys(center).length===0) {
            center['x'] = genarateRandomNumber(2, screenX-1);
            center['y'] = 1
            currentColor = allColors[genarateRandomNumber(0, allColors.length-1)]
            currentCenter['x'] = center['x']
            currentCenter['y'] = center['y']
        }
        let chooseDiffShapes = genarateRandomNumber(1,9)
        if (chooseDiffShapes === 9) {
            currentBlockArray.add({x:center['x'], y:center['y']})
            currentBlockArray.add({x:center['x'], y:center['y']+1})
            currentBlockArray.add({x:center['x'], y:center['y']+2})
            currentBlockArray.add({x:center['x'], y:center['y']+3})
        }
    }
    let SetOFCollection = [{x:center['x']-1, y:center['y']}, {x:center['x'], y:center['y']}, {x:center['x']+1, y:center['y']}, {x:center['x']-1, y:center['y']+1}, {x:center['x'], y:center['y']+1}, {x:center['x']+1, y:center['y']+1}];
    while (currentBlockArray.size<4){
        let randomIndex = genarateRandomNumber(0, 5);
        let cord = SetOFCollection[randomIndex]
        currentBlockArray.add(cord)

        if (currentBlockArray.size===4) {
            let allCords = [[],[],[]]
            currentBlockArray.forEach(e=>{
                allCords[0].push(e)
                allCords[1].push(e['x'])
                allCords[2].push(e['y'])
            })
            allCords[0].forEach(e=>{
                unitDistWith = 0
                allCords[0].forEach(x=>{
                    if ( ((e['y']-x['y'])**2 + (e['x']-x['x'])**2)**(1/2) === 1  && e!==x ) {
                        unitDistWith++;
                    }
                })
                if(unitDistWith===0 || !allCords[1].includes(center['x'])){
                    currentBlockArray = new Set();
                    return;
                }
            })
        }
    }
    currentBlockArray.forEach(e=>{
        putBoxOn(e['x'], e['y'], currentColor)
    })
}
function clearScren(){//We will organise a object(allBlocksCordAccToY) like this  ---{y-level:[all x covered on that y level]} if list of any y-level consist all the maxmimum space in a row then, we will address that y and delete all the elements of that y-level from allBlockArray
    let allBlocksCordAccToY = {} //Organising object
    allBlockArray.forEach(e=>{
        let blockX = e['x'];
        let blockY = e['y'];
        if(Object.keys(allBlocksCordAccToY).includes(String(blockY))){
            allBlocksCordAccToY[blockY].push(blockX)
        }
        else{
            allBlocksCordAccToY[blockY] = [(blockX)]
        }
    }) //Object Organised

    Object.keys(allBlocksCordAccToY).forEach(yLevel=>{//addressing array of diff y-levels one by one and checking if any array have full elements
        listOFXCords = allBlocksCordAccToY[yLevel] // array containing all the x cords which are already filled with Blocks of that spicific yLevel
        if (listOFXCords.length===screenX) {//Addressed array
            score++;
                for (let i = 1; i < 13; i++) {
                    putBoxOn(i, yLevel, 'white', 'ClearScreenTrans')
                }
                setTimeout(()=>{
                    Array.from(document.getElementsByClassName('ClearScreenTrans')).forEach(e=>{
                        e.remove()
                    })
                }, 200)
                for (let i = 1; i < 13; i++) {
                    allBlockArray.forEach(eachBlock=>{//deleting that specific block from allBlockArray
                        if (eachBlock['x'] === i && eachBlock['y'] === Number(yLevel)) {
                            let index = allBlockArray.indexOf(eachBlock)
                            allBlockArray.splice(index, 1)
                        }
                    })
                }
                renderRestBlocks(yLevel);//Render all rest blocks
        }
    })
}
function renderScore() {
    document.querySelector('.crtScoreBox').innerHTML = `Current Score : ${score}`
    document.querySelector('.hiScoreBox').innerHTML = `High Score : ${localStorage.getItem('hiScore')}`
    if (localStorage.getItem('hiScore') < score) {
        localStorage.setItem('hiScore', score);
    }
}
function handleGameOver(){
    allBlockArray.forEach(e=>{
        if (e['y']<2) {
            allBlockArray = []
            location.reload()
            alert(`Game Over !!! Your Score : ${score}`)
        }
    })
}

function handleAssume(){
    currentAssume = []
    if (document.getElementsByClassName('assume').length!==0) {
        Array.from(document.getElementsByClassName('assume')).forEach(e=>{
            e.remove()
        })
    }

    let assumed = false;
    currentBlockArray.forEach(e=>{
        currentAssume.push(e)
    })
    while(!assumed){
        currentAssume.forEach(block=>{
            if (allBlockArray.length>0) {
                allBlockArray.forEach(oneBlockFromRest=>{
                    if (block['y']===screenY) {
                        assumed=true;
                    }
                    else{
                        if (block['x']===oneBlockFromRest['x'] && block['y']+1===oneBlockFromRest['y']) {
                            assumed=true;
                        }            
                    }
                })
            }
            else{
                if (block['y']===screenY) {
                    assumed=true;
                }
            }
        })
        currentAssume.forEach(block=>{
            let index = currentAssume.indexOf(block)
            currentAssume[index] = {x:block['x'], y:block['y']+1}
        })
    }
    currentAssume.forEach(e=>{
        let assu = document.createElement('div')
        assu.classList.add('assume')
        assu.style.gridColumnStart = e['x'];
        assu.style.gridRowStart = e['y']-1;
        assu.style.background = currentColor;
        assu.style.border = `1px solid black`;
        document.querySelector('.board').appendChild(assu)
    })

}
function moveBlock(dir) {
    if (dir ==='ArrowDown') {
        reachedBottom = false;
        currentBlockArray.forEach(block=>{
            if (allBlockArray.length>0) {
                allBlockArray.forEach(blockFromAll=>{
                    if (blockFromAll['x'] === block['x'] && blockFromAll['y']-1 === block['y']) {
                        reachedBottom = true;
                    }
                })
                if (block['y'] === screenY) {
                    reachedBottom=true;                    
                }

            }
            else{
                if (block['y'] === screenY) {
                    reachedBottom=true;                    
                }
            }
        })
    
        if (reachedBottom){
            Array.from(document.getElementsByClassName('current')).forEach(e=>{
                e.classList.remove('current')
                e.classList.add('restBlocks')
                currentBlockArray.forEach(e=>{
                    e['color'] = currentColor;
                    allBlockArray.push(e)
                })
                currentBlockArray = new Set();
                currentCenter={}
                // generateBlock()
            })
        }
        else{
            let newArr = new Set()
            currentBlockArray.forEach(e=>{
                newArr.add({x:e['x'], y:e['y']+1})
            })
            currentBlockArray = newArr;
            currentCenter['y'] = currentCenter['y']+1;
        }
    }
    else{
        if (dir ==='ArrowRight') {
            let allX = []
            currentBlockArray.forEach(e=>{
                allX.push(e['x'])
            })
            let overlap=false;
            currentBlockArray.forEach(e=>{
                allBlockArray.forEach(z=>{
                    if (e['x']+1 === z['x'] && e['y'] === z['y']) {
                        overlap=true;
                    }
                })
            })
            if (!overlap && !allX.includes(12)) {
                let newArr = new Set()
                currentBlockArray.forEach(e=>{
                    newArr.add({x:e['x']+1, y:e['y']})
                })
                currentCenter['x'] = currentCenter['x']+1;
                currentBlockArray = newArr;
            }
        }
        else if (dir ==='ArrowLeft') {
            newArr = new Set()
            let allX = []
            currentBlockArray.forEach(e=>{
                allX.push(e['x'])
            })
            let overlap=false;
            currentBlockArray.forEach(e=>{
                allBlockArray.forEach(z=>{
                    if (e['x']-1 === z['x'] && e['y'] === z['y']) {
                        overlap=true;
                    }
                })
            })
            if (!allX.includes(1) && !overlap) {
                let newArr = new Set()
                currentBlockArray.forEach(e=>{
                    newArr.add({x:e['x']-1, y:e['y']})
                })
                currentBlockArray = newArr;
                currentCenter['x'] = currentCenter['x']-1;
            }
        }
}
    render()
}


window.addEventListener('keydown', key=>{
    if (key.code==='Space') {
        Array.from(document.getElementsByClassName('current')).forEach(e=>{
            e.remove()
        })  
        currentBlockArray = new Set();
        generateBlock(center=currentCenter)
    }
    else{
        moveBlock(key.code)
    }
    })
renderRestBlocks()

function main(ctime){
    requestAnimationFrame(main)
    if ((ctime-lastTimePainted)/1000<(1/speed)) {
        return;
    }
    if ((ctime-lastPlayedTime)/1000>11) {
        audio.currentTime=0;
        lastPlayedTime=ctime;
    }
    addEventListener('keydown', key=>{
        if (key.code==='Enter') {
            while(currentBlockArray.size!==0){
                moveBlock('ArrowDown')
            }
        }
    })
    gameLoop(ctime);
    lastTimePainted = ctime;
}
function gameLoop(ctime){
    generateBlock()
    clearScren()
    render()
    renderScore()
    handleGameOver()
    handleAssume()
    if ((ctime-lastMoveTime)/1000 > 1/speed) {
        moveBlock('ArrowDown')
        lastMoveTime = ctime
    }


}

requestAnimationFrame(main)