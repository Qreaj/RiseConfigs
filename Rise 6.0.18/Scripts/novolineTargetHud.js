var module = rise.registerModule("Novoline Targethud", "Type .script reload TargetHuds if there is no settings");

script.handle("onUnload", function () {
   module.unregister();
});

var healthbarWidth = 26;
var darkHealthbarWidth = 26;
var previousTarget = null;
var targetWidth = healthbarWidth;

module.registerSetting("mode", "Mode", "Novoline", "Novoline", "Novoline 2");
module.registerSetting("number", "X", 381, 1, 1000);
module.registerSetting("number", "Y", 250, 1, 1000);
module.registerSetting("boolean", "Shaders", false);



// lerp
function lerp(a, b, c) {
  return a + c * (b - a);
}

// health color
function healthColor(health, maxHealth) {
   var percentage = health / maxHealth;
   if (percentage >= 0.75) return [0, 165, 0]; // green
   if (percentage >= 0.5) return [255, 255, 0]; // yellow
   if (percentage >= 0.2) return [255, 155, 0]; // orange
   return [255, 0, 0]; // red
}

// time utils
var time = 0
function getElapsedTime() {
   return rise.getSystemMillis() - time;
}

function hasReached(ms) {
   return rise.getSystemMillis() - time >= ms;
}

function reset() {time = rise.getSystemMillis();}


/*
   some things if you guys don't understand
   healthbar formula - Math.floor((realWidth) * (health / maxHealth));
   (the real width is the max you want your healthbar to go)
   center X - (rectangleWidth / 2) - font.width(text))
*/

