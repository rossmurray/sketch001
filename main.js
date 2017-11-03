function update(deltaMs, state) {
    let graphics = state.graphics;
    graphics.clear();
    graphics.lineStyle(2, 0xFF0000);
    graphics.moveTo(state.line.startX, state.line.startY);
    graphics.lineTo(state.line.endX, state.line.endY);
}

function cardinals() {
    let cardinals = [];
    return cardinals;
}

(function() {
    let app = new PIXI.Application(
        window.innerWidth,
        window.innerHeight,
        {
            view: document.getElementById("main"),
            autoResize: true,
            antialias: true
        }
    );

    let graphics = new PIXI.Graphics();
    graphics.clear();
    app.stage.addChild(graphics);

    let line = {
        startX: 50,
        startY: 50,
        endX: 50,
        endY: 50,
    };
    anime({
        targets: line,
        endX: 200,
        endY: 100,
        duration: 500,
        easing: 'easeOutSine'
    });
    anime({
        targets: line,
        startX: 200,
        startY: 100,
        duration: 500,
        easing: 'easeOutSine',
        delay: 200,
    });
    //let cardinals = createCardinals();
    //let diagonals = [];
    
    let state = {
        app: app,
        graphics: graphics,
        line: line
    };
    app.ticker.add(function(delta){
        update(delta, state);
    });
})();