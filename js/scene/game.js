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
        
                let element = this.add.dom(isSafari() ? 0 : width/2, 200).createFromCache("start");
                element.addListener("click");
                console.log(element);
                element.setVisible(true);
                element.on("click", function (event) {
                    if (event.target.name === "playButton") {
                        let txtTeamsinputText = this.getChildByName("txtTeams");
                        let txtURL = this.getChildByName("txtURL");
    
                        let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQaimrfj_ljGSE707zPOua_HRMubxksPFIEX9EIs-NYSdKLDT0NrG4cKCgBZS6RMr1Lan2o6ZBYvEKQ/pub?output=tsv"
                        if(txtURL.value != "") {
                            url = txtURL.value;
                            jogo = null;
                        }

                        this.removeListener("click");
    
                            //  Hide the login element
                            this.setVisible(false);
    
                            if(jogo) {
                                scene.scene.start("main", {teams:parseInt(inputText.value)});
                            } else {
                                $.ajax({
                                    type: "GET",
                                    url: url,
                                    dataType: "text",
                                    success: (data) => {
                                        data = processData(data);
                                        scene.scene.start("main", {
                                            json:data,
                                            teams:parseInt(txtTeams.value)
                                        });
                                    }
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

function processData(allText) {
    let allTextLines = allText.split(/\r\n|\n/);
    let entries = allTextLines[0].split(',');

    let json = [];

    let i = 1;
    while (allTextLines.length>i) {
        entries = allTextLines[i].split('\t');

        let current = null;
        for(let k=0;k<json.length;k++) {
            if(json[k].type==entries[0]) {
                current = json[k];
                break;
            }
        }
        if(current == null) {
            current = {type:entries[0],questions:[]};
            json.push(current);
        }
        let question = {
            weight:parseInt(entries[1]),
            text:entries[2]
        }
        if(entries[3]!="") {
            question.answer = [];
            question.answer.push({text:entries[3],value:1});
            let j = 4;
            while(entries.length>j) {
                if(entries[j]!="") {
                    question.answer.push({text:entries[j],value:0});
                }
                j++;
            }
        }
        current.questions.push(question);

        i++;
    }
    console.log(json);
    return json;
}

function isSafari() {
    return navigator.vendor && navigator.vendor.indexOf('Apple') > -1 &&
        navigator.userAgent &&
        navigator.userAgent.indexOf('CriOS') == -1 &&
        navigator.userAgent.indexOf('FxiOS') == -1;
}