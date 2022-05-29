import Tile from "./Tile.js"
import Pawn from "./Pawn.js"

class Game {
    constructor() {
        this.selectedPawn = null;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0x29293d);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        this.raycaster = new THREE.Raycaster(); // obiekt Raycastera symulujący "rzucanie" promieni
        this.mouseVector = new THREE.Vector2() // ten wektor czyli pozycja w przestrzeni 2D na ekranie(x,y) wykorzystany będzie do określenie pozycji myszy na ekranie, a potem przeliczenia na pozycje 3D

        this.camera.position.set(100, 100, 0);
        this.camera.lookAt(this.scene.position);

        this.hasMove = false;
        this.isMoving = false;
        this.isTaking = false;
        this.isWhite = true;
        this.isPlaying = false;

        this.gameIsAlive = true;

        this.tileList = []

        document.getElementById("root").append(this.renderer.domElement);

        this.render() // wywołanie metody render
    }

    load() {
        this.checkerboardTemplate = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            for (let c = 0; c < 8; c++) {
                row.push((c + r) % 2);

                let tile = new Tile((c + r) % 2 != 1)
                this.tileList.push(tile)
                let pos = Game.GetPosition(r, c)
                tile.position.set(pos.x, -2, pos.z)
                this.scene.add(tile);
            }
            this.checkerboardTemplate.push(row);
        }

        this.pawnsTable = [];
        this.pawnsObjTable = [];
        for (let r = 0; r < 8; r++) {
            let row = [];
            for (let c = 0; c < 8; c++) {
                if ((r < 2 || r > 5) && (c + r) % 2 == 1) {
                    row.push(r > 5 ? 1 : 2);

                    let pawn = new Pawn(r > 4, this);

                    this.pawnsObjTable.push(pawn);
                    let pos = Game.GetPosition(r, c)

                    pawn.position.set(pos.x, 0, pos.z)
                    this.scene.add(pawn);
                }
                else row.push(0);
            }
            this.pawnsTable.push(row);
        }

        this.hasMove = true;
        if (!this.isWhite) {
            this.camera.position.set(-100, 100, 0);
            this.camera.lookAt(this.scene.position);
            this.hasMove = false;
        }

        window.ui.updateTable()
    }

    render = () => {
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
        TWEEN.update();
    }

    resize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    getLegalMoves(from) {
        let possibleMoves = [],
            proto = []
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z - 1 })
        proto.push({ x: from.x + (this.isWhite ? -1 : 1), z: from.z + 1 })

        proto.forEach(pos => {
            console.log(pos)
            if (pos.x >= 0 && pos.x <= 7 && pos.z >= 0 && pos.z <= 7) {
                if(this.pawnsTable[pos.x][pos.z] == 0){
                possibleMoves.push({ x: pos.x, z: pos.z, isTaking: false })
                }
                if(this.isWhite == true){
                    if(this.pawnsTable[pos.x][pos.z] == 2 && this.pawnsTable[pos.x + (pos.x - from.x)][pos.z + (pos.z - from.z)] == 0){
                        possibleMoves.push({ x: pos.x + (pos.x - from.x), z: pos.z + (pos.z - from.z), isTaking: true })
                    }
                }else{

                    if(this.pawnsTable[pos.x][pos.z] == 1 && this.pawnsTable[pos.x + (pos.x - from.x)][pos.z + (pos.z - from.z)] == 0){
                        possibleMoves.push({ x: pos.x + (pos.x - from.x), z: pos.z + (pos.z - from.z), isTaking: true })
                    }
                }
            }
        })

        return possibleMoves
    }

    raycast(e) {
        if(this.gameIsAlive){
            this.mouseVector.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(event.clientY / window.innerHeight) * 2 + 1;

            this.raycaster.setFromCamera(this.mouseVector, this.camera);

            const intersects = this.raycaster.intersectObjects(this.scene.children);

            this.tileList.forEach(element => {
                element.highlight(false)
            })

            if (intersects.length == 0 && this.selectedPawn != null && !this.isMoving && this.hasMove) {
                //anim
                this.isMoving = true
                this.selectedPawn.deselect()
                this.selectedPawn = null
            }

            if (intersects.length > 0 && !this.isMoving && this.hasMove) {
                const obj = intersects[0].object;


                //select / reselect pawn
                if (obj instanceof Pawn && obj != this.selectedPawn && obj.isWhite == this.isWhite) {
                    if (this.selectedPawn != null) {
                        // deselect old pawn
                        this.isMoving = true
                        this.selectedPawn.deselect()
                        this.tileList.forEach(element => {
                            element.highlight(false)
                        })
                    }

                    // select new pawn
                    this.selectedPawn = obj
                    this.isMoving = true
                    obj.select();

                    let tileUnderSelected = Game.FindOnGrid(obj.position.x, obj.position.z)
                    console.log(this.getLegalMoves(tileUnderSelected))
                    this.getLegalMoves(tileUnderSelected).forEach(move => {
                        console.log("Move found", move.x, move.z)
                        this.tileList.forEach(element => {
                            if(element.position.x == Game.GetPosition(move.x, move.z).x){
                                if(element.position.z == Game.GetPosition(move.x, move.z).z){
                                    element.highlight(true)
                                }
                            }
                        });
                    });

                } else if (this.selectedPawn != null && obj instanceof Tile && !obj.isWhite) {
                    let from = Game.FindOnGrid(this.selectedPawn.position.x, this.selectedPawn.position.z, this.isWhite)
                    let to = Game.FindOnGrid(obj.position.x, obj.position.z, this.isWhite)

                    if(from != to){

                        console.log("To:", to)
                        console.log("Legal:", this.getLegalMoves(from).filter(d => d.x == to.x && d.z == to.z).length > 0)
                        if (this.getLegalMoves(from).filter(d => d.x == to.x && d.z == to.z).length > 0) {
                            console.log("Do Move")
                            this.isMoving = true
                            this.hasMove = false
                            
                            this.tileList.forEach(element => {
                                element.highlight(false)
                            })

                            this.isTakingTemp = this.getLegalMoves(from).filter(d => d.x == to.x && d.z == to.z)[0].isTaking

                            // submit move to server/local array
                            this.pawnsTable[from.x][from.z] = 0;
                            this.pawnsTable[to.x][to.z] = (this.isWhite ? 1 : 2);

                            if(this.isTakingTemp == true){
                                this.pawnsTable[((from.x + to.x) / 2)][((from.z + to.z) / 2)] = 0
                                this.pawnsObjTable.forEach(element => {
                                    if(element.position.x == Game.GetPosition(((from.x + to.x) / 2),((from.z + to.z) / 2)).x 
                                        && element.position.z == Game.GetPosition(((from.x + to.x) / 2),((from.z + to.z) / 2)).z){
                                        this.scene.remove(element)
                                    }
                            })

                            }

                            this.selectedPawn.moveTo(obj.position, this.isTaking)
                            window.ui.updateTable()
                            window.net.move(from, to, this.isTaking)
                            this.selectedPawn = null
                        }
                    }
                    else {
                        console.log("Error")
                    }
                }
            }
        }
    }

    enemyMove(from, to) {
        this.isMoving = true

        let posPawn = Game.GetPosition(from.x, from.z)
        let posDest = Game.GetPosition(to.x, to.z)

        this.pawnsTable[from.x][from.z] = 0;
        this.pawnsTable[to.x][to.z] = (!this.isWhite ? 1 : 2);

        let pawn = this.pawnsObjTable.find(p => p.position.x == posPawn.x && p.position.z == posPawn.z)
        console.log("full data of enemy move")
        console.log(pawn)
        console.log(from)
        console.log(to)
        console.log("============")
        
        let pawnfordeletion = undefined
        this.pawnsObjTable.forEach(element => {
            if(element.position.x == ((posPawn.x + posDest.x) / 2) && element.position.z == ((posPawn.z + posDest.z) / 2)){
                pawnfordeletion = element
                console.log("Found a pawn to delete")
                pawn.fullMove(posDest, true)
            }
        });

        if(pawnfordeletion != undefined){
            let cords = Game.FindOnGrid(pawnfordeletion.position.x, pawnfordeletion.position.z)
            this.pawnsTable[cords.x][cords.z] = 0
            //this.scene.remove(pawnfordeletion)
        }else{pawn.fullMove(posDest, false)}

        window.ui.updateTable()
        
    }

    static FindOnGrid(x, z) {
        return {
            x: (35 + x) / 10,
            z: (35 - z) / 10,
        }
    }

    static GetPosition(x, z) {
        return {
            x: (x - 3.5) * 10,
            z: (3.5 - z) * 10,
        }
    }
}

export default Game