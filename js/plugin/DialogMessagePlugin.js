class DialogMessagePlugin extends Phaser.Plugins.BasePlugin {

    constructor (pluginManager)
    {
        super(pluginManager);
    }

    destroy() {
        if (this.timedEvent) this.timedEvent.remove();
        if (this.text) this.text.destroy();
        super.destroy();
    }
    show(scene,messages,endFunction,opts) {
        this.scene = scene;
        this.messages = messages;
        this.endFunction = endFunction;
        // Check to see if any optional parameters were passed
        if (!opts) opts = {};
        // set properties from opts object or use defaults
        this.borderThickness = opts.borderThickness || 3;
        this.borderColor = opts.borderColor || 0x907748;
        this.borderAlpha = opts.borderAlpha || 1;
        this.windowAlpha = opts.windowAlpha || 0.8;
        this.windowColor = opts.windowColor || 0x303030;
        this.windowHeight = opts.windowHeight || 150;
        this.padding = opts.padding || 32;
        this.closeBtnColor = opts.closeBtnColor || 'darkgoldenrod';
        this.dialogSpeed = opts.dialogSpeed || 4;
        // used for animating the text
        this.eventCounter = 0;
        // if the dialog window is shown
        this.visible = true;
        // the current text in the window
        this.text;
        // the text that will be displayed in the window
        this.dialog;
        this.graphics;
        this.closeBtn;
        // Create the dialog window
        this._createWindow();
        this.index = 0;
        this.setText(messages[this.index].message,true);
    }

    _getGameWidth() {
        return 800;
    }
      // Gets the height of the game (based on the scene)
    _getGameHeight() {
        return 600;
    }
    // Calculates where to place the dialog window based on the game size
    _calculateWindowDimensions(width, height) {
        let x = this.padding;
        let y = height - this.windowHeight - this.padding;
        let rectWidth = width - (this.padding * 2);
        let rectHeight = this.windowHeight;
        return {
            x,
            y,
            rectWidth,
            rectHeight
    };
    }

    _createWindow() {
        let gameHeight = this._getGameHeight();
        let gameWidth = this._getGameWidth();
        let dimensions = this._calculateWindowDimensions(gameWidth, gameHeight);
        this.graphics = this.scene.add.graphics();
        this._createOuterWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
        this._createInnerWindow(dimensions.x, dimensions.y, dimensions.rectWidth, dimensions.rectHeight);
        //this._createCloseModalButton();
        //this._createCloseModalButtonBorder();
    }

    _createInnerWindow(x, y, rectWidth, rectHeight) {
        let border = 1;
        let rectangle = this.scene.add.rectangle(x + border,
             y + border, rectWidth - border, rectHeight - border);
        rectangle.setFillStyle(this.windowColor, this.windowAlpha);
        rectangle.setOrigin(0);
        rectangle.setInteractive();
        rectangle.on("pointerdown",this.close,this);
    }

    // Creates the border rectangle of the dialog window
    _createOuterWindow(x, y, rectWidth, rectHeight) {
        this.graphics.lineStyle(this.borderThickness, this.borderColor, this.borderAlpha);
        this.graphics.strokeRect(x, y, rectWidth, rectHeight);
    }

    _createCloseModalButton() {
        let self = this;
        this.closeBtn = this.scene.make.text({
          x: this._getGameWidth() - this.padding - 14,
          y: this._getGameHeight() - this.windowHeight - this.padding + 3,
          text: 'X',
          style: {
            font: 'bold 12px Arial',
            fill: this.closeBtnColor
          }
        });
        this.closeBtn.setInteractive();
        this.closeBtn.on('pointerover', function () {
          this.setTint(0xff0000);
        });
        this.closeBtn.on('pointerout', function () {
          this.clearTint();
        });
        this.closeBtn.on('pointerdown', this.close, this);
      }
    
      close() {
        if (this.timedEvent == null) {
            if(++this.index < this.messages.length) {
                this.setText(this.messages[this.index].message,true);
            } else {
                if(this.closeMessage) {
                    this.toggleWindow();
                    if (this.text) this.text.destroy();
                } else {
                    this.endFunction();
                }
            }
        } else {
            this.timedEvent.remove();
            this.timedEvent = null;
            this.text.setText(this.messages[this.index].message);
        }
      }
    // Creates the close dialog button border
    _createCloseModalButtonBorder() {
        let x = this._getGameWidth() - this.padding - 20;
        let y = this._getGameHeight() - this.windowHeight - this.padding;
        this.graphics.strokeRect(x, y, 20, 20);
    }

    toggleWindow() {
        this.visible = !this.visible;
        if (this.text) this.text.visible = this.visible;
        if (this.graphics) this.graphics.visible = this.visible;
        if (this.closeBtn) this.closeBtn.visible = this.visible;
    }

    // Sets the text for the dialog window
    setText(text,animate) {
        // Reset the dialog
        this.eventCounter = 0;
        this.dialog = text.split('');
        if (this.timedEvent) this.timedEvent.remove();
        var tempText = animate ? '' : text;
        this._setText(tempText);
        if (animate) {
          this.timedEvent = this.scene.time.addEvent({
            delay: 150 - (this.dialogSpeed * 30),
            callback: this._animateText,
            callbackScope: this,
            loop: true
          });
        }
    }
    // Slowly displays the text in the window to make it appear annimated
    _animateText() {
        this.eventCounter++;
        this.text.setText(this.text.text + this.dialog[this.eventCounter - 1]);
        if (this.eventCounter === this.dialog.length) {
        this.timedEvent.remove();
        this.timedEvent = null;
        }
    }
    // Calcuate the position of the text in the dialog window
    _setText(text) {
        // Reset the dialog
        if (this.text) this.text.destroy();
        let x = this.padding + 10;
        let y = this._getGameHeight() - this.windowHeight - this.padding + 10;
        this.text = this.scene.make.text({
        x,
        y,
        text,
        style: {
            font: 'bold 24px Arial',
            wordWrap: { width: this._getGameWidth() - (this.padding * 2) - 25 }
        }
        });
    }
}