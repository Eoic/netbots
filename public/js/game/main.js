/** GAME PROPERTIES */
const MAP_WIDTH = 674
const MAP_HEIGHT = 464
const ZOOM_SCALE = 0.95
const MIN_ZOOM = 0.75
const MAX_ZOOM = 2.4
const ROBOT_SCALE = 0.15
const PROJECTILE_POOL_SIZE = 20
const MOVEMENT_SPEED = 75
const spritesDir = '/img/sprites'
const playerObjectKeys = ['playerOne', 'playerTwo']
const initPositions = [
    { x: 40, y: 40, rotation: 0 },
    { x: 630, y: 420, rotation: 0 }
]
const baseAnchor = { x: 0.5, y: 0.5 }
const turretAnchor = { x: 0.3, y: 0.5 }

let mouseCoordinates = document.getElementById('game-coordinates')
let timerText = new PIXI.Text('0:00', {
    fontFamily: 'Arial',
    fill: '#FFFFFF',
    fontSize: 32,
    align: 'center'
})
timerText.visible = false

/** GAME INFO CONTAINER */
let gameInfo = [];

/** ZOOM INDICATOR */
let canZoom = false

/** LOADING BLANKET */
let loadingWindow = document.getElementById('loader-section')
let loadingProgress = document.getElementById('progress-foreground')
let roundCounter = document.getElementById('round-counter')

gameInfo[0] = {
    playerHP: document.getElementById('player-one-hp'),
    playerEN: document.getElementById('player-one-en'),
    playerHPVal: document.getElementById('player-one-hp-val'),
    playerENVal: document.getElementById('player-one-en-val'),
}

gameInfo[1] = {
    playerHP: document.getElementById('player-two-hp'),
    playerEN: document.getElementById('player-two-en'),
    playerHPVal: document.getElementById('player-two-hp-val'),
    playerENVal: document.getElementById('player-two-en-val'),
}

// Setup PixiJS renderer
let gameMap = document.getElementById('game-map');
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.LINEAR;

let app = new PIXI.Application({
    autoResize: true,
    width: window.innerWidth - 270,
    height: window.innerHeight - 40,
    backgroundColor: 0x2a2a2a,
    antialias: true
});

gameMap.appendChild(app.view);

const loader = PIXI.loader;         // Resources loader
const map = new PIXI.Container();   // Map container
const sprites = {}                  // Loaded sprites
let gameObjects = {}                // Created game objects displayed on client side
let bulletTexture = {}              // Robot bullet textures
let bulletSprite = {}               // Robot bullet sprites

/**
 * Add resources to load from public folder
 */
loader.add('map', `${spritesDir}/map-prop.png`)
    .add('robotBase', `${spritesDir}/robot_base.png`)
    .add('robotTurret', `${spritesDir}/robot_turret.png`)
    .add('bullet', `${spritesDir}/bullet.png`)
    .on('progress', loadingProgressHandler);

/**
 * Load all resources added to loader
 */
loader.load((_loader, resources) => {
    playerObjectKeys.forEach(key => {
        let keyUpperCase = key.charAt(0).toUpperCase() + key.slice(1)
        sprites['robotBase' + keyUpperCase] = new PIXI.Sprite(resources.robotBase.texture)
        sprites['robotTurret' + keyUpperCase] = new PIXI.Sprite(resources.robotTurret.texture)
        bulletTexture = resources.bullet.texture
    })

    sprites.map = new PIXI.Sprite(resources.map.texture);
});

/**
 * Called once game resources are loaded
 */
loader.onComplete.add(() => {
    playerObjectKeys.forEach((key, index) => {

        // Set graphics anchor points
        let keyUpperCase = key.charAt(0).toUpperCase() + key.slice(1)
        let baseSpriteKey = 'robotBase' + keyUpperCase
        let turretSpriteKey = 'robotTurret' + keyUpperCase
        sprites[baseSpriteKey].anchor.set(baseAnchor.x, baseAnchor.y)
        sprites[turretSpriteKey].anchor.set(turretAnchor.x, turretAnchor.y)

        // Create player instances
        gameObjects[key] = createPlayerInstance(sprites[baseSpriteKey], sprites[turretSpriteKey], initPositions[index])
    })

    map.pivot.set(sprites.map.width / 2, sprites.map.height / 2)
    map.addChild(sprites.map);

    playerObjectKeys.forEach(key => {
        map.addChild(gameObjects[key])
        gameObjects[key].bullets = createProjectilePool()
    })

    createRobotNames()
    createFovMarkers()

    app.stage.addChild(map);
    loadMapCoordinates();

    // Finally, hide loading window and start game loop
    setTimeout(() => {
        createTimer()
        loadingWindow.style.visibility = 'hidden'
    }, 1000)
})

