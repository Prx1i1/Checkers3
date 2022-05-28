class Net {
    constructor() {
        this.playerWhiteLoggedIn = false;
        this.playerBlackLoggedIn = false;

        this.intervalid = 0;
    }

    login(onLogin) {
        const login = document.getElementById("login-input").value
        fetch("/timereset", {method: "post"}).then(response => response.json())
        console.log("login");

        if (login != "") {
            const body = JSON.stringify({ login: login })

            const headers = { "Content-Type": "application/json" }

            fetch("/login", { method: "post", body, headers })
                .then(response => response.json())
                .then(
                    data => {
                        if (data.isPlayer) {
                            onLogin(login, data.color)
                            window.game.isWhite = data.color == 0
                            document.getElementById("login-errors").innerHTML = ""
                        } else {
                            switch (data.error) {
                                case 0:
                                    document.getElementById("login-errors").innerHTML = "two players already in game"
                                    break;
                                case 1:
                                    document.getElementById("login-errors").innerHTML = "user with that name is already in the game"
                                    break;
                                default:
                                    document.getElementById("login-errors").innerHTML = "unknown error"
                            }
                        }
                    }
                )
        }

        clearInterval(this.intervalid)
        this.intervalid = setInterval(this.update, 1000);
    }

    update() {
        let body = null

        if (!window.game.isPlaying) {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }
        else {
            body = JSON.stringify({
                isPlaying: window.game.isPlaying,
                isWhite: window.game.isWhite,
            })
        }


        const headers = { "Content-Type": "application/json" }

        fetch("/update", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    if (data.state == 3) {
                        console.log("move data from server:", data)
                        window.game.hasMove = true
                        console.log("sending to player")
                        window.game.enemyMove(data.move.from, data.move.to)

                    } else if (data.state == 2) {
        
                    } else if (data.state == 1) {
                        console.log("game start")
                        fetch("/timereset", {method: "post"})

                        document.getElementById("display").style.display = "none"
                        window.game.load()
                    } else {

                    }
                    window.ui.updateTimer(window.game.gameIsAlive ? data.time : 30)
                    let player = window.game.hasMove ? window.game.isWhite : !window.game.isWhite
                    window.ui.updateTurns(player)
                    if(data.time >= 30){
                        window.game.gameIsAlive = false

                        if(window.game.hasMove){
                            console.log("gameover lose")
                            document.getElementById("display").style.display = "block"
                            document.getElementById("display").innerText = "YOU LOST!"
                            window.game.gameIsAlive = false
                        }else{
                            console.log("gameover win")
                            document.getElementById("display").style.display = "block"
                            document.getElementById("display").innerText = "YOU WON!"
                            window.game.gameIsAlive = false
                        }
                    }else{
                        window.game.gameIsAlive = true
                    }

                }
            )
    }

    move(from, to, taking) {
        console.log("sent move")
        fetch("/timereset", {method: "post"})

        const body = JSON.stringify({
            isWhite: window.game.isWhite,
            isTaking: taking,
            from: from,
            to: to,
        })

        const headers = { "Content-Type": "application/json" }

        fetch("/move", { method: "post", body, headers })
            .then(response => response.json())
            .then(data => {

            }
            )
    }

    reset() {
        window.game.gameIsAlive = true
        const body = JSON.stringify({ reset: "reset" })
        const headers = { "Content-Type": "application/json" }

        document.getElementById("login-errors").innerHTML = "players reset"

        fetch("/reset", { method: "post", body, headers })
            .then(response => response.json())
            .then(
                data => {
                    clearInterval(this.intervalid)
                    console.log("Reset")
                }
            )
    }
}

export default Net