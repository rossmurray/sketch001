var fnMain = (function() {
    function render(deltaMs, state) {
        requestAnimationFrame(function(timestamp){
            render(timestamp, state);
        });
        let graphics = state.graphics;
        graphics.clear();
        for(let line of state.lines) {
            graphics.lineStyle(line.strokeWidth, line.color);
            graphics.moveTo(line.x, line.y);
            graphics.lineTo(line.dx, line.dy);
        }
        state.app.ticker.update(deltaMs);
        state.recorder.capture(state.app.renderer.view);
    }

    function getConfig() {
        let palette = ['#6f32b0', '#000000', '#191754', '#b9f0d5'];
        return {
            numLines: 1000,
            margin: 50,
            colorScale: chroma.scale(palette).mode('lab'),
            lineWidth: [14, 14],
            lineDuration: [4000, 4000],
            backgroundColor: 0xF0F7FA,
        };
    }

    function generateLines(board, config) {
        let lines = makeRange(config.numLines);
        lines = lines.map(function(x, i) {
            const line = resetLine({}, board, config);
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
        const rdelay = 0;
        const endDelay = rdelay + Math.floor(rduration / 2.5);
        const endDuration = rduration - (endDelay - rdelay);
        line.x = rx;
        line.y = ry;
        line.dx = rx;
        line.dy = ry;
        line.color = RGBTo24bit(config.colorScale((rdx - board.left) / board.width).rgb());
        line.strokeWidth = anime.random(config.lineWidth[0], config.lineWidth[1]);
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

    function randomColor(colorScale) {
        const colorArray = colorScale(Math.random()).rgb();
        const colorNumber = RGBTo24bit(colorArray);
        return colorNumber;
    }

    function RGBTo24bit(rgbArray) {
        let result = Math.floor(rgbArray[2])
            | Math.floor(rgbArray[1]) << 8
            | Math.floor(rgbArray[0]) << 16;
        return result;
    }

    return (function(recorder) {
        const config = getConfig();
        const mainel = document.getElementById("main");
        let app = new PIXI.Application({
                width: mainel.width,
                height: mainel.height,
                view: mainel,
                autoResize: true,
                antialias: true,
            }
        );
        app.renderer.backgroundColor = config.backgroundColor;

        app.renderer.on('postrender', function() {
            
        });

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
            recorder: recorder || {capture: function(){}},
        };
        app.ticker.autoStart = false;
        requestAnimationFrame(function(timestamp){
            render(timestamp, state);
        });

        return state;
    });
})();