/*
*
  *  NEW SCRIPT FROM HERE
*
*/

const HOW_MANY_REQUEST_PER_ROUND = 25
const HOW_MANY_ROUNDS_PER_CYCLE = 5
const MIN_WAIT_PER_ROUND = 15000
const MAX_WAIT_PER_ROUND = 30000
const MIN_WAIT_PER_CYCLE = 60000
const MAX_WAIT_PER_CYCLE = 120000
const MAX_MIN_BID = 600

const CHEM_STYLES = {
    NORMAL: '.playStyle.chemstyle250'
}

const ELEMENT_SELECTOR = {
    DIALOG: ".ea-dialog-view"
}

let buyAttempts = 0
let boughtPlayers = 0

let intervals = [];
var clock = document.createElement("div");
clock.style.backgroundColor = "white"
clock.style.color = "black"
clock.style.padding = "12px"
clock.style.fontSize = "48px"
clock.style.fontWeight = 'bold'
clock.style.position = "fixed"
clock.style.top = "0"
clock.style.left = "520px"
clock.style.height = "100px"
clock.style.width = "80px"
clock.style.overflowY = 'scroll'
clock.style.opacity = '0.8'
clock.style.display = 'flex'
clock.style.justifyContent = 'center'
clock.style.alignItems = 'center'

var stats = document.createElement("div");
stats.style.backgroundColor = "white"
stats.style.color = "black"
stats.style.padding = "12px"
stats.style.fontSize = "16px"
stats.style.fontWeight = 'bold'
stats.style.position = "fixed"
stats.style.top = "120px"
stats.style.left = "520px"
stats.style.height = "64px"
stats.style.width = "auto"
stats.style.opacity = '0.8'
stats.style.display = 'flex'
stats.style.justifyContent = 'center'
stats.style.alignItems = 'center'



const setClock = (miliseconds) => {
    let remaining = miliseconds;
    clock.innerText = Math.round(remaining / 1000)
    const timer = setInterval(() => {
        remaining = (remaining - 100) >= 0 ? remaining - 100 : 0
        clock.innerText = Math.round(remaining / 1000)
        if(remaining <= 0) {
            clearInterval(timer)
        }
    }, 100)
}

const dispatchClick = (node) => {
    triggerMouseEvent (node, "mouseover");
    triggerMouseEvent (node, "mousedown");
    triggerMouseEvent (node, "mouseup");
    triggerMouseEvent (node, "click")
}

const triggerMouseEvent = async (node, eventType) => {
    try {
        var clickEvent = document.createEvent ('MouseEvents');
        clickEvent.initEvent (eventType, true, true);
        node.dispatchEvent (clickEvent);
    } catch (e) {
        
    }
}

function sleep(ms) {
    // add ms millisecond timeout before promise resolution
    setClock(ms)
    return new Promise(resolve => setTimeout(resolve, ms))
}

var intervalAceptar = null
var intervalItemClick = null
var intervalErrorNotification = null
var imageIntervals = []
const imageReady = () => {
    return new Promise(resolve => {
        imageIntervals = [...imageIntervals, setInterval(() => {
            if(document.querySelector('.tns-slide-active .large.player.item.ut-item-loaded')) {
                resolve({item: document.querySelector('.tns-slide-active .large.player.item.ut-item-loaded')})
            }
            if(document.querySelectorAll('.large.player.item.ut-item-loaded').length === 1) {
                resolve({item: document.querySelector('.large.player.item.ut-item-loaded')})
            }
        }, 100)]
    })
}

