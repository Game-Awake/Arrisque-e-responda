class Main extends Phaser.Scene
{

    constructor ()
    {
        super('main');
        this.teams = 0;
        this.board = {teams:[],types:[]};
        this.json = null;
    }

    init(data) {
      this.teams = data.teams;
    }

    preload ()
    {
      this.load.json("jogo","data/"+jogo+".json");
      this.load.html("question", "html/question.html");
    }

    create ()
    {
      this.json = GameAwakeUtils.loadConfig(this,jogo);
      this.currentTeam = 0;

      for(let i=0;i<this.teams*2;i+=2) {
        let id = i/2;
        this.board.teams[id] = {id:id};
        let style = {
          fontSize: 30,
          fontFamily: 'Arial',
          align: "center",
          color:'#ff0000',
          wordWrap: { width: 100, useAdvancedWrap: true }
        }
        let text = "Team " + id;
        this.board.teams[id].name = this.add.text(80,60+i*40,text,style);
        this.board.teams[id].name.setOrigin(0.5);
        this.board.teams[id].name.setInteractive();
        this.board.teams[id].score = this.add.text(80,60+(i+1)*40,"0",style);
        this.board.teams[id].score.setOrigin(0.5);
        this.board.teams[id].points = 0;
      }
      this.board.teams[this.currentTeam].name.setTint(0xffffff);
      for(let i=0;i<this.json.length;i++) {
        let item = this.json[i];
        this.board.types[i] = {name:item.type,options:[]};
        for(let j=0;j<item.questions.length;j++) {
          let w = item.questions[j].weight;
          this.board.types[i].options[w] = {weight:w,questions:[]};
          if(!this.board.types[i].options[w].questions) {
            this.board.types[i].options[w].questions = [];
          }
          this.board.types[i].options[w].questions.push(item.questions[j]);
        }
      }
      for(let i=0;i<this.board.types.length;i++) {
        let style = {
          fontSize: 24,
          fontFamily: 'Arial',
          align: "center",
          color:'#0000ff',
          wordWrap: { width: 150, useAdvancedWrap: true }
        }
        let text = this.board.types[i].name;
        this.board.types[i].box = new Option(110+(i+1)*150,50,150,80,0xcccccc,2,0x000000,
          text, style,
          () => {},this);
          
        for(let j=0;j<this.board.types[i].options.length;j++) {
          style.fontSize = 24;
          style.backgroundColor = '#ffffff';
          let option = this.board.types[i].options[j];
          if(option) {
            text = option.weight * 100;
            option.container = new Option(110+(i+1)*150,50+j*80,150,80,0xffffff,2,0x000000,
              text, style,
              () => this.selectOption(option.questions,option.weight), this);
          }
        }
      }

      this.element = this.add.dom(width/2, height).createFromCache("question");
      this.element.setVisible(false);
      this.element.addListener("click");
      this.element.on("click", function (event) {
          if (event.target.name === "playButton") {
              var inputText = this.getChildByName("txtTeams");

              //  Have they entered anything?
              if (inputText.value !== "") {
              //  Turn off the click events
                  this.removeListener("click");

                  //  Hide the login element
                  this.setVisible(false);

                  gameOptions.players = parseInt(inputText.value);

                  scene.scene.start("main", {teams:5});
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
    }
    selectOption(questions,weight) {
      if(questions.length == 0) {
        return;
      }
      question = questions[Phaser.Math.Between(0,questions.length-1)];
      $("#question").html(question.text);
      $("button").unbind('click');
      $(".answerDiv").remove();
      if(question.answer) {
        for(let i=0;i<question.answer.length;i++) {
          let div = $("<div class=\"row answerDiv\"><div class=\"col\"><button class=\"answer\">"+question.answer[i].text+"</button></div></div>");
          $("#questionRow").append(div);
          $("button").click(() => {
            this.calculate(question.answer[i].value,question.weight);
            this.element.setVisible(false);
          });          
        }
      } else {
        let div = $("<div class=\"row answerDiv\"><div class=\"col-md-6\"><button class=\"right\">Certo</button></div><div class=\"col-md-6\"><button class=\"wrong\">Errado</button></div></div>");
        $("#questionRow").append(div);
        $(".right").click(() => {
          this.calculate(1,question.weight);
          this.element.setVisible(false);
        });
        $(".wrong").click(() => {
          this.calculate(0,question.weight);
          this.element.setVisible(false);
        });
      }
      
      this.element.setVisible(true);
      this.tweens.add({
        targets: this.element,
        y: height/2,
        duration: 500,
        ease: "Power3",
      });
    }
    calculate(value,weight) {
      this.board.teams[this.currentTeam].points += value * weight * 100;
      this.board.teams[this.currentTeam].score.setText(this.board.teams[this.currentTeam].points);
      this.board.teams[this.currentTeam].name.setTint(0xff0000);
      this.currentTeam++;
      this.currentTeam = this.currentTeam % this.teams;
      this.board.teams[this.currentTeam].name.setTint(0xffffff);
    }
}