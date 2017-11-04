function update(deltaMs, state) {
    let graphics = state.graphics;
    graphics.clear();
    for(let line of state.lines) {
        graphics.lineStyle(state.config.lineWidth, line.color);
        graphics.moveTo(line.x, line.y);
        graphics.lineTo(line.dx, line.dy);
    }
}

function getConfig() {
    return {
        numLines: 55,
        margin: 20,
        palette: ['cyan', 'navy', 'pink'],
        lineWidth: 10,
        lineDuration: [2500, 3500],
    };
}

function generateLines(board, config) {
    let lines = makeRange(config.numLines);
    lines = lines.map(function(x) {
        return resetLine({}, board, config);
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
    line.color = randomColor(config.palette)
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
    const scale = chroma.scale(palette).mode('lab');
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