var module = rise.registerModule("Novo Session Information", "Displays stats for your current sessions.");
script.handle("onUnload", function () {
	module.unregister()
});



var kills = 0, ticks = 0, playtimeSeconds = 0;
var lastServerIp = network.getServerIP();

var font = render.getCustomFontRenderer("SF UI Text", 19, true);
var big = render.getCustomFontRendererBold("SF UI Text", 24, true);

var y = 23, xpos = 2;
var textColor = [230, 230, 230];
var height = y + (15 * 2) - 5;

module.registerSetting("boolean", "Shader", true);
module.registerSetting("number", "X", 2, 0, 1000, 1);
module.registerSetting("number", "Y", 23, 0, 600, 1);

var brightness = [1.0, 0.99, 0.98, 0.97, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91, 0.90, 0.89, 0.88, 0.87, 0.86, 0.85, 0.84, 0.83, 0.82, 0.81, 0.80, 0.79, 0.78, 0.77, 0.76, 0.75, 0.74, 0.73, 0.72, 0.71, 0.70, 0.69, 0.68, 0.67, 0.66, 0.65, 0.64, 0.63, 0.62, 0.61, 0.60, 0.59, 0.58, 0.57, 0.56, 0.55, 0.54, 0.53, 0.52, 0.51, 0.50, 0.51, 0.52, 0.53, 0.54, 0.55, 0.56, 0.57, 0.58, 0.59, 0.60, 0.61, 0.62, 0.63, 0.64, 0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.71, 0.72, 0.73, 0.74, 0.75, 0.76, 0.77, 0.78, 0.79, 0.80, 0.81, 0.82, 0.83, 0.84, 0.85, 0.86, 0.87, 0.88, 0.89, 0.90, 0.91, 0.92, 0.93, 0.94, 0.95, 0.96, 0.97, 0.98, 0.99, 1.0]; // Hardcoded brightness array
var lastUpdate = Date.now(); // Timestamp of the last brightness update
var speed = 50; // Change this value to adjust the speed of the wave (in milliseconds)

function drawWithShadowNormal(text, x, y, color){
    font.drawWithShadow(text, x + 0.2, y + 0.2, render.getThemeColor());
    font.drawWithShadow(text, x + 0.2, y + 0.2, render.getBackgroundShade());
    font.drawWithShadow(text, x, y, color);
};

function drawWithShadowBig(text, x, y, color){
    big.drawWithShadow(text, x + 0.5, y + 0.5, render.getThemeColor());
    big.drawWithShadow(text, x + 0.5, y + 0.5, render.getBackgroundShade());
    big.drawWithShadow(text, x, y, color);
};

module.handle("onRender2D", function(e) {
    y = module.getSetting("Y");
    xpos = module.getSetting("X");

    var color = render.getBackgroundShade();
    color[3] = Math.floor(color[3] * 0.8);  // Reducing the opacity to 80%
    render.rectangle(xpos, y, 200, height, color);
    

    if (Date.now() - lastUpdate > speed) { // Change brightness every 'speed' milliseconds
        brightness.unshift(brightness.pop()); // Rotate the brightness array to create a wave effect
        lastUpdate = Date.now();
    }

    var themeColor = render.getThemeColor();
    for (var i = 0; i < 100; i++) {
        var color = [themeColor[0] * brightness[i], themeColor[1] * brightness[i], themeColor[2] * brightness[i], themeColor[3]];
        render.rectangle(xpos + (i * 2), y, 2, 1, color); // Draw a 2x1 rectangle with the current color
    }

    if(module.getSetting("Shader")){
        render.postBloom(function () {
            render.rectangle(xpos, y, 200, height, color);
            render.rectangle(xpos, y, 200, 1, render.getThemeColor());
        });
    }

    drawWithShadowBig("Current Session", xpos + 4, y + 5, [255, 255, 255]);

    var playtime = playtimeSeconds % 60 + "s";

    if(playtimeSeconds >= 3600){
        playtime = Math.floor(playtimeSeconds / 3600) + "h " + Math.floor((playtimeSeconds % 3600) / 60) + "m " + playtimeSeconds % 60 + "s";
    }else if(playtimeSeconds >= 60){
        playtime = Math.floor((playtimeSeconds % 3600) / 60) + "m " + playtimeSeconds % 60 + "s";
    }

    drawWithShadowNormal("Playtime", xpos + 4, y + 20, textColor);
    drawWithShadowNormal(playtime, xpos + 198 - font.width(playtime) - 2, y + 20, textColor);

    drawWithShadowNormal("Players killed", xpos + 4, y + 20 + 15, textColor);
    drawWithShadowNormal(kills, xpos + 198 - font.width(kills) - 2, y + 20 + 15, textColor);
});

module.handle("onTick", function(e) {
    if(++ticks % (20 * mc.getTimerSpeed()) == 0){
        playtimeSeconds++;
    }
});

module.handle("onKill", function(e) {
    kills++;
});

module.handle("onGameEvent", function(e) {
    if(!(network.isMultiplayer() || network.isSingleplayer())){
        kills = 0;
        playtimeSeconds = 0;
        gameswon = 0;
    }
});
