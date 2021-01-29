//sequence
//1. enemy dies
//2. enemy name change patch
//3. update hero score (enemy health * 100) + hero.score
//4. fetch battle won
//5. load new enemy

//DATA
let heroForm = document.querySelector('.create-hero')
let scoreCounter = 0
let specialCounter = 0
let backgroundCounter = 1

// gets users with highest scores
function fetchHighScores(){
    fetch('http://localhost:3000/high_scores')
    .then(res => res.json())
    .then(heros => heros.forEach(hero => addHighScore(hero)))
}

//on form submission, posts new hero to database and calls fetch enemy
function postHero(hero){
    fetch('http://localhost:3000/heros', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify(hero)
    })
    .then(res => res.json())
    .then(hero => {
        renderBattleHeroCard(hero)
        fetchEnemy()
    })
}

//posts new enemy generated with faker data in enemies controller
function fetchEnemy() {    
    const enemy = document.querySelector('.enemy-card')
    if(enemy){
        enemy.remove()
    }   

    fetch('http://localhost:3000/enemies', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({counter: backgroundCounter})
    }).then(res => res.json())
    .then(enemy => {
        renderEnemy(enemy)
        postBattle()
    })
}

//runs after enemy card is rendered, posts record of battle
function postBattle(){
    const hero = document.querySelector('.hero-card') 
    const heroId = parseInt(hero.dataset.id)
    const enemy = document.querySelector('.enemy-card') 
    const enemyId = parseInt(enemy.dataset.id)
    fetch('http://localhost:3000/battles', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            hero: heroId,
            enemy: enemyId
        })
    })
}


//patch to the hero score attribute
function updateHeroScore(){
    const heroCard = document.querySelector('.hero-card')
    const heroId = parseInt(heroCard.dataset.id)
    const score = document.querySelector('.current-score')
    fetch(`http://localhost:3000/heros/${heroId}`, {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            id: heroId,
            score: scoreCounter
        })
    })
    .then(() => {fetchBattleWon()})
}

//changes enemy name to defeated
function updateEnemyName(){
    const enemyCard = document.querySelector('.enemy-card')
    const enemyId = parseInt(enemyCard.dataset.id)
    const enemyName = document.getElementById('enemy-name')
    enemyName.innerText += ' Defeated'
    fetch(`http://localhost:3000/enemies/${enemyId}`, {
        method: 'PATCH',
        headers: {
            'Content-type': 'application/json',
            Accept: 'application/json'
        },
        body: JSON.stringify({
            id: enemyId,
            name: enemyName.innerText
        })
    }).then(() => {raiseEnemyDefeatedToast()})

}

//takes most recent battle won and puts it in the sidebar
function fetchBattleWon(){
    //get hero id
    const heroCard = document.querySelector('.hero-card')
    const heroId = parseInt(heroCard.dataset.id)
    //fetch last battle hero won
    fetch(`http://localhost:3000/heros/${heroId}`)
    .then(res => res.json())
    .then(battle => updateDefeatedEnemiesList(battle))
}

//DOM
function addListenerHeroForm(){
    const form = document.querySelector('form')
    form.addEventListener('submit', createHero)  
}

function renderBattleHeroCard(hero){
    const battleContainer = document.querySelector('.battle-container')
    const div = document.createElement('div')
    div.className = 'hero-card'
    div.dataset.id = hero.id
    
    const img = document.createElement('img')
    img.src = hero.image
    const heroName = document.createElement('h3')
    heroName.innerText = hero.name
    heroName.className = 'truncate'
    
    const health = document.createElement('p')
    health.innerText = `Health: ${hero.health}`
    health.id = 'hero-health'
    
    const meleeBtn = document.createElement('button')
    meleeBtn.innerText = `${hero.melee_attack} Attack`
    meleeBtn.id = 'melee-attack-btn'
    meleeBtn.addEventListener('click', heroAttack)
    
    const rangedBtn = document.createElement('button')
    rangedBtn.innerText = `${hero.ranged_attack} Attack`
    rangedBtn.id = 'ranged-attack-btn'
    rangedBtn.addEventListener('click', heroAttack)

    const specialBtn = document.createElement('button')
    specialBtn.innerText = 'Special Attack'
    specialBtn.id = 'special-attack-btn'
    specialBtn.setAttribute('disabled', 'true')
    specialBtn.addEventListener('click', heroAttack)

    div.append(heroName, img, health, meleeBtn, rangedBtn, specialBtn)
    battleContainer.append(div)

    const score = document.querySelector('.current-score')
    score.innerText = hero.score
}

