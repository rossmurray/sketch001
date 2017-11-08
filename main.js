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
            graphics.lineTo(line.x2, line.y2);
        }
        state.app.renderer.render(state.graphics);
        state.recorder.capture(state.app.renderer.view);
    }

    function getConfig() {
        let palette = ['#6f32b0', '#000000', '#191754', '#b9f0d5'];
        return {
            numLines: 2000,
            margin: 0.04,
            colorScale: chroma.scale(palette).mode('lab'),
            lineWidth: 0.0095,
            lineDuration: 6000,
            backgroundColor: 0xF0F7FA,
        };
    }

    function generateLines(board, config) {
        let lines = makeRange(config.numLines).map(() => {return {};});
        resetLines(lines, board, config);
        return lines;
    }

    function animateLines(lines, board, config) {
        const animation = anime({
            targets: lines,
            x: {
                value: el => el.dx,
                delay: config.lineDuration * 0.4,
                duration: config.lineDuration * 0.6,
                easing: 'easeOutBack',
            },
            y: {
                value: el => el.dy,
                delay: config.lineDuration * 0.4,
                duration: config.lineDuration * 0.6,
                easing: 'easeInBack',
            },
            x2: {
                value: (el) => el.dx,
                duration: config.lineDuration,
                easing: 'easeInOutBack',
            },
            y2: {
                value: (el) => el.dy,
                duration: config.lineDuration,
                easing: 'easeInOutBack',
            },
            complete: function() {
                resetLines(lines, board, config)
                animateLines(lines, board, config).play();
            },
            autoplay: false,
        });
        return animation;
    }

    function resetLines(lines, board, config) {
        for(let line of lines) {
            const rx = anime.random(board.left, board.right);
            const rdx = anime.random(board.left, board.right);
            const ry = anime.random(board.top, board.bottom);
            const rdy = anime.random(board.top, board.bottom);
            line.x = rx;
            line.y = ry;
            line.x2 = rx;
            line.y2 = ry;
            line.dx = rdx;
            line.dy = rdy;
            line.color = RGBTo24bit(config.colorScale((rdx - board.left) / board.width).rgb());
            line.strokeWidth = config.lineWidth * board.width;
        }
    }

    function makeBoardRectangle(margin, viewRectangle) {
        const realMargin = viewRectangle.width * margin;
        const realMargin2 = realMargin * 2;
        const boardWidth = viewRectangle.width - realMargin2;
        const boardHeight = viewRectangle.height - realMargin2;
        return new PIXI.Rectangle(realMargin, realMargin, boardWidth, boardHeight);
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

    return (function() {
        const config = getConfig();
        const mainel = document.getElementById("main");
        let app = new PIXI.Application({
            width: mainel.width,
            height: mainel.height,
            view: mainel,
            autoResize: true,
            antialias: true,
        });
        app.renderer.backgroundColor = config.backgroundColor;
        app.ticker.autoStart = false;

        let graphics = new PIXI.Graphics();
        let board = makeBoardRectangle(config.margin, app.screen);
        let lines = generateLines(board, config);
        let state = {
            config: config,
            app: app,
            graphics: graphics,
            board: board,
            lines: lines,
        };
        return function(recorder) {
            state.recorder = recorder || {capture: function(){}};
            const animation = animateLines(lines, board, config);
            render(Date.now(), state);
            animation.play();
            return state;
        }
    })();
})();