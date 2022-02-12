class Main extends Phaser.Scene
{

    constructor ()
    {
        super('main');
        this.teams = [];
        this.colors = [];
        this.board = {teams:[],types:[]};
        this.json = null;
    }

    init(data) {
      this.teams = data.teams || 0;
      this.json = data.json;
      this.onlyOneTurn = true;
    }

    preload ()
    {
      this.load.json("jogo","data/"+jogo+".json");
      this.load.html("question", "html/question.html");
    }

    create() {
      scene = this;
      this.isFinal = false;
      this.totalQuestion = 0;
      
      this.convertQuestion();
      this.currentQuestion = this.totalQuestion;

      this.element = this.add.dom(width/2, 0).createFromCache("question");
      this.element.setVisible(false);
      this.element.addListener("click");
    }

    convertQuestion() {
      for(let i=0;i<this.json.length;i++) {
        let item = this.json[i];
        this.board.types[i] = {name:item.type,options:[]};
        this.totalQuestion += item.questions.length;
        for(let j=0;j<item.questions.length;j++) {
          let w = item.questions[j].weight;
          if(!this.board.types[i].options[w]) {
            this.board.types[i].options[w] = {weight:w,questions:[]};
          }
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
            option.questions = this.suffleArray(option.questions);
            option.questions.next = 0;
            text = option.weight * 100;
            option.container = new Option(110+(i+1)*150,50+j*80,150,80,0xffffff,2,0x000000,
              text, style,
              () => this.selectOption(option.questions,option.container), this);
          }
        }
      }
    }

    update ()
    {
      if(notUpdate) {
        return;
      }
      this.isFinal = false;
      if(jogo) {
        this.json = GameAwakeUtils.loadConfig(this,jogo);
      }
      if(this.board.teams.length > 0) {
        this.doDestroy();
      }
      this.currentTeam = 0;

      for(let i=0;i<this.teams.length*2;i+=2) {
        let id = i/2;
        this.board.teams[id] = {id:id};
        let style = {
          fontSize: 20,
          fontFamily: 'Arial',
          align: "center",
          color:this.colors[id],
          wordWrap: { width: 120, useAdvancedWrap: true }
        }
        let text = this.teams[id];
        this.board.teams[id].name = this.add.text(80,60+i*80,text,style);
        this.board.teams[id].name.setOrigin(0.5);
        this.board.teams[id].name.setInteractive();
        this.board.teams[id].score = this.add.text(80,60+(i+1)*80,"0",style);
        this.board.teams[id].score.setOrigin(0.5);
        this.board.teams[id].points = 0;
      }
      this.selectTeam(this.board.teams[this.currentTeam].name);
      
      if(this.currentQuestion < 3) {
        for(let i=0;i<this.board.types.length;i++) {           
          for(let j=0;j<this.board.types[i].options.length;j++) {
            if(this.board.types[i].options[j]) {
              this.board.types[i].options[j].container.alpha = 1;
            }
          }
        }
        this.currentQuestion = this.totalQuestion;
      }

      notUpdate=true;
    }
    selectOption(questions,container) {
      if(this.isVisible) {
        return;
      }
      
      question = questions[questions.next];
      questions.next++;
      $("#question").html(question.text.replaceAll("\\n","<br/>"));
      $("button").unbind('click');
      $(".answerDiv").remove();
      if(question.answer) {
        question.answer = this.suffleArray(question.answer);
        for(let i=0;i<question.answer.length;i++) {
          let div = $("<div class=\"row answerDiv\"><div class=\"col\"><button class=\"answer\">"+question.answer[i].text+"</button></div></div>");
          $("#questionRow").append(div);
          $(div,"button").click(() => {
            this.isVisible = false;
            this.element.setVisible(false);

            questions.next = questions.next % questions.length;
            if(questions.next == 0) {
              container.alpha = 0;
            }
            this.calculate(question.answer[i].value,question.weight);            
          });          
        }
        if(!this.isFinal && false) {
          let div = $("<div class=\"row answerDiv\"><div class=\"col\"><button class=\"cancel\">Cancelar</button></div></div>");
          $("#questionRow").append(div);
          $(div,".cancel").click(() => {
              this.isVisible = false;
              this.element.setVisible(false);
              questions.next--;            
          });
        }  
      } else {
        let div = $("<div class=\"row answerDiv\"><div class=\"col-md-6\"><button class=\"right\">Certo</button></div><div class=\"col-md-6\"><button class=\"wrong\">Errado</button></div></div>");
        $("#questionRow").append(div);
        $(".right").click(() => {
          questions.next = questions.next % questions.length;
          this.isVisible = false;
          this.element.setVisible(false);      
          if(questions.next == 0) {
            container.alpha = 0;
          }
          this.calculate(1,question.weight);
        });
        $(".wrong").click(() => {
          questions.next = questions.next % questions.length;
          this.isVisible = false;
          this.element.setVisible(false);
          if(questions.next == 0) {
            container.alpha = 0;
          }
          this.calculate(0,question.weight);
        });
      }
      
      this.isVisible = true;
      this.element.setVisible(true);

      this.tweens.add({
        targets: this.element,
        y: 10,
        duration: 500,
        ease: "Power3",
      });
    }
    calculate(value,weight) {
      this.currentQuestion--;
      if(this.isFinal) {
        if(value > 0) {
          this.showWinner(this.currentTeam);
        } else {
          this.showWinner(1-this.currentTeam);
        }
      } else {
        this.board.teams[this.currentTeam].points += value * weight * 100;
        this.board.teams[this.currentTeam].score.setText(this.board.teams[this.currentTeam].points);
        this.board.teams[this.currentTeam].name.setTint(0xff0000);
        this.selectTeam(this.board.teams[this.currentTeam].name,0);
        this.currentTeam++;
        this.currentTeam = this.currentTeam % this.teams.length;
  
        if(this.currentTeam == 0 && this.onlyOneTurn) {
          this.doEnd();
        } else {
          this.selectTeam(this.board.teams[this.currentTeam].name);
        }
      }
    }
    suffleArray(items) {
      let newOrder = [];
      let i = 0;
      while (items.length > 0) {
          newOrder[i++] = items.splice(
            Phaser.Math.Between(0, items.length - 1),
            1
          )[0];
      }
      return newOrder;
    }
    selectTeam(team,color="#ffffff") {
      team.setPadding(16,16);      
      team.setStyle({backgroundColor:color});
    }
    doEnd() {
      let first = this.board.teams[0];
      let second = this.board.teams[1];
      if(first.points > second.points) {
        this.showWinner(0);
      } else if(first.points < second.points) {
        this.showWinner(1);
      } else {
        this.showDraw();
      }
    }
    showWinner(index) {
      this.message = "Parábens\n" + this.teams[index];
      this.showMessage(() => {
        this.text.destroy();
        this.back.destroy();
        parent.showNextPhase(index);
      });
    }
    showDraw(index) {
      this.currentTeam = Phaser.Math.Between(0,1);
      this.message = "Empate\nFoi sorteado o time\n" + this.teams[this.currentTeam]+"\npara responder";
      this.showMessage(() => {
        this.text.destroy();
        this.back.destroy();
        let options = [];
        for(let i=0;i<this.board.types.length;i++) {
          for(let j=0;j<this.board.types[i].options.length;j++) {
            let option = this.board.types[i].options[j];
            if(option && option.container.alpha == 1) {
              options.push(option);
            }
          }
        }
        let pos = Phaser.Math.Between(0,options.length-1);
        this.isFinal = true;
        this.selectOption(options[pos].questions,options[pos].container);
      });
    }
    showMessage(callback) {
      this.back = this.add.rectangle(100,100,800,600,0x000000);
      this.back.alpha = 0.4;
      this.back.setInteractive();
      this.back.setOrigin(0);
      this.back.on("pointerdown",callback);

      this.text = this.add.text(500, 300, this.message, { fontFamily: "Arial Black", fontSize: 40 });
      this.text.setOrigin(0.5);

      this.text.setStroke('#000000', 4);
      //  Apply the gradient fill.
      const gradient = this.text.context.createLinearGradient(0, 0, 0, this.text.height);

      gradient.addColorStop(0, '#009900');
      gradient.addColorStop(.5, '#00ff00');
      gradient.addColorStop(.5, '#00ff00');
      gradient.addColorStop(1, '#009900');

      this.text.setFill(gradient);
    }
    doDestroy() {
      for(let i=0;i<this.teams.length;i++) {
        this.board.teams[i].name.destroy();
        this.board.teams[i].score.destroy();
      }
      this.board.teams = [];
    }
}