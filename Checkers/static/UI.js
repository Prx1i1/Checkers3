class UI {
    constructor() {
        window.addEventListener("resize", (e) => {
            window.game.resize()
        }, false);

        window.addEventListener("mousedown", (e) => {
            window.game.raycast(e);
        });

        document.getElementById("login-play-btn").onclick = () => {
            let onlogin = (name, color) => {
                document.getElementById("login-holder").style.visibility = "hidden";

                document.getElementById("status").innerHTML = "Playing as: " + (color == 0 ? "white" : "black");

                if (color == 0) {
                    document.getElementById("display").innerHTML = "Awaiting second player...";
                }
            }

            window.net.login(onlogin)
        }

        document.getElementById("login-reset-btn").onclick = () => {
            window.net.reset()
        }

    }

    updateTable() {
        document.getElementById("debug").innerHTML = window.game.pawnsTable.map(r => r.map(i => i == 0 ? ` ${i} `
            : i == 1 ? `<span class="white"> ${i} </span>`
                : `<span class="black"> ${i} </span>`).join('')).join("</br>");
    }
    updateTimer(time){
        document.getElementById("timer").innerHTML = "Time left: " + (30 - time)
    }
    updateTurns(player){
        document.getElementById("currentturn").innerHTML = "Now plays: " + (player ? "white" : "black")
    }
}

export default UI