function renderEnemy(enemy){
    const battleContainer = document.querySelector('.battle-container')
    const div = document.createElement('div')
    div.className = 'enemy-card'
    div.dataset.id = enemy.id
    const img = document.createElement('img')
    img.src = enemy.image
    const name = document.createElement('h3')
    name.innerText = enemy.name
    name.id = 'enemy-name'
    const health = document.createElement('p')
    health.innerText = `Health: ${enemy.health}`
    health.id = 'enemy-health'
    div.append(name, img, health)
    battleContainer.append(div) 

    changeHeaderString('BOSS RUSH')
    enableAttackButtons() 
    changeBackgroundImage()
}

function updateDefeatedEnemiesList(battle){
    const table = document.querySelector('.enemies-defeated')
    const tr = document.createElement('tr')
    const tdImg = document.createElement('td')
    const tdName = document.createElement('td')

    tdName.innerText = battle.enemy.name
    const img = document.createElement('img')
    img.src = battle.enemy.image
    img.className = 'sidebar-enemy-image'
    tdImg.append(img)

    tr.append(tdImg, tdName)
    table.append(tr)

    setTimeout(fetchEnemy, 1000)
}

function addHighScore(hero){
    const table = document.querySelector('.high-scores')
    const tr = document.createElement('tr')
    const tdName = document.createElement('td')
    const tdImg = document.createElement('td')
    const tdScore = document.createElement('td')
    const img = document.createElement('img')
    img.src = hero.image
    img.className = 'high-scores-image'
    tdName.innerText = hero.name
    tdName.className = 'truncate-table'
    tdImg.append(img)
    tdScore.innerText = hero.score
    tdScore.className = 'td-score'
    tr.append(tdImg, tdName, tdScore)
    table.append(tr)
}

function renderCurrentScore(points){
    const score = document.querySelector('.current-score')
    score.innerText = (points + parseInt(score.innerText))
}

function raiseEnemyDefeatedToast(){
    changeHeaderString('Enemy Defeated')
    setTimeout(updateHeroScore, 2000)
}

function disableAttackButtons(){
    const btnA = document.getElementById('melee-attack-btn')
    const btnB = document.getElementById('ranged-attack-btn')
    const btnC = document.getElementById('special-attack-btn')
    btnA.disabled = true
    btnB.disabled = true
    btnC.disabled = true
}

function enableAttackButtons(){
    const btnA = document.getElementById('melee-attack-btn')
    const btnB = document.getElementById('ranged-attack-btn')
    const btnC = document.getElementById('special-attack-btn')
    btnA.disabled = false
    btnB.disabled = false
    if(specialCounter >= 4){
        btnC.disabled = false
        btnC.style.backgroundColor = "green"
    }
}

function changeHeaderString(string){
    const h2 = document.getElementById('header-text')
    h2.innerText = string
}

function clearBattleContainer(){
    scoreCounter = 0
    const battleContainer = document.querySelector('.battle-container')
    while (battleContainer.firstElementChild) {
        battleContainer.firstElementChild.remove()
    }
    const enemyList = document.querySelector('.enemies-defeated')
    while (enemyList.firstElementChild) {
        enemyList.firstElementChild.remove()
    }
    const score = document.querySelector('.current-score')
    score.innerHTML = 0

    const highscores = document.querySelector('.high-scores')
    while (highscores.firstElementChild){
        highscores.firstElementChild.remove()
    }
    fetchHighScores()
}

function addListenerForAvatar(){
    let avatar = document.getElementById('Avatar-set')
    avatar.addEventListener("change", function(e){
        handleAvatarChange(e.target.value)
    })
}

//HANDLERS
function createHero(e){
    e.preventDefault()
    hero = {
        name: e.target['hero-name'].value,
        meleeAttack: e.target['melee-weapon'].value,
        rangedAttack: e.target['ranged-weapon'].value,
        image: e.target['Avatar'].value
    }
    disableCreateHeroForm()
    postHero(hero)
}

function handleAvatarChange(imageLink){
    let hero = document.getElementById('hero-avatar-image')
    hero.src = imageLink
}

function disableCreateHeroForm(){
    const form = document.querySelector('.create-hero')
    form.remove()
}

function changeHealthBackgroundColor(){
    let hero = document.getElementById('hero-health')
    hero.style.removeProperty('background-color')
}

function heroAttack(e){    
    disableAttackButtons()
    specialCounter++
    let damage = 0 
    if(e.target.id == 'melee-attack-btn') {
        damage = Math.floor(Math.random() * (4 + 1)) + 3; //random between 7-3
    } else if (e.target.id == 'ranged-attack-btn'){
        damage = Math.floor(Math.random() * (11 + 1)) + 1; //random between 12-1
    } else if(e.target.id == 'special-attack-btn'){
        specialCounter = 0
        specialAttackBackground()
        updateSpecialAttackGraphic()
        damage = Math.floor(Math.random() * (5 + 1)) + 15;
    }
    shakeEffectOnEnemy()
    updateEnemyDamagePopup(damage)
    scoreCounter += (damage * 100)
    renderCurrentScore((damage * 100))
    
    let enemy = document.getElementById('enemy-health')
    let enemyHealth = parseInt(enemy.innerText.split(' ')[1])
    
    if(enemyHealth - damage < 1) {
        setTimeout(playHealthAddedEffect, 1000)
        enemy.innerText = 'Health: 0'
        backgroundCounter++
        updateEnemyName()
    }
    else{ 
        enemy.innerText = `Health: ${enemyHealth - damage}`
        setTimeout(enemyAttack, 2500)
        enemy.style.backgroundColor = 'red';
   
    }
}

