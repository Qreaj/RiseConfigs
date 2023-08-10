var module = rise.registerModule("HUDNovoline  Name", "Displays Novoline client name in correct font and time");

script.handle("onUnload", function () {
    module.unregister();
});

module.registerSetting("number", "FPS X", 1, 1, 10000);
module.registerSetting("number", "FPS Y", 438, 1, 1000);
module.registerSetting("number", "BUILD X", 689, 1, 1000);
module.registerSetting("number", "BUILD Y", 441, 1, 1000);
module.registerSetting("boolean", "SHADERS", true)

var font = render.getCustomFontRenderer("SF UI Text", 24, true);
var bgfont = render.getCustomFontRenderer("SF UI Text", 24.5, true);
var big = render.getCustomFontRendererBold("SF UI Text", 26, true);
var bg = render.getCustomFontRendererBold("SF UI Text", 26.5, true);
var thin = render.getCustomFontRenderer("SF UI Display", 17, true);
var y = 6;

var brightness = [1, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9]; // Start with a wave of darkness in the middle
var lastUpdate = Date.now(); // Timestamp of the last brightness update
var speed = 150; // Change this value to adjust the speed of the wave (in milliseconds)

var frameCounter = 0;
var lastFPSUpdate = Date.now();
var currentFPS = 0;

function calculateFPS() {
    frameCounter++;
    if (Date.now() - lastFPSUpdate >= 1000) { // if one second has passed
        currentFPS = frameCounter;
        frameCounter = 0;
        lastFPSUpdate = Date.now();
    }
    return currentFPS;
}

function drawWithThin(text, x, y, color){
    thin.drawWithShadow(text, x +.5, y +0, [0, 0, 0]);
    thin.drawWithShadow(text, x + 0, y + 0, render.getThemeColor());
    thin.drawWithShadow(text, x, y, color);
};

function drawWithShadowNormal(text, x, y, color){
    bgfont.drawWithShadow(text, x - 1, y + 0, render.getBackgroundShade());
    font.drawWithShadow(text, x + 0, y + 0, render.getThemeColor());
    font.drawWithShadow(text, x, y, color);
};

function drawWithShadowNormal2(text, x, y, color){
    bgfont.drawWithShadow(text, x - .3, y + 0, render.getBackgroundShade());
    font.drawWithShadow(text, x + 0, y + 0, render.getThemeColor());
    font.drawWithShadow(text, x, y, color);
};

function drawWithShadowBig(text, x, y, color){
    bg.drawWithShadow(text, x + 1.5, y + 0, render.getBackgroundShade());
    big.drawWithShadow(text, x + 2, y + 0, color);
};

module.handle("onRender2D", function(e) {
    var newname = "Novoline";
    rise.setName(newname);

    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var timeString = hours + ":" + (minutes < 10 ? "0" + minutes : minutes);

    if (Date.now() - lastUpdate > speed) { // Change brightness every 'speed' milliseconds
        brightness.unshift(brightness.pop()); // Rotate the brightness array to create a wave effect
        lastUpdate = Date.now();
    }

    var themeColor = render.getThemeColor();
    var xPos = 0;

    // Draw the Novoline client name with the wave effect
    for (var i = 0; i < 8; i++) {
        var color = [themeColor[0] * brightness[i], themeColor[1] * brightness[i], themeColor[2] * brightness[i], themeColor[3]];
        drawWithShadowBig("Novoline"[i], xPos, y + 0, color);

        xPos += big.width("Novoline"[i]);

        if (module.getSetting("SHADERS")) {
            render.bloom(function() {
                drawWithShadowBig("Novoline", 0, y + 0, color);

            })
        }
    }

    // Draw the current time
    var bracketColor = [141, 141, 141, 255]; // Gray color for the brackets
    var timeColor = [255, 255, 255, 255];    // White color for the time string
    
    // Calculate the position for each part
    var bracketWidth = font.width("(");
    var timeWidth = font.width(timeString);
    
    // Function to draw the separated parts
    function drawSeparatedText(xPosition) {
        // Draw the opening bracket
        drawWithShadowNormal2("(", xPosition, y + 0.5, bracketColor);
        // Draw the time string (move the X position by the width of the opening bracket)
        drawWithShadowNormal(timeString, xPosition + bracketWidth, y + 0.5, timeColor);
        // Draw the closing bracket (move the X position by the width of the opening bracket and the time string)
        drawWithShadowNormal2(")", xPosition + bracketWidth + timeWidth, y + 0.5, bracketColor);
    }
    
    // Execute the function for non-shader rendering
    drawSeparatedText(xPos + 6);
    
    // Execute the function inside the shader if the setting is true
    if (module.getSetting("SHADERS")) {
        render.bloom(function() {
            drawSeparatedText(xPos + 6);
        });
    }
    

    var riseVersion = rise.getRiseVersion();

    // Get current FPS from our function
    var fps = calculateFPS();
    
    // Calculate the color based on the brightness wave for FPS
    var fpsX = module.getSetting("FPS X");
    var fpsY = module.getSetting("FPS Y");
    var name = player.getName();
    
    var fpsText = "FPS: " + fps;
    var fpsWidth = font.width(fpsText);
    var BuildX = module.getSetting("BUILD X");
    var BuildY = module.getSetting("BUILD Y");
    
    var buildText = "Build: " + riseVersion;
    var buildTextWidth = thin.width(buildText);
    var padding = -43;  // Adjust this value for desired spacing between "Build" and "User"
    
    var labelColor = [255, 255, 255, 255]; // White color for the label
    
    // Separate drawing function for label and content
    function drawLabelAndContent(label, content, x, y, fontObj) {
        var labelWidth = fontObj.width(label);
        drawWithThin(label, x, y, labelColor);
        drawWithThin(content, x + labelWidth, y, color);
    }
    
    // Draw the FPS
    drawLabelAndContent("FPS: ", fps.toString(), fpsX + 2, fpsY + 2, thin);
    
    // Draw the Build version
    drawLabelAndContent("Build: ", riseVersion, BuildX - 5, BuildY - 1, thin);
    
    // Calculate the entire width of the "User" label and its content
    var userLabelWidth = thin.width("User: " + name);
    
    // Calculate the X position for the user label based on the width of "Build:", the desired padding, and the width of the "User" label
    var userX = BuildX + buildTextWidth + padding - userLabelWidth;
    drawLabelAndContent("User: ", name, userX, BuildY - 1, thin);
    
    if (module.getSetting("SHADERS")) {
        render.bloom(function() {
            drawLabelAndContent("FPS: ", fps.toString(), fpsX + 2, fpsY + 2, thin);
            drawLabelAndContent("Build: ", riseVersion, BuildX - 5, BuildY - 1, thin);
            drawLabelAndContent("User: ", name, userX, BuildY - 1, thin);
        })
    }
    
    

    return e;
});