/**
 * Updates game loading bar
 * @param {Object} loader 
 * @param {Object} _resource 
 */
function loadingProgressHandler(loader, _resource) {
    loadingProgress.style.width = loader.progress + '%'
}

/**
 * Returns robot sprite with initial position in game scene
 * @param {Object} spriteBase 
 * @param {Object} spriteTurret 
 * @param {Object} initialPosition  
 */
function createPlayerInstance(spriteBase, spriteTurret, initialPosition) {
    let player = new PIXI.Container()
    spriteBase.filters = [
        new PIXI.filters.DropShadowFilter({
            pixelSize: 2,
            distance: 8
        })
    ]
    player.addChild(spriteBase)
    player.addChild(spriteTurret)
    player.scale.set(ROBOT_SCALE, ROBOT_SCALE)
    player.position.set(initialPosition.x, initialPosition.y)
    player.rotation = initialPosition.rotation
    return player
}

/**
 * Creates array of projectile sprites used by robot
 */
function createProjectilePool() {
    let bullets = []

    for (let i = 0; i < PROJECTILE_POOL_SIZE; i++) {
        let bulletSprite = new PIXI.Sprite(bulletTexture)
        bulletSprite.filters = [ new PIXI.filters.GlowFilter(15, 2, 1, 0x1138A8, 0.5) ]
        bullets.push(bulletSprite)
        bullets[i].visible = false
        bullets[i].anchor.set(0.1, 0.5)
        map.addChild(bullets[i])
    }

    return bullets
}

/**
 * Resets positions and rotation of all projectiles
 * in projectile pool array
 */
function resetProjectilePool() {
    playerObjectKeys.forEach(key => {
        gameObjects[key].bullets.forEach(bullet => {
            bullet.x = 0
            bullet.y = 0
            bullet.rotation = 0
            bullet.visible = false
        })
    })
}

/**
 * Called on map drag start
 */
function onDragStart(event) {
    this.data = event.data;
    this.dragging = true;
    this.startPosition = this.data.getLocalPosition(this)
}

/**
 * Called while map is being dragged.
 */
function onDragMove(event) {
    if (this.dragging) {
        let newPosition = this.data.getLocalPosition(this.parent);
        this.x = (newPosition.x + map.pivot.x * map.scale.x) - (this.startPosition.x * map.scale.x);
        this.y = (newPosition.y + map.pivot.y * map.scale.y) - (this.startPosition.y * map.scale.y);
    }

    trackMouseCoordinates(event.data.getLocalPosition(this))
}

/**
 * Updates right sidebar whitch displays robot health and energy
 * @param {Number} playerIndex Player position in array
 * @param {Number} hp Health points 
 * @param {Number} en Energy points
 */
function updateGameInfoPanel(playerIndex, hp, en) {
    gameInfo[playerIndex].playerHP.innerText = hp;
    gameInfo[playerIndex].playerEN.innerText = en;
    gameInfo[playerIndex].playerHPVal.value = hp;
    gameInfo[playerIndex].playerENVal.value = en;
}

/**
 * Called once when map dragging has ended.
 */
function onDragEnd() {
    this.dragging = false;
    this.data = null;
    saveMapCoordinates();
}

/**
 * Set map to be interactable with pointer and
 * add pointer events for dragging and moving
 */
map.interactive = true;
map.on('pointerdown', onDragStart)
    .on('pointerup', onDragEnd)
    .on('pointerupoutside', onDragEnd)
    .on('pointermove', onDragMove)
    .on('mouseover', () => { canZoom = true; })
    .on('mouseout', () => canZoom = false)

/**
 * Add event listener for window
 */
window.onresize = () =>
    app.renderer.resize(window.innerWidth - 270, window.innerHeight - 40);

/**
 * Add event listener for map zooming
 * using mouse wheel
 */
