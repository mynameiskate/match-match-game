'use strict';
let pairAmount = 0;
const MAX_PAIR_COUNT = 15;
let pairsLeft;
let cardsToCompare;
let openCardsCount = 0;
let seconds = 0, minutes = 0;
let timer;
let interval;

function validate() {
    let name = document.forms['auth'].username.value.trim();
     if(name === "")
    {
        document.getElementById('username').className = 'error';
    }
    else {
        pairAmount = document.querySelector('input[name="level"]:checked').value;
        document.getElementById('username').className -= 'error';
        window.localStorage.setItem('user', name);
        loadGamePage();
    }
}

class Card {
    constructor(img, element) {
        this.img = img;
        this.element = element;
        this.element.addEventListener('click', () => this.flip());
        this.isShown = false;
    }
}

Card.prototype.flip = function() {
    if (!canOpen()) return;
    openCardsCount++;
    this.store();
    this.element.className = 'flipped';
    this.isShown = true;
    if (openCardsCount == 2) {
        setTimeout(() => checkMatch(this), 1000);
    }
    this.isShown = false;
}

Card.prototype.store = function() {
    let result = true;
    if (!cardsToCompare[0]){
        cardsToCompare[0] = this;
    }
    else if (!cardsToCompare[1]) {
        cardsToCompare[1] = this;
    }
    else {
        result = false;
    }
    return result;
}

Card.prototype.hide = function() {
    this.element.removeEventListener('click', () => this.flip());
    this.element.className = 'matched';
    this.element.innerHTML = '';
}

function canOpen() {
   return (openCardsCount < 2);
}

function checkMatch(card2) {
    let card1 = cardsToCompare[0];
    if (!card2) {
        card1.element.className = 'returned';
    }
     else {
        if ((card1.element.type === card2.element.type) && card1 !== card2) {
            card1.hide();
            card2.hide();
            pairsLeft--;
            if (!pairsLeft) {
                endGame();
            }
        }
        else {
            card1.element.className = 'returned';
            card2.element.className = 'returned';
        }
        card2.isShown = false;
    }
    card1.isShown = false;
    openCardsCount = 0;
    cardsToCompare = [];
}

let Expander = {
    init: function(id, addClass) {
        let el = Expander.show(id);
        if (!el.hasAttribute('data-height')) {
            el.style.display = 'block';
            el.dataset.height = el.offsetHeight+"px";
            el.className = 'expand' + " " + addClass;
            el.style.height = 0;  
        }
        return el;
    },

    expand: function(id, addClass) {
        let div = Expander.init(id, addClass);
        setTimeout(function() { div.style.height = div.dataset.height; }, 20);
        div.style.width = '100%';
    },

    collapse: function(id) {
        let div = Expander.init(id);
        div.style.height = 0;
        div.innerHTML = '';
    },

    show: function(id) {
        let el = document.getElementById(id);
        el.style.display = 'inline-block'; 
        return el;   
    },

    hide: function(id) {
        let el = document.getElementById(id);
        el.style.display = 'none'; 
    }
}

function startTimer(){
    stopTimer();
    timer.innerHTML = "0:0";
    interval = setInterval(function() {
        timer.innerHTML = minutes + ":" + seconds;
        seconds++;
        if(seconds == 60){
            minutes++;
            seconds = 0;
        }
        if (minutes == 20) {
            endTime();
        }
    }, 1000);
}

function stopTimer(){
    if (interval) {
        clearInterval(interval);
    }
    seconds = 0;
    minutes = 0;
}


function shuffle(array) {
    let tmp, current;
    let top = array.length;
    if (!top) return;
    while (--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }
    return array;
}

function* generateRand(max) {
    let indexes = Array.from({length: max}, (x,i) => i + 1);
    indexes = shuffle(indexes);
    for (let i = 0; i < max; i++) {
        yield indexes[i];
    }
}

function createPairArr(pairCount) { 
    let arr = [];
    let index = 0;
    let rand = generateRand(MAX_PAIR_COUNT);
    for (let i = 0; i < pairCount ; i++) {
        index = rand.next().value;
        arr.push(index.toString());
        arr.push(index + 'pair');
    }
    return shuffle(arr);
}

function loadGamePage(){
    greet();
    pairsLeft = pairAmount;
    cardsToCompare = [];
    timer = document.getElementById('clock_field');
    Expander.hide('collapsable');
    Expander.show('slogan');
    Expander.show('clock_field');
    Expander.show('start_button');
    loadField();
    Expander.expand('background', 'blue');
    startTimer();
}


function loadField(){
    let field = document.getElementById('field');
    field.innerHTML = '';
    let deck = createPairArr(pairAmount);
    for (let i = 0; i < pairAmount * 2; i++) {
        let div = document.createElement('div');
        div.id = 'clickable';
        div.type = deck[i].replace(/[^0-9]/g,'');
        div.innerHTML = '<img class="card" src="img/' + (deck[i]) + '.jpg" alt=":)">';
        field.appendChild(div);
        let card = new Card(div.innerHTML, div);
    }
}

function greet() {
    document.getElementById('welcome').innerHTML = 'Welcome, ' + window.localStorage.getItem('user')  + '.';
}

function congratulate() {
    document.getElementById('welcome').innerHTML = 'Congratulations, ' + window.localStorage.getItem('user')  + '. Total time: ' + minutes + ":" + seconds;
}

function showBadResult() {
    document.getElementById('welcome').innerHTML = 'Time is out, ' + window.localStorage.getItem('user')  + '. Try again?';
}

function endGame() {
    congratulate();
    stopTimer();
}

function endTime() {
    stopTimer();
    document.getElementById('field').innerHTML = '';
    showBadResult();
}