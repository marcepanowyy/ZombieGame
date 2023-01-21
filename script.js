'use strict'

// pierwsza canvas z obrazem zombie

const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// druga canvas z prostokatami

const collisionCanvas = document.getElementById('collisionCanvas');
const collisionCtx = collisionCanvas.getContext('2d');
collisionCanvas.width = window.innerWidth;
collisionCanvas.height = window.innerHeight;

let lives, shot, score, lastTime, zombieInterval, timeToNextZombie, zombies, nick, today

const startGameBtn = document.querySelector('.play')
const overlay = document.querySelector('.overlay')
const modal1 = document.querySelector('.modal1')
const modal2 = document.querySelector('.modal2')
const modal3 = document.querySelector('.modal3')
const finalScore = document.querySelector('.final-score')
const resetBtns = document.querySelectorAll('.reset')
const highscoreBtn = document.querySelector('.highscores')
const highscoreList = document.querySelector('.highscore-info')
const actualScore = document.querySelector('.score')

const nickInput = document.querySelector('.nick')
const nickname = document.querySelector('.nickname')
const infoBar = document.querySelector('.info-bar')

nick = 'No-name';

// cursor

const cursor = document.querySelector('.cursor')

document.addEventListener('mousemove', function (e){

    let x = e.pageX
    let y = e.pageY
    cursor.style.left = x + "px"
    cursor.style.top = y + "px"

});

//


nickInput.addEventListener('keyup', function (e){
    nick = nickInput.value
})

startGameBtn.addEventListener('click', function (){
    init()
})

for(let i=0; i<resetBtns.length; i++){
    resetBtns[i].addEventListener('click', function (){
        modal1.classList.remove('hidden')
        modal2.classList.add('hidden')
        modal3.classList.add('hidden')
})}

highscoreBtn.addEventListener('click', function (){
    modal1.classList.add('hidden')
    modal2.classList.add('hidden')
    modal3.classList.remove('hidden')
})

// warunki poczatkowe

function init(){

    score = 0;
    lives = 3
    shot = false;
    zombies = []
    timeToNextZombie = 0
    zombieInterval = 1000
    lastTime = 0

    today = getDate()

    overlay.classList.add('hidden')
    modal1.classList.add('hidden')
    modal2.classList.add('hidden')
    modal3.classList.add('hidden')

    actualScore.classList.remove('set-opacity-to-zero')
    cursor.classList.remove('hidden')

    nickname.textContent = nick
    actualScore.textContent = `${score}`.padStart(5, '0')

    infoBar.classList.remove('set-opacity-to-zero')

    for(let heart=1; heart <=3; heart++){
        document.querySelector( `.heart${heart}`).classList.remove("set-opacity-to-zero")
    }

    // kasujemy ranking

    while(highscoreList.firstChild){
        highscoreList.removeChild(highscoreList.lastChild)
    }

    // start animacji

    animate(0);
}

//

class Zombie{

    constructor() {

        this.spriteWidth = 200;
        this.spriteHeight = 312;  // umieszczam, zeby ladnie skalowac

        this.sizeModifier = Math.random() * 0.2  + 0.4;  // wartosc miedzy 0.4 - 0.6

        this.width = this.spriteWidth * this.sizeModifier;  // zachowujemy aspect ratio
        this.height = this.spriteHeight * this.sizeModifier;

        this.x = canvas.width; // zaczyna sie tam, gdzie konczy canvas, czyli poza (pozycja poczatkowa)
        this.y =  0.65 * canvas.height + Math.random() * (0.35 * canvas.height - this.height); // pozycja poczatkowa

        this.directionX = Math.floor(Math.random() * 5) + 1.7; // szybkosc (randomowa) im wiekszy directionx tym szybciej sie porusza

        this.markedForDeletion = false; // znacznik, ktory pozwala znalezc te obiekty, ktore w calosci wyszly poza mape

        // dodanie obrazu zombie

        this.image = new Image();
        this.image.src = 'images/walkingdead.png';

        this.frame = 0;
        this.maxFrame = 9;

        this.timeSinceFlap = 0; // to have consistence timing between different machines
        this.flapInterval = Math.random() * 100 + 50;

        // przypisujemy randomowe tlo do zombiaka (unique password 4 each zombie)

        this.randomColors = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = `rgb(${this.randomColors[0]}, ${this.randomColors[1]}, ${this.randomColors[2]})`;

    }

