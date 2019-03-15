"use strict";

async function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    var canvas = getCanvas();
    var gl =  getGLContext(canvas);


    var vertexShaderSource = await fetch("vertex.glsl").then(r => r.text());
    console.log("VERTEX", vertexShaderSource);

    var fragmentShaderSource = await fetch("fragment.glsl").then(r => r.text());
    console.log("FRAGMENT", fragmentShaderSource);

// 4 - Compilar arquivos de shader
    var vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER, gl);
    var fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER, gl);

// 5 - Linkar o programa de shader
    var shaderProgram = linkProgram(vertexShader, fragmentShader, gl);
    // setup GLSL program
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(shaderProgram, "a_position");

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(shaderProgram, "u_resolution");
    var colorUniformLocation = gl.getUniformLocation(shaderProgram, "u_color");

    // Create a buffer to put three 2d clip space points in
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(shaderProgram);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var translation = [gl.canvas.width/2, gl.canvas.height/2];
    var width = 30;
    var height = 30;
    var colorP = [Math.random(), Math.random(), Math.random(), 1];
    var colorBg = [Math.random(), Math.random(), Math.random(), 1];

    drawScene();

    document.addEventListener('keydown', (event) => {
        const keyName = event.key;
        console.log(event.key);
        translation[0] += keyName === "ArrowRight" ? 10 : translation[0];
        translation[0] -= keyName === "ArrowLeft" ? 10 : translation[0];
        translation[1] -= keyName === "ArrowUp" ? 10 : translation[0];
        translation[1] += keyName === "ArrowDown" ? 10 : translation[0];
        console.log(translation[0]);
        drawScene();
    });



    // Draw a the scene.
    function drawScene() {
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas.
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Tell it to use our program (pair of shaders)
        gl.useProgram(shaderProgram);

        // Turn on the attribute
        gl.enableVertexAttribArray(positionAttributeLocation);

        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

        // Setup a rectangle
        setRectangle(gl, 10, 10, 2400, 1300);
        //setRectangle(gl, 20, 110, width, height);

        // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        var size = 2;          // 2 components per iteration
        var type = gl.FLOAT;   // the data is 32bit floats
        var normalize = false; // don't normalize the data
        var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // set the color
        gl.uniform4fv(colorUniformLocation, colorP);

        // Draw the rectangle.
        var primitiveType = gl.TRIANGLES;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);

        setRectangle(gl, translation[0], translation[1], width, height);

        gl.vertexAttribPointer(
            positionAttributeLocation, size, type, normalize, stride, offset);

        // set the resolution
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        // set the color
        gl.uniform4fv(colorUniformLocation, colorBg);

        gl.drawArrays(primitiveType, offset, count);
    }

    // var rects = [
    //     [0, 0, window.innerWidth, window.innerHeight],
    //     [posX, posY, 10, 10]
    // ]
    // // draw 50 random rectangles in random colors
    // for (var ii = 0; ii < rects.length; ++ii) {
    //     // Setup a random rectangle
    //     // This will write to positionBuffer because
    //     // its the last thing we bound on the ARRAY_BUFFER
    //     // bind point
    //     console.log(rects[ii][0])
    //     setRectangle(
    //         gl, rects[ii][0], rects[ii][1], rects[ii][2], rects[ii][3]);
    //
    //     // Set a random color.
    //     gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
    //
    //     // Draw the rectangle.
    //     var primitiveType = gl.TRIANGLES;
    //     var offset = 0;
    //     var count = 6;
    //     gl.drawArrays(primitiveType, offset, count);
    // }
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
    return Math.floor(Math.random() * range);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

function getCanvas(){
    return document.querySelector("canvas");
}

function getGLContext(canvas) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    canvas.setAttribute("width", width);
    canvas.setAttribute("height", height);
    let gl = canvas.getContext("webgl");
    return gl;
}

function linkProgram(vertexShader, fragmentShader, gl){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.error("ERRO NA LINKAGEM");
    return program;
}

function compileShader(source, type, gl){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.error("ERRO NA COMPILAÇÃO", gl.getShaderInfoLog(shader));
    return shader;
}

main();