function enemyAttack(){
    let damage = Math.floor(Math.random() * (7 + 1)) + 3; //random between 10-3
    let hero = document.getElementById('hero-health')
    let heroHealth = parseInt(hero.innerText.split(' ')[1])
    shakeEffectOnHero()
    updateHeroDamagePopup(damage)

    let enemy = document.getElementById('enemy-health')

    if(heroHealth - damage < 1) {
        hero.innerText = 'You Are Dead'
        setTimeout(endGame, 2000)
    }
    else{
        enemy.style.removeProperty('background-color')

        hero.innerText = `Health: ${heroHealth - damage}`
        hero.style.backgroundColor = 'red'
        setTimeout(changeHealthBackgroundColor, 1600)
    }
}

function shakeEffectOnHero(){
    const heroCard = document.querySelector('.hero-card')
    heroCard.classList.add('shake')
    setTimeout(() => {heroCard.classList.remove('shake')}, 1500) 
}

function shakeEffectOnEnemy(){
    const enemyCard = document.querySelector('.enemy-card')
    enemyCard.classList.add('shake')
    setTimeout(() => {enemyCard.classList.remove('shake')}, 1500) 
}

function updateEnemyDamagePopup(damage){
    const enemyPopup = document.getElementById('enemy-damage')
    enemyPopup.innerText = `-${damage}`
    enemyPopup.className = "show";
  
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ enemyPopup.className = enemyPopup.className.replace("show", ""); }, 1400);
}

function updateHeroDamagePopup(damage){
    const heroPopup = document.getElementById('hero-damage')
    heroPopup.innerText = `-${damage}`
    heroPopup.className = "show"
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ 
        heroPopup.className = heroPopup.className.replace("show", "")
        enableAttackButtons()
    }, 1400);
}

function updateSpecialAttackGraphic(){
    const special = document.getElementById('special-attack-graphic')
    special.className = "show-effect"
    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){ 
        special.className = special.className.replace("show-effect", "")
    }, 1400);
}

function playHealthAddedEffect(){
    let healthToAdd = Math.floor(Math.random() * (7 + 1)) + 1; //random between 8-1
    const heroPopup = document.getElementById('hero-health-added')
    heroPopup.innerText = `+${healthToAdd}`
    heroPopup.className = "show"
    
    setTimeout(function(){ 
        heroPopup.className = heroPopup.className.replace("show", "")
        increaseHeroHealth(healthToAdd)
    }, 700);

}

function increaseHeroHealth(healthToAdd){
    let hero = document.getElementById('hero-health')
    let heroHealth = parseInt(hero.innerText.split(' ')[1])
    hero.innerText = `Health: ${heroHealth + healthToAdd}`
    hero.style.backgroundColor = 'green'
    setTimeout(changeHealthBackgroundColor, 1600)
}

function endGame(){
    clearBattleContainer()
    backgroundCounter = 1
    document.body.style.background = "url('https://i.pinimg.com/originals/d3/a4/98/d3a498f8838f5046ba13cde9af643250.gif')no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
    const body = document.querySelector('body')
    body.append(heroForm)
}

addListenerHeroForm()
fetchHighScores()
addListenerForAvatar()

function changeBackgroundImage(){
if(backgroundCounter >= 16){
    document.body.style.background = "url('https://i.imgur.com/lOT25Y3.gif')no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
} else if(backgroundCounter >= 11){
    document.body.style.background = "url('./assets/backgrounds/bulkhead-wallsx3.png')no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
} else if (backgroundCounter >= 6){
    document.body.style.background = "url('https://i.pinimg.com/originals/d2/96/74/d296744858b6f4059d016874ef7561b2.gif') no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
} else {
    document.body.style.background = "url('https://i.pinimg.com/originals/d3/a4/98/d3a498f8838f5046ba13cde9af643250.gif')no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
}
}

function specialAttackBackground(){
    document.body.style.background = "url('https://www.cabtivist.com/photo/825x477_upload.wikimedia.org/wikipedia/commons/thumb/d/d6/WarpTrails001.gif/258px-WarpTrails001.gif') no-repeat center center fixed"
    document.body.style.backgroundSize = 'cover'
    setTimeout(changeBackgroundImage, 2000)
}

//https://i.imgur.com/lOT25Y3.gif