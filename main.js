function update(deltaMs, state) {
    let graphics = state.graphics;
    graphics.clear();
    for(let line of state.lines) {
        //graphics.lineStyle(state.config.lineWidth, line.color);
        graphics.lineStyle(line.strokeWidth, line.color);
        graphics.moveTo(line.x, line.y);
        graphics.lineTo(line.dx, line.dy);
    }
}

function getConfig() {
    return {
        numLines: 1300,
        margin: 20,
        palette: ['cyan', 'navy', '#DD0099', 'pink'],
        lineWidth: [4, 7],
        lineWigglePeriodMs: 300,
        lineDuration: [2500, 3500],
    };
}

function generateLines(board, config) {
    let lines = makeRange(config.numLines);
    lines = lines.map(function(x, i) {
        const line = resetLine({}, board, config);
        anime({
            targets: line,
            strokeWidth: config.lineWidth[1],
            duration: config.lineWigglePeriodMs,
            delay: anime.random(0, 1) * (config.lineWigglePeriodMs / 2),
            direction: 'alternate',
            easing: 'easeInOutSine',
            loop: true,
        })
        return line;
    });
    return lines;
}

function resetLine(line, board, config) {
    const rx = anime.random(board.left, board.right);
    const rdx = anime.random(board.left, board.right);
    const ry = anime.random(board.top, board.bottom);
    const rdy = anime.random(board.top, board.bottom);
    const rduration = anime.random(config.lineDuration[0], config.lineDuration[1]);
    const rdelay = anime.random(0, config.lineDuration[1] * 2);
    line.x = rx;
    line.y = ry;
    line.dx = rx;
    line.dy = ry;
    line.color = randomColor(config.palette);
    line.strokeWidth = config.lineWidth[0];
    anime({
        targets: line,
        dx: rdx,
        dy: rdy,
        delay: rdelay,
        duration: rduration,
        easing: 'easeInOutBack',
        x: {
            value: rdx,
            duration: rduration,
            delay: rdelay + Math.floor(rduration / 2.5),
            easing: 'easeOutBack',
        },
        y: {
            value: rdy,
            duration: rduration,
            delay: rdelay + Math.floor(rduration / 2.5),
            easing: 'easeInBack',
        },
    }).finished.then(function() {
        resetLine(line, board, config);
    });
    return line;
}

function makeBoardRectangle(margin, viewRectangle) {
    const margin2 = margin * 2;
    const boardWidth = viewRectangle.width - margin2;
    const boardHeight = viewRectangle.height - margin2;
    return new PIXI.Rectangle(margin, margin, boardWidth, boardHeight);
}

function makeRange(n) {
    var arr = Array.apply(null, Array(n));
    return arr.map(function (x, i) { return i });
};

function randomColor(palette) {
    const scale = chroma.scale(palette).mode('lch'); //generate scale once on startup, not every call
    const colorArray = scale(Math.random()).rgb();
    const colorNumber = RGBTo24bit(colorArray);
    return colorNumber;
}

function RGBTo24bit(rgbArray) {
    let result = Math.floor(rgbArray[2])
        | Math.floor(rgbArray[1]) << 8
        | Math.floor(rgbArray[0]) << 16;
    return result;
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

    let config = getConfig();
    let board = makeBoardRectangle(config.margin, app.screen);
    let lines = generateLines(board, config);
    
    let state = {
        config: config,
        app: app,
        graphics: graphics,
        board: board,
        lines: lines,
    };
    app.ticker.add(function(delta){
        update(delta, state);
    });
})();