    update(deltaTime){

        this.x -= this.directionX;

        if (this.x < 0 - this.width) this.markedForDeletion = true;

        this.timeSinceFlap += deltaTime;

        if(this.timeSinceFlap > this.flapInterval){
            if(this.frame >= this.maxFrame) this.frame = 0;  // updatedujemy frames (zeby to wygladalo dynamicznie)
            else this.frame ++;
            this.timeSinceFlap = 0;
        }

        // warunki konca gry

        if (this.x < 0 - this.width) {
            updateLifeBar(lives)
            lives -= 1
        }

    }

    draw(){

        // rysujemy prostokaty roznego koloru na nowej canvas2

        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);

        // wypelniamy prostokat z canvas1 obrazem zombie

        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height); // skalowanie, wycinanie

    }

}

function updateLifeBar(livesLeft){
    document.querySelector( `.heart${livesLeft}`).classList.add("set-opacity-to-zero")
}

// dodawanie danych do bazy i wyswietlenie top 7 w highscores

function gameOver() {

    overlay.classList.remove('hidden')
    modal2.classList.remove('hidden')
    actualScore.classList.add('set-opacity-to-zero')
    cursor.classList.add('hidden')
    finalScore.textContent = `Your score is ${score}`

    fetch("http://localhost:3000/highscores?").then(async res => {

        // dodajemy do bazy dane

        await res.json().then(response => {

            fetch("http://localhost:3000/highscores?",
                {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    method: "POST",
                    body: JSON.stringify({id: response.length + 1, nickname: nick, score: score, date: today})
                })

        })

        // pobieramy dane

        const response = await fetch("http://localhost:3000/highscores?")
        const newData = await response.json();

        // sortujemy

        newData.sort((a, b) => b.score - a.score);

        // top 7 wynikow

        for (let i = 0; i < Math.min(newData.length, 7); i++) {

            const newElement = document.createElement('div');
            newElement.classList.add("highscore-list-element");
            newElement.textContent = `${i + 1}. ${newData[i].nickname} achieved ${newData[i].score} points ${newData[i].date}`
            highscoreList.append(newElement)

        }

})

}

/////////////

window.addEventListener('click', function (e) {

    const pc = collisionCtx.getImageData(e.x, e.y, 1, 1).data; // skanujemy tylko 1px (ignoruje narysowane zombiaki, zczytuje kolor za nimi (id kazdego zombiaka))

    if(zombies) {
        zombies.map(object => {
            if (object.randomColors[0] === pc[0] && object.randomColors[1] === pc[1] && object.randomColors[2] === pc[2]) { // kolizja!
                object.markedForDeletion = true;
                score += 12;
                shot = true;

            }
        })
    }

    if (!shot) score = Math.max(score - 6, 0);
    else shot = false;

    actualScore.textContent = `${score}`.padStart(5, '0')

})

function animate(timestamp){

    ctx.clearRect(0, 0, canvas.width, canvas.height); // czyscimy cala canvas
    collisionCtx.clearRect(0, 0, canvas.width, canvas.height); // czyscimy cala canvas

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNextZombie += deltaTime;

    if(timeToNextZombie > zombieInterval){
        zombies.push(new Zombie());
        timeToNextZombie = 0;

        //sortujemy po mniejszych po to, zeby te wieksze byly z przodu (rysowanie najpierw mniejszych, potem wiekszych)

        zombies.sort(function (a, b){
            return a.width - b.width;
        })
    }

    [...zombies].forEach(object => object.update(deltaTime)); // array literal ... -> spread operator for each animation frame
    [...zombies].forEach(object => object.draw());

    zombies = zombies.filter(object => !object.markedForDeletion) // dlatego array ma let variable, odfiltrowuje, te, ktore sa tylko na canvas i nie wyszly poza

    if (lives > 0) requestAnimationFrame(animate);
    else gameOver()

}

function getDate(){
    let newDate = new Date();
    let dd = String(newDate.getDate()).padStart(2, '0');
    let mm = String(newDate.getMonth() + 1).padStart(2, '0');
    let yyyy = newDate.getFullYear();
    newDate = mm + '/' + dd + '/' + yyyy;
    return newDate
}