window.addEventListener('wheel', (event) => {
    if (canZoom) {
        if (event.deltaY < 0) {
            map.scale.x = clampNumber(map.scale.x * ZOOM_SCALE, MIN_ZOOM, MAX_ZOOM)
            map.scale.y = clampNumber(map.scale.x * ZOOM_SCALE, MIN_ZOOM, MAX_ZOOM)
        } else {
            map.scale.x = clampNumber(map.scale.x / ZOOM_SCALE, MIN_ZOOM, MAX_ZOOM)
            map.scale.y = clampNumber(map.scale.x / ZOOM_SCALE, MIN_ZOOM, MAX_ZOOM)
        }
    }
}, {
        passive: true,
        capture: true
    })

/**
 * Limits number value to defined min and max bounds
 * @param {Number} value 
 * @param {Number} min 
 * @param {Number} max 
 */
function clampNumber(value, min, max) {
    return Math.max(min, Math.min(value, max))
}

/**
 * Saves map position in game scene to local storage
 */
function saveMapCoordinates() {
    const position = {
        x: map.position.x,
        y: map.position.y
    }

    localStorage.setItem('mapPosition', JSON.stringify(position))
}

/**
 * Tries to load game map coordinates from local storage.
 */
function loadMapCoordinates() {
    let position = JSON.parse(localStorage.getItem('mapPosition'));

    if (position !== null)
        map.position.set((window.innerWidth - 270) / 2, position.y);
    else
        map.position.set((window.innerWidth - 270) / 2, window.innerHeight / 2);
}

/**
 * Updates projectile positions on the map
 * @param {Array} bullets 
 * @param {String} key 
 */
function updateProjectiles(bullets, key) {
    bullets.forEach((bullet, index) => {
        gameObjects[key].bullets[index].x = bullet.x
        gameObjects[key].bullets[index].y = bullet.y
        gameObjects[key].bullets[index].visible = bullet.isAlive
        gameObjects[key].bullets[index].rotation = bullet.rotation
    })
}

/**
 * Define socket server connection type
 */
const connectionType = (window.location.hostname === 'localhost') ? 'ws://' : 'wss://';
const connectionString = `${connectionType}${window.location.host}`;

let socket = new WebSocket(connectionString);

socket.onopen = (_event) => {
    displayMessage('success', 'Connected to server')
}

socket.onmessage = (event) => {
    let payload = JSON.parse(event.data);

    if (typeof payload.type === 'undefined')
        return;

    switch (payload.type) {
        case 'GAME_TICK_UPDATE':

            // Update positions
            playerObjectKeys.forEach((key, index) => {
                gameObjects[key].position = { x: payload[key].x, y: payload[key].y }
                gameObjects[key].rotation = payload[key].rotation
                gameObjects[key].getChildAt(1).rotation = payload[key].turretRotation
                updateProjectiles(payload[key].bulletPool, key)
                updateMultiplayerInfo(payload.gameSession)
            })

            // Update output
            if (payload.gameType === 'S') {
                payload.messages.forEach(item => {
                    appendMessage(item.content, item.type)
                });
            }

            updateGameInfoPanel(0, payload.playerOne.health, payload.playerOne.energy)
            updateGameInfoPanel(1, payload.playerTwo.health, payload.playerTwo.energy)
            break;
        case 'PLAYER_NAMES':
            setPlayerNames(payload.names.playerOne, payload.names.playerTwo)
            playerObjectKeys.forEach(key => updateRobotName(key, payload.names[key]))
            break;
        case 'GAME_END':
            showMatchEndStatistics(payload.gameData, payload.totalTime)
            break;
    }
}

socket.onclose = (_event) => {
    displayMessage('warning', 'Disconnected')
}

/**
 * If enemy is selected, gets enemy code from db and send
 * received value through web socket initialize new game session
 */
function runScript(type) {

    resetProjectilePool()

    if (!document.querySelector('.btn-active') === null || editor.getValue().trim() === '') {
        displayMessage('error', 'Nothing to run...');
        return;
    }

    let selected = document.getElementById('scripts-dropdown')

    if (selected !== null) {

        displayMessage('warning', 'Running script...')

        let request = new XMLHttpRequest();

        request.open('POST', `${window.location.origin}/scripts/run-code`, true);
        request.responseType = 'json';
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify({
            enemy: selected.value.trim()
        }));

        request.onreadystatechange = (_event) => {
            if (request.readyState === 4 && request.status === 200) {
                socket.send(JSON.stringify({
                    enemyCode: request.response.enemyCode,
                    playerCode: editor.getValue(),
                    type
                }))
            }
        }
    }
}