module.handle("onAttack", function (attackEvent) {
   var animationSpeed = module.getSetting("animation speed");
   var font = render.getMinecraftFontRenderer();
   var shaders = module.getSetting("Shaders");
   var target = attackEvent.getTarget();
   var mode = module.getSetting("Mode");
   var x = module.getSetting("X");
   var y = module.getSetting("Y");

   module.handle("onRender2D", function (e) {
      if (player.getDistanceToEntity(target) >= 5 || target.isDead()) return;

      var health = target.getHealth().toFixed(1);
      var maxHealth = target.getMaxHealth();
      var targetName = target.getDisplayName();
      var distance = player.getDistanceToEntity(target).toFixed(0)

      switch (mode) {

            case "Novoline 2":
               var scale = 1.1; // Scaling factor
               var healthPer = (health / maxHealth) * 100;
               var newTargetWidth = Math.floor((26 + font.width(target.getDisplayName())) * (health / maxHealth) * scale);
           
               if (newTargetWidth != targetWidth) {
                   targetWidth = newTargetWidth;
                   if (healthPer <= 0) {
                       healthbarWidth = targetWidth; // Reset to original width if health is 0%
                   }
               }
           
               var particalTicks = 1 - e.getPartialTicks();
               var easingFactor = 0.3; // Adjust this value to change the speed of the easing
           
               // Easing function for main health bar
               healthbarWidth += (targetWidth - healthbarWidth) * easingFactor * particalTicks;
           
               // Easing function for darker health bar
               var darkEasingFactor = 0.08;
               darkHealthbarWidth += (targetWidth - darkHealthbarWidth) * darkEasingFactor * particalTicks;
           
               var themeColor = render.getThemeColor();
               var darkThemeColor = [themeColor[0] * 0.4, themeColor[1] * 0.4, themeColor[2] * 0.4, themeColor[3]]; // Making the theme color slightly darker
           
               render.rectangle(x, y, (74 + font.width(target.getDisplayName())) * scale, 42 * scale, [40, 40, 40, 255]);
               font.drawWithShadow(target.getDisplayName(), x + 44 * scale, y + 7 * scale, [255, 255, 255, 255]);
           
               render.rectangle(x + 44 * scale, y + 17 * scale, (26 + font.width(target.getDisplayName())) * scale, 11 * scale, [21, 21, 21, 150]);
               render.rectangle(x + 44 * scale, y + 17 * scale, darkHealthbarWidth, 11 * scale, darkThemeColor); // Darker health bar
               render.rectangle(x + 44 * scale, y + 17 * scale, healthbarWidth, 11 * scale, themeColor);
           
               if (module.getSetting("Shaders")) {
                    render.bloom(function() {
                        render.rectangle(x + 44 * scale, y + 17 * scale, (26 + font.width(target.getDisplayName())) * scale, 11 * scale, [21, 21, 21, 150]);
                    render.rectangle(x + 44 * scale, y + 17 * scale, darkHealthbarWidth, 11 * scale, darkThemeColor); // Darker health bar
                    render.rectangle(x + 44 * scale, y + 17 * scale, healthbarWidth, 11 * scale, themeColor);
                    })
               }

               var width = (26 + font.width(target.getDisplayName())) * scale;
               font.drawWithShadow(healthPer.toFixed(1) + "%", x + 44 * scale + width / 2 - font.width(healthPer.toFixed(1) + "%") / 2, y + 20 * scale, [255, 255, 255]);
           
               // Get theme color 
               var themeColor = render.getThemeColor();

               // Health text 

               var healthText = health;

               // Heart symbol
               var heartSymbol = '❤';

               // Get theme and calculate text widths

               var healthTextWidth = font.width(healthText);

               // Draw health text
               font.drawWithShadow(
               healthText, 
               x + 45 * scale,
               y + 32.48 * scale,
               [255, 255, 255, 255]  
               );

               // Calculate padded x position based on health text width
               var heartX = x + 45 * scale + healthTextWidth + 2 * scale;

               // Draw heart at padded position 
               font.drawWithShadow(
               heartSymbol,
               heartX, 
               y + 32.48 * scale,
               themeColor
               );
               
           
           
            

            // Drawing every steve pixel by hand 😭😭
            if (target.isPlayer()) {
               var renderRectangle = function(startX, startY, width, height, colors) {
                   for (var i = 0; i < colors.length; i++) {
                       render.rectangle(startX + (i * width * 1.1), startY, width * 1.1, height * 1.1, colors[i]);
                   }
               };
           
           
               var layers = [
  [[47, 32, 13, 255], [47, 30, 13, 255], [47, 31, 15, 255], [40, 28, 11, 255], [36, 24, 8, 255], [38, 26, 10, 255], [43, 30, 13, 255], [42, 29, 13, 255]],
  // layer 2
  [[43, 30, 13, 255], [43, 30, 13, 255], [43, 30, 13, 255], [51, 36, 17, 255], [66, 42, 18, 255], [63, 42, 21, 255], [44, 30, 14, 255], [43, 30, 14, 255]],
  // layer 3
  [[43, 30, 13, 255], [182, 137, 108, 255], [189, 142, 114, 255], [198, 150, 128, 255], [189, 139, 114, 255], [189, 142, 116, 255], [172, 118, 90, 255], [43, 30, 14, 255]],
  // layer 4
  [[170, 125, 102, 255], [180, 132, 109, 255], [170, 125, 102, 255], [173, 128, 109, 255], [156, 114, 92, 255], [187, 137, 114, 255], [156, 105, 76, 255], [156, 105, 76, 255]],
  // layer 5
  [[180, 132, 109, 255], [255, 255, 255, 255], [82, 61, 137, 255], [181, 123, 103, 255], [187, 137, 114, 255], [82, 61, 137, 255], [255, 255, 255, 255], [170, 125, 102, 255]],
  // layer 6
  [[156, 99, 70, 255], [179, 123, 93, 255], [183, 130, 114, 255], [106, 64, 48, 255], [106, 64, 48, 255], [190, 136, 108, 255], [162, 106, 71, 255], [128, 83, 52, 255]],
  // layer 7
  [[144, 94, 67, 255], [150, 95, 64, 255], [119, 66, 53, 255], [119, 66, 53, 255], [119, 66, 53, 255], [119, 66, 53, 255], [143, 94, 62, 255], [129, 83, 57, 255]],
  // layer 8
  [[111, 69, 44, 255], [109, 67, 42, 255], [129, 83, 57, 255], [129, 83, 57, 255], [122, 78, 51, 255], [131, 85, 59, 255], [131, 85, 59, 255], [122, 78, 51, 255]],
];



var scale = 1.05; // Scaling factor to make everything 1.1 times bigger

// Default positions


// Get current X and Y  


// Calculate xOffset with linear multiplier
var xMultiplier = .048; 
var yMultiplier = .045; 
var xOffset = x  * -xMultiplier;
var yOffset = y  * -yMultiplier;
// Y offset remains the same


for (var j = 0; j < layers.length; j++) {
   renderRectangle((x + 1 + xOffset) * scale, (y + (j * 5) + 1 + yOffset) * scale, 5 * scale, 5 * scale, layers[j]);
}
}
           



            
            break;
            case "Novoline":
               var healthPer = (health / maxHealth) * 100;
               var newTargetWidth = Math.floor((26 + font.width(target.getDisplayName())) * (health / maxHealth));
           
               if (newTargetWidth != targetWidth) {
                   targetWidth = newTargetWidth;
                   if (healthPer <= 0) {
                       healthbarWidth = targetWidth; // Reset to original width if health is 0%
                   }
               }
           
               var particalTicks = 1 - e.getPartialTicks();
               var easingFactor = 0.23; // Adjust this value to change the speed of the easing
           
               // Easing function for main health bar
               healthbarWidth += (targetWidth - healthbarWidth) * easingFactor * particalTicks;
           
               // Easing function for darker health bar
               var darkEasingFactor = 0.10;
               darkHealthbarWidth += (targetWidth - darkHealthbarWidth) * darkEasingFactor * particalTicks;
           
               var themeColor = render.getThemeColor();
               var darkThemeColor = [themeColor[0] * 0.4, themeColor[1] * 0.4, themeColor[2] * 0.4, themeColor[3]]; // Making the theme color slightly darker
           
               render.rectangle(x, y, 74 + font.width(target.getDisplayName()), 42, [40, 40, 40, 255]);
               font.drawWithShadow(target.getDisplayName(), x + 44, y + 10, [255, 255, 255, 255]);
           
               render.rectangle(x + 44, y + 22, 26 + font.width(target.getDisplayName()), 11, [21, 21, 21, 150]);
               render.rectangle(x + 44, y + 22, darkHealthbarWidth, 11, darkThemeColor); // Darker health bar
               render.rectangle(x + 44, y + 22, healthbarWidth, 11, themeColor);
           
               if (module.getSetting("Shaders")) {
                    render.bloom(function() {
                        render.rectangle(x + 44, y + 22, darkHealthbarWidth, 11, darkThemeColor); // Darker health bar
                        render.rectangle(x + 44, y + 22, healthbarWidth, 11, themeColor);
                    })
               }

               var width = 26 + font.width(target.getDisplayName());
               font.drawWithShadow(healthPer.toFixed(1) + "%", x + 44 + width / 2 - font.width(healthPer.toFixed(1) + "%") / 2, y + 24.5, [255, 255, 255]);
           
               if (shaders) {
                   render.bloom(function() {
                       render.rectangle(x + 44, y + 22, healthbarWidth, 11, themeColor);
                   });
               }
           
           
           
            

            // Drawing every steve pixel by hand 😭😭

            if (target.isPlayer()) {
               // layer 1
               render.rectangle(x + 1, y + 1, 5, 5, [47, 32, 13, 255]);
               render.rectangle(x + 6, y + 1, 5, 5, [47, 30, 13, 255]);
               render.rectangle(x + 11, y + 1, 5, 5, [47, 31, 15, 255]);
               render.rectangle(x + 16, y + 1, 5, 5, [40, 28, 11, 255]);
               render.rectangle(x + 21, y + 1, 5, 5, [36, 24, 8, 255]);
               render.rectangle(x + 26, y + 1, 5, 5, [38, 26, 10, 255]);
               render.rectangle(x + 31, y + 1, 5, 5, [43, 30, 13, 255]);
               render.rectangle(x + 36, y + 1, 5, 5, [42, 29, 13, 255]);

               // layer 2
               render.rectangle(x + 1, y + 6, 5, 5, [43, 30, 13, 255]);
               render.rectangle(x + 6, y + 6, 5, 5, [43, 30, 13, 255]);
               render.rectangle(x + 11, y + 6, 5, 5, [43, 30, 13, 255]);
               render.rectangle(x + 16, y + 6, 5, 5, [51, 36, 17, 255]);
               render.rectangle(x + 21, y + 6, 5, 5, [66, 42, 18, 255]);
               render.rectangle(x + 26, y + 6, 5, 5, [63, 42, 21, 255]);
               render.rectangle(x + 31, y + 6, 5, 5, [44, 30, 14, 255]);
               render.rectangle(x + 36, y + 6, 5, 5, [43, 30, 14, 255]);

               // layer 3
               render.rectangle(x + 1, y + 11, 5, 5, [43, 30, 13, 255]);
               render.rectangle(x + 6, y + 11, 5, 5, [182, 137, 108, 255]);
               render.rectangle(x + 11, y + 11, 5, 5, [189, 142, 114, 255]);
               render.rectangle(x + 16, y + 11, 5, 5, [198, 150, 128, 255]);
               render.rectangle(x + 21, y + 11, 5, 5, [189, 139, 114, 255]);
               render.rectangle(x + 26, y + 11, 5, 5, [189, 142, 116, 255]);
               render.rectangle(x + 31, y + 11, 5, 5, [172, 118, 90, 255]);
               render.rectangle(x + 36, y + 11, 5, 5, [43, 30, 14, 255]);

               // layer 4
               render.rectangle(x + 1, y + 16, 5, 5, [170, 125, 102, 255]);
               render.rectangle(x + 6, y + 16, 5, 5, [180, 132, 109, 255]);
               render.rectangle(x + 11, y + 16, 5, 5, [170, 125, 102, 255]);
               render.rectangle(x + 16, y + 16, 5, 5, [173, 128, 109, 255]);
               render.rectangle(x + 21, y + 16, 5, 5, [156, 114, 92, 255]);
               render.rectangle(x + 26, y + 16, 5, 5, [187, 137, 114, 255]);
               render.rectangle(x + 31, y + 16, 5, 5, [156, 105, 76, 255]);
               render.rectangle(x + 36, y + 16, 5, 5, [156, 105, 76, 255]);

               // layer 5
               render.rectangle(x + 1, y + 21, 5, 5, [180, 132, 109, 255]);
               render.rectangle(x + 6, y + 21, 5, 5, [255, 255, 255, 255]);
               render.rectangle(x + 11, y + 21, 5, 5, [82, 61, 137, 255]);
               render.rectangle(x + 16, y + 21, 5, 5, [181, 123, 103, 255]);
               render.rectangle(x + 21, y + 21, 5, 5, [187, 137, 114, 255]);
               render.rectangle(x + 26, y + 21, 5, 5, [82, 61, 137, 255]);
               render.rectangle(x + 31, y + 21, 5, 5, [255, 255, 255, 255]);
               render.rectangle(x + 36, y + 21, 5, 5, [170, 125, 102, 255]);

               // layer 6
               render.rectangle(x + 1, y + 26, 5, 5, [156, 99, 70, 255]);
               render.rectangle(x + 6, y + 26, 5, 5, [179, 123, 93, 255]);
               render.rectangle(x + 11, y + 26, 5, 5, [183, 130, 114, 255]);
               render.rectangle(x + 16, y + 26, 5, 5, [106, 64, 48, 255]);
               render.rectangle(x + 21, y + 26, 5, 5, [106, 64, 48, 255]);
               render.rectangle(x + 26, y + 26, 5, 5, [190, 136, 108, 255]);
               render.rectangle(x + 31, y + 26, 5, 5, [162, 106, 71, 255]);
               render.rectangle(x + 36, y + 26, 5, 5, [128, 83, 52, 255]);

               // layer 7
               render.rectangle(x + 1, y + 31, 5, 5, [144, 94, 67, 255]);
               render.rectangle(x + 6, y + 31, 5, 5, [150, 95, 64, 255]);
               render.rectangle(x + 11, y + 31, 5, 5, [119, 66, 53, 255]);
               render.rectangle(x + 16, y + 31, 5, 5, [119, 66, 53, 255]);
               render.rectangle(x + 21, y + 31, 5, 5, [119, 66, 53, 255]);
               render.rectangle(x + 26, y + 31, 5, 5, [119, 66, 53, 255]);
               render.rectangle(x + 31, y + 31, 5, 5, [143, 94, 62, 255]);
               render.rectangle(x + 36, y + 31, 5, 5, [129, 83, 57, 255]);

               // layer 7
               render.rectangle(x + 1, y + 36, 5, 5, [111, 69, 44, 255]);
               render.rectangle(x + 6, y + 36, 5, 5, [109, 67, 42, 255]);
               render.rectangle(x + 11, y + 36, 5, 5, [129, 83, 57, 255]);
               render.rectangle(x + 16, y + 36, 5, 5, [129, 83, 57, 255]);
               render.rectangle(x + 21, y + 36, 5, 5, [122, 78, 51, 255]);
               render.rectangle(x + 26, y + 36, 5, 5, [131, 85, 59, 255]);
               render.rectangle(x + 31, y + 36, 5, 5, [131, 85, 59, 255]);
               render.rectangle(x + 36, y + 36, 5, 5, [122, 78, 51, 255]);
            }
            break;

      }
   });
});
