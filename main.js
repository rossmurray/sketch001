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
        numLines: 1800,
        margin: 50,
        palette: ['cyan', 'navy', '#DD0099', 'pink'],
        lineWidth: [8, 8],
        lineWigglePeriodMs: 300,
        lineDuration: [2500, 2500],
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
    const rduration = 2500;//anime.random(config.lineDuration[0], config.lineDuration[1]);
    const rdelay = 0;//anime.random(0, config.lineDuration[1] * 2);
    const endDelay = 1000;//rdelay + Math.floor(rduration / 2.5);
    const endDuration = 1500;//rduration - (endDelay - rdelay);
    line.x = rx;
    line.y = ry;
    line.dx = rx;
    line.dy = ry;
    line.color = randomColor();
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
            duration: endDuration,
            delay: endDelay,
            easing: 'easeOutBack',
        },
        y: {
            value: rdy,
            duration: endDuration,
            delay: endDelay,
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

function randomColor() {
    const colorArray = glob.colorScale(Math.random()).rgb();
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
    let config = getConfig();
    const colorScale = chroma.scale(config.palette).mode('lch');
    glob = {
        colorScale: colorScale,
    };
    let app = new PIXI.Application(
        window.innerWidth,
        window.innerHeight,
        {
            //view: document.getElementById("main"),
            autoResize: true,
            antialias: true
        }
    );
    document.body.appendChild(app.view);
    let canvas = document.querySelector('canvas');

    // app.renderer.on('postrender', function() {
    // });

    let graphics = new PIXI.Graphics();
    graphics.clear();
    app.stage.addChild(graphics);

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