/**
 * End socket connection
 */
function endSession() {
    socket.close();
}

/**
 * Updates mouse coordinates in game info sidebar
 * @param {Object} coordinates Local mouse coordinates on game map
 */
function trackMouseCoordinates(coordinates) {
    mouseCoordinates.innerText = `X: ${Math.round(coordinates.x)}  Y: ${Math.round(coordinates.y)}`
}

function createTimer() {
    timerText.x = (window.innerWidth - 260) / 2
    timerText.y = 70
    app.stage.addChild(timerText)
    //app.stage.swapChildren(app.stage.children[0], app.stage.children[1])
}

function updateTimer(seconds) {
    let s = seconds % 60
    timerText.text = `${Math.floor(seconds / 60)}:${(s < 10) ? '0' + s : s}`
}

function updateMultiplayerInfo(gameInfo) {
    if (gameInfo === null)
        return

    updateTimer(Math.round(gameInfo.elapsedTicks / 30))
    roundCounter.innerText = gameInfo.elapsedRounds
}

function clearTimer() {
    timerText.text = '0:00'
}

// Additional graphics (for fov, etc)
function createFovMarkers() {
    playerObjectKeys.forEach(key => {
        const triangle = createTriangle()
        triangle.visible = false
        gameObjects[key].getChildAt(1).addChild(triangle)
    })
}

function createTriangle() {
    const triangle = new PIXI.Graphics()

    triangle.beginFill(0x445aff, 0.2);

    triangle.moveTo(0, 0);
    triangle.lineTo(4500, -400);
    triangle.lineTo(4500, 400);
    triangle.lineTo(0, 0);
    triangle.endFill();

    return triangle
}

function toggleFov() {
    playerObjectKeys.forEach(key => {
        const visible = gameObjects[key].getChildAt(1).getChildAt(0).visible
        gameObjects[key].getChildAt(1).getChildAt(0).visible = !visible
    })
}

function createRobotNames() {
    playerObjectKeys.forEach(key => {
        let nameText = new PIXI.Text("<placeholder>", {
            fontFamily: 'Arial',
            fill: '#FFFFFF',
            fontSize: 85,
            align: 'center'
        })
        nameText.visible = false
        nameText.position.set(-170, -250)
        gameObjects[key].addChild(nameText)
    })
}

function toggleRobotNames() {
    playerObjectKeys.forEach(key => {
        const visible = gameObjects[key].getChildAt(2).visible
        gameObjects[key].getChildAt(2).visible = !visible
    })
}

function updateRobotName(playerKey, name) {
    if(typeof gameObjects[playerKey] === 'undefined')
        return;
        
    gameObjects[playerKey].getChildAt(2).text = name
}

// Show overlay with data
function showMatchEndStatistics(data, totalTime) {
 
    let statisticsTable = document.getElementById('statistics-body')

    data.forEach(item => {
        let tableRow = document.createElement('tr')
        tableRow.appendChild(createTableCell(item.name))
        tableRow.appendChild(createTableCell(item.statistics.damageDone))
        tableRow.appendChild(createTableCell(item.statistics.shotsFired))
        tableRow.appendChild(createTableCell(`${calculateDamageDone(item.statistics.shotsFired, item.statistics.damageDone)} %`))
        tableRow.appendChild(createTableCell(item.statistics.roundsWon))
        statisticsTable.appendChild(tableRow)
    })

    document.getElementById('ticks').innerText = totalTime
    document.getElementById('seconds').innerText = Math.floor(totalTime / 30)
    document.getElementById('overlay').style.visibility = 'visible'
}

function createTableCell(innerText) {
    let tableCell = document.createElement('td')
    tableCell.innerText = innerText
    return tableCell
}

function calculateDamageDone(shotsFired, damageDone) {
    if(shotsFired === 0)
        return 0
    
    let accuracy = damageDone / (shotsFired * 20) * 100
    return Math.round(accuracy * 100) / 100;
}