var module = rise.registerModule("HUD Novoline Arraylist", "Displays Novoline Arraylist");

var font = render.getCustomFontRenderer("SFUIDisplay-Thin", 18, true);
var bgfont = render.getCustomFontRenderer("SFUIDisplay-Thin", 18, true);
module.registerSetting("number", "Arraylist X", 720, 1, 3000);
module.registerSetting("number", "Arraylist Y", 1, 1, 3000);


var modules = [];
var animationSpeed = 0.05;

var brightness = [1, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9];
var lastUpdate = Date.now();
var waveSpeed = 150;
var shouldRerender = false; 

var modulePadding = 1.5;           // Padding between the rectangle and the text
var betweenModulePadding = 0;    // Padding between each module

var fontThickness = .4;  // Default thickness. You can adjust this value.
    var ArraylistX = module.getSetting("Arraylist X")
    var ArraylistY = module.getSetting("Arraylist Y")

function drawWithShadowNormal(text, x, y, color, thickness) {
    thickness = thickness || fontThickness;  // If no thickness is provided, use the default value
    bgfont.drawWithShadow(text, x + thickness, y, [0, 0, 0]);
    font.drawWithShadow(text, x, y, color);
};

function drawCenteredText(text, rectX, rectY, rectWidth, rectHeight, color, thickness) {
    var textWidth = font.width(text);
    var textHeight = font.height();

    var centerX = rectX + (rectWidth - textWidth) / 2;
    var centerY = rectY + (rectHeight - textHeight) / 2;

    drawWithShadowNormal(text, centerX, centerY, color, thickness);
};

function checkSettingsAndRerender() {
    var currentArraylistX = module.getSetting("Arraylist X");
    var currentArraylistY = module.getSetting("Arraylist Y");
    
    if (currentArraylistX !== ArraylistX || currentArraylistY !== ArraylistY) {
        ArraylistX = currentArraylistX;
        ArraylistY = currentArraylistY;
        shouldRerender = true;
    }
}


module.handle("onEnable", function(e) {
    var unprocessedModules = rise.getModules();


        modules = [];
        var totalHeight = 0;
    
        for (var index = 0; index < unprocessedModules.length; index++) {
            var mod = unprocessedModules[index];
            var moduleName = mod.getName() || "";
            var moduleTag = mod.getTag() || "";
            
            // Add a space only if there's a tag
            var combinedWidth = font.width(moduleName + moduleTag);


            var xStart = ArraylistX - combinedWidth;
            modules[index] = [mod, rise.newVec2(xStart, totalHeight), moduleTag];
            totalHeight += font.height() + betweenModulePadding;
        }
        
    checkSettingsAndRerender();
    if (shouldRerender) {
        var unprocessedModules = rise.getModules();


        modules = [];
        var totalHeight = 0;
    
        for (var index = 0; index < unprocessedModules.length; index++) {
            var mod = unprocessedModules[index];
            var moduleName = mod.getName() || "";
            var moduleTag = mod.getTag() || "";
            
            // Add a space only if there's a tag
            var combinedWidth = font.width(moduleName + moduleTag);

            
            var xStart = ArraylistX - combinedWidth;
            modules[index] = [mod, rise.newVec2(xStart, totalHeight), moduleTag];
            totalHeight += font.height() + betweenModulePadding;
        }
        
        shouldRerender = false;
    }


});

module.handle("onRender2D", function(e) {
    checkSettingsAndRerender();

    var targetPosition = rise.newVec2(ArraylistX, ArraylistY);

    if (Date.now() - lastUpdate > waveSpeed) {
        brightness.unshift(brightness.pop());
        lastUpdate = Date.now();
    }

    modules.sort(function(a, b) {
        return font.width(b[0].getName() + (b[2] ? " " + b[2] : "")) - font.width(a[0].getName() + (a[2] ? " " + a[2] : ""));
    });

    for (var index = 0; index < modules.length; index++) {
        var moduleInfo = modules[index];
        var module = moduleInfo[0];
        var moduleTag = moduleInfo[2];

        if (module.isEnabled()) {
            moduleInfo[1].setY(lerp(moduleInfo[1].getY(), targetPosition.getY(), animationSpeed));
            
            var themeColor = render.getThemeColor();
            var modColor = [
                themeColor[0] * brightness[index % brightness.length], 
                themeColor[1] * brightness[index % brightness.length], 
                themeColor[2] * brightness[index % brightness.length], 
                themeColor[3]
            ];

            var textWidth = font.width(module.getName());
            var tagWidth = moduleTag ? font.width(moduleTag) : 0;
            var gapWidth = moduleTag ? 3 : 0; // Gap between module name and tag
            var combinedWidth = textWidth + tagWidth + gapWidth;
            
            var rectWidth = combinedWidth + modulePadding * 2;
            var xStart = ArraylistX - rectWidth + modulePadding;
            
            render.rectangle(xStart - modulePadding, 
                moduleInfo[1].getY() - modulePadding, 
                rectWidth, 
                font.height() + 0 * modulePadding,
                [0, 0, 0, 26]);

            var centerY = moduleInfo[1].getY() + (font.height() / 2);
            drawCenteredText(module.getName(), xStart, centerY - font.height()/2, textWidth, font.height(), modColor, fontThickness);
            
            if (moduleTag) {
                drawCenteredText(moduleTag, xStart + textWidth + gapWidth, centerY - font.height()/2, tagWidth, font.height(), [200, 200, 200, 255], fontThickness);
            }

            targetPosition.setY(targetPosition.getY() + font.height() + betweenModulePadding);
        }
    }

    return e;
});


function lerp(a, b, c) {
    return a + c * (b - a);
}

script.handle("onUnload", function () {
    module.unregister();
});
