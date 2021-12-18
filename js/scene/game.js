class Game extends Phaser.Scene
{
    constructor ()
    {
        super('game');
    }

    preload ()
    {
        this.load.html("start", "html/start.html");
    }

    create ()
    {
        let scene = this;
        
                let element = this.add.dom(width/2, 200).createFromCache("start");
                element.addListener("click");
                console.log(element);
                element.setVisible(true);
                element.on("click", function (event) {
                    if (event.target.name === "playButton") {
                        var inputText = this.getChildByName("txtTeams");
    
                        //  Have they entered anything?
                        if (inputText.value !== "") {
                        //  Turn off the click events
                            this.removeListener("click");
    
                            //  Hide the login element
                            this.setVisible(false);
    
                            scene.scene.start("main", {teams:parseInt(inputText.value)});
                        } else {
                            //  Flash the prompt
                            scene.scene.tweens.add({
                                targets: text,
                                alpha: 0.2,
                                duration: 250,
                                ease: "Power3",
                                yoyo: true,
                            });
                        }
                    }
                });
                this.tweens.add({
                    targets: element,
                    y: 200,
                    duration: 1000,
                    ease: "Power3",
                });
    }
}

const width = screen.availWidth * 0.8;
const height = screen.availHeight * 0.8;

const config = {
    type: Phaser.CANVAS,
    backgroundColor: '#125555',
    scale: {
      parent:"divCanvas",
      width: width,
      height: height
    },
    dom: {
        createContainer: true
    },
    scene: [Game, Main]
};

let question = null;
let url = new URL(window.location.href);
const jogo = url.searchParams.get("jogo");

let game = new Phaser.Game(config);
let tutorial = 0;