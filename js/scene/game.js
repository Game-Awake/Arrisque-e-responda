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
        if(parent.teams) {
            this.callMain(
                parent.urlArrisque,
                parent.teams
            );
        } else {
            let element = this.add.dom(width/2, 200).createFromCache("start");
            element.addListener("click");
            element.setVisible(true);
            element.on("click", (event) => {
                if (event.target.name === "playButton") {
                    let txtTeams = element.getChildByName("txtTeams");
                    let txtURL = element.getChildByName("txtURL");

                    let url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQaimrfj_ljGSE707zPOua_HRMubxksPFIEX9EIs-NYSdKLDT0NrG4cKCgBZS6RMr1Lan2o6ZBYvEKQ/pub?output=tsv"
                    if(txtURL.value != "") {
                        url = txtURL.value;
                        jogo = null;
                    }

                    element.removeListener("click");

                    element.setVisible(false);
    
                    if(jogo) {
                        scene.scene.start("main", {teams:parseInt(txtTeams.value)});
                    } else {
                        this.callMain(url,parseInt(txtTeams.value));
                    }
                }
            });
            this.tweens.add({
                targets: element,
                y: 150,
                duration: 1000,
                ease: "Power3",
            });
        }
            
    }

    callMain(url,teams) {
        $.ajax({
            type: "GET",
            url: url,
            dataType: "text",
            success: (data) => {
                data = processData(data);
                try {
                    parent.loadedGame();
                } catch(ex) {
                    teams = 1;
                }
                this.scene.start("main", {
                    json:data,
                    teams:teams
                });
            }
        });
    }
}

const width = screen.availWidth - 64;
const height = screen.availHeight - 64;

const config = {
    backgroundColor: '#555555',
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
let jogo = url.searchParams.get("jogo");

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