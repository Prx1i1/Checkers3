class Tile extends THREE.Mesh {
    static boardWhite = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })

    static boardBlack = new THREE.MeshBasicMaterial({
        color: 0x000000,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })

    static boardYellow = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide, // dwustronny
        map: new THREE.TextureLoader().load('https://i.imgur.com/Ncrkb8L.png'), // plik tekstury
        opacity: 1, // stopień przezroczystości

    })

    static tileGeometry = new THREE.BoxGeometry(10, 2, 10);

    constructor(white) {
        super(Tile.tileGeometry, white ? Tile.boardWhite : Tile.boardBlack) // wywołanie konstruktora klasy z której dziedziczymy czyli z Meshas
        this.isWhite = white
        this.isHighlighted = false
        console.log("Created Tile.")
    }

    highlight(state){
        this.material = (state ?  Tile.boardYellow : (this.isWhite ?  Tile.boardWhite : Tile.boardBlack)) 
    }
}

export default Tile