const buyIt = () => {
    let canClick = true
    let canAccept = false
    let canDismissNotification = true
    buyAttempts++
    stats.innerText = `Comprados ${boughtPlayers} de ${buyAttempts}`

    return new Promise(async (resolve) => {
        const { item } = await imageReady()
        setMessage('Se cargó la imagen')
        imageIntervals.forEach(interval => {
            clearInterval(interval)
        })
        if(item && item.querySelector(CHEM_STYLES.NORMAL)) {
            resolve({response: 'BUY_KO'})
            setMessage('El artículo no tiene estilo de química')
        } else {
            intervalAceptar = setInterval(async () => {
                let dialog = document.querySelector('.ea-dialog-view')
                if(dialog) {
                    let btn = dialog.querySelectorAll('button')[0]
                    if(btn && canAccept) {
                        canAccept = false
                        try {
                            dispatchClick(btn)
                            await sleep(500)
                            const sellButton = document.querySelector('.ut-quick-list-panel-view')
                            // TODO: Have to check the screen until the item is already purchased or it fails
                            if(sellButton) {
                                boughtPlayers++
                                stats.innerText = `Comprados ${boughtPlayers} de ${buyAttempts}`
                                resolve({response: 'BUY_OK'})
                            }
                        } catch(e) {
                            brakeIt()
                        }
                    }
                }
            }, 50)
            intervals = [...intervals, intervalAceptar]
            intervalItemClick = setInterval(() => {
                let buyButton = document.querySelector('.buyButton')
                if(buyButton && canClick) {
                    canAccept = true
                    canClick = false
                    try {
                        if(intervalItemClick) clearInterval(intervalItemClick)
                        dispatchClick(buyButton)
                    } catch (e) {
                        brakeIt()
                    }
                }
            }, 50)
            intervals = [...intervals, intervalItemClick]
            intervalErrorNotification = setInterval(async () => {
                const notification = document.querySelector('#NotificationLayer');
                if(notification) {
                    await sleep(300)
                    const close = notification.querySelector('.icon_close')
                    if(close && canDismissNotification) {
                        try {
                            if(intervalErrorNotification) clearInterval(intervalErrorNotification)
                            if(intervalAceptar) clearInterval(intervalAceptar)
                            if(intervalItemClick) clearInterval(intervalItemClick)
                            dispatchClick(close)
                            resolve({response: 'BUY_KO'})
                        } catch (e) {
                            brakeIt()
                        }
                    }
                }
            }, 50)
            intervals = [...intervals, intervalErrorNotification]
        } 
    })
}

var intervalAtLeastOneItem = null
var intervalNoResults = null

var getResults = () => {
    let resultsAlready = false
    let noResultsAlready = false
    return new Promise(resolve => {
        intervalAtLeastOneItem = setInterval(() => {
            const results = document.querySelectorAll('.listFUTItem')
            if(results && results.length > 0 && !resultsAlready) {
                resultsAlready = true
                const lastItem = results[results.length - 1]
                const clickableItem = lastItem.querySelector('.rowContent')
                try {
                    dispatchClick(clickableItem)
                    clearInterval(intervalAtLeastOneItem)
                    resultsAlready = true
                    resolve({response: 'CLICKED_RESULT'})
                } catch(e) {
                    brakeIt()
                }
            }
        }, 100)
        intervals = [...intervals, intervalAtLeastOneItem]

        intervalNoResults = setInterval(() => {
            const noResults = document.querySelector('.ut-no-results-view')
            if(noResults && !noResultsAlready) {
                clearInterval(intervalNoResults)
                noResultsAlready = true
                resolve({response: 'NO_RESULTS'})
            }
        }, 100)
        intervals = [...intervals, intervalNoResults]
    })
}

var decrease = false
var running = true
var request = 0
var rounds = 0
var roundClock = document.createElement("div");
roundClock.style.backgroundColor = "white"
roundClock.style.color = "black"
roundClock.style.padding = "12px"
roundClock.style.fontSize = "48px"
roundClock.style.fontWeight = 'bold'
roundClock.style.position = "fixed"
roundClock.style.top = "0"
roundClock.style.left = "620px"
roundClock.style.height = "100px"
roundClock.style.width = "80px"
roundClock.style.overflowY = 'scroll'
roundClock.style.opacity = '0.8'
roundClock.style.display = 'flex'
roundClock.style.justifyContent = 'center'
roundClock.style.alignItems = 'center'
const updateRequestsClock = () => {
    roundClock.innerText = HOW_MANY_REQUEST_PER_ROUND - request
    request ++
}
var search = async() => {
    const minusPlusBtns = (index) => document.querySelectorAll('.btn-standard')[index]
    const minBidMinus = () => minusPlusBtns(0)
    const minBidPlus = () => minusPlusBtns(1)
    const buyNowMinMinus = () => minusPlusBtns(4)
    const buyNowMinPlus = () => minusPlusBtns(5)
    const buyNowMinus = () => minusPlusBtns(6)
    const buyNowPlus = () => minusPlusBtns(7)

    const inputs = (index) => document.querySelectorAll('.ut-number-input-control')[index]
    const minBidInput = () => inputs(0)
    const minBuyInput = () => inputs(2)
    const maxBuyInput = () => inputs(3)

    const searchButton = () => document.querySelector('.btn-standard.call-to-action')
    const navigateBackButton = () => document.querySelector('.ut-navigation-button-control')
    pr.innerHTML = '';
    intervals.forEach(intervalID => {
        clearInterval(intervalID)
    })
    intervals = []
    const getRandomSleep = (max, min) => {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    if(!running) {
        return
    }
    if(request > HOW_MANY_REQUEST_PER_ROUND) {
        const time = getRandomSleep(MAX_WAIT_PER_ROUND, MIN_WAIT_PER_ROUND)
        await sleep(time);
        request = 0
        rounds ++
    }
    // if(rounds >= HOW_MANY_ROUNDS_PER_CYCLE) {
    //     const howMuchTime = getRandomSleep(MAX_WAIT_PER_CYCLE, MIN_WAIT_PER_CYCLE)
    //     await sleep(howMuchTime)
    //     rounds = 0
    // }
    await sleep(100)
    updateRequestsClock()
    
    if(minBidInput()?.value > MAX_MIN_BID) {
        decrease = true
    } 
    if(minBidInput()?.value == "") {
        decrease = false
    }

    // TODO: Set bid and buy now prices randomly from a list
    dispatchClick(decrease ? minBidMinus() : minBidPlus())
    await sleep(100)
    dispatchClick(request % 4 === 0 ? buyNowMinPlus() : buyNowMinMinus())
    await sleep(100)
    dispatchClick(request % 2 === 0 ? buyNowMinus() : buyNowPlus())
    dispatchClick(searchButton())
    await sleep(300)
    const {response} = await getResults()
    setMessage('CLICKED_RESULT...')
    if(response === 'CLICKED_RESULT') {
        const buyResponse = await buyIt()
        if(buyResponse.response === 'BUY_OK') {
            setMessage('Artículo comprado!')
            const buttonGroup = document.querySelector('.DetailPanel>.ut-button-group')
            const sendToPile = buttonGroup.querySelectorAll('button')[7]
            dispatchClick(sendToPile)
            await sleep(200)
            dispatchClick(navigateBackButton())
            search()
        } else if(buyResponse.response === 'BUY_KO') {
            const close = document.querySelector('.icon_close')
            if(close) {
                dispatchClick(close)
            }
            setMessage('No ha sido posible comprar el artículo')
            await sleep(500)
            dispatchClick(navigateBackButton())
            search()
        }
    } else if(response === 'NO_RESULTS') {
        try {
            setMessage('No hemos encontrado nada en el mercado')
            dispatchClick(navigateBackButton())
            
            search()
        } catch(e) {
            brakeIt()
        }
    }
}

const searchAndBuy = async () => {
    const searchButton = () => document.querySelector('.btn-standard.call-to-action')
    dispatchClick(searchButton())

    const {response} = await getResults()
    if(response === 'CLICKED_RESULT') {
        const buyResponse = await buyIt()
        if(buyResponse.response === 'BUY_OK') {
            setMessage('Artículo comprado!')
            const buttonGroup = document.querySelector('.DetailPanel>.ut-button-group')
            const sendToPile = buttonGroup.querySelectorAll('button')[7]
            dispatchClick(sendToPile)
            await sleep(200)
            dispatchClick(navigateBackButton())
            search()
        } else if(buyResponse.response === 'BUY_KO') {
            const close = document.querySelector('.icon_close')
            if(close) {
                dispatchClick(close)
            }
            setMessage('No ha sido posible comprar el artículo')
            await sleep(4000)
            dispatchClick(navigateBackButton())
            search()
        }
    } else if(response === 'NO_RESULTS') {
        // Nothing...
    }
}

var searchButton = document.createElement("button");
searchButton.innerHTML = 'START'
searchButton.style.width = "120px"
searchButton.style.backgroundColor = "black"
searchButton.style.color = "white"
searchButton.style.padding = "12px"
searchButton.style.position = "fixed"
searchButton.style.top = "0"
searchButton.style.right = "0"
searchButton.onclick = () => {
    running = true
    search()
    setMessage("Searching...")
}
var stopButton = document.createElement("button");
stopButton.innerHTML = 'STOP'
stopButton.style.width = "120px"
stopButton.style.backgroundColor = "red"
stopButton.style.color = "white"
stopButton.style.padding = "12px"
stopButton.style.position = "fixed"
stopButton.style.top = "0"
stopButton.style.right = "240px"
stopButton.onclick = () => {
    running = false
    try {
        intervals.forEach(intervalID => {
            clearInterval(intervalID)
        })
        intervals = []
        rounds = 0
        request = 0
        canClick = false
        canAccept = false
        canDismissNotification = false
        stop = true
    } catch(e) {
        setMessage("No pude parar los intervals")
    }
    setMessage("Stopping...")
}

var pr = document.createElement("div");
pr.style.backgroundColor = "white"
pr.style.color = "black"
pr.style.padding = "12px"
pr.style.fontSize = "10px"
pr.style.position = "fixed"
pr.style.top = "0"
pr.style.left = "150px"
pr.style.height = "400px"
pr.style.width = "320px"
pr.style.overflowY = 'scroll'
pr.style.opacity = '0.8'


const newElement = (text) => {
    const item = document.createElement("div");
    item.style.backgroundColor = "#f3f3f3"
    item.style.color = "black"
    item.style.padding = "12px"
    item.style.fontSize = "10px"
    item.style.height = "auto"
    item.style.overflowY = 'scroll'
    item.style.borderColor = '#333'
    item.style.borderWidth = "1px"
    item.innerHTML = text

    return item
}

const setMessage = (text) => {
    pr.appendChild(newElement(text))
}

document.body.appendChild(searchButton);
document.body.appendChild(stopButton);
document.body.appendChild(pr);
document.body.appendChild(clock);
document.body.appendChild(roundClock);
document.body.appendChild(stats);

const minusPlusBtns = (index) => document.querySelectorAll('.btn-standard')[index]
const minBidMinus = () => minusPlusBtns(0)
const minBidPlus = () => minusPlusBtns(1)
const buyNowMinMinus = () => minusPlusBtns(4)
const buyNowMinPlus = () => minusPlusBtns(5)
const buyNowMinus = () => minusPlusBtns(6)
const buyNowPlus = () => minusPlusBtns(7)

document.addEventListener('keydown', (e) => {
    const {code} = e;
    switch (code) {
        case "Space":
            searchAndBuy()
            break;
        case "ArrowLeft":
            dispatchClick(buyNowMinPlus())
            break;
        case "ArrowRight":
            dispatchClick(buyNowMinMinus())
            break;
        case "ArrowUp":
            dispatchClick(buyNowPlus())
            break;
        case "ArrowDown":
            dispatchClick(buyNowMinus())
            break;
        case "ShiftRight":
            const navigateBackButton = () => document.querySelector('.ut-navigation-button-control')
            dispatchClick(navigateBackButton())
            break;
        default:
            break;
    }
})