function update(deltaMs, state) {
    let graphics = state.graphics;
    graphics.clear();
    //update state (and draw on graphics if using them)
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

    //init things here
    
    let state = {
        app: app,
        graphics: graphics,
    };
    app.ticker.add(function(delta){
        update(delta, state);
    });
})();