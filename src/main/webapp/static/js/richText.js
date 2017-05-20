var RichText = (function(){
    var boxes = {};
    var ergonomics = {
        cursorWidth:3,
        cursorOverlap:1.5,
        comfortableColumnWidth:28,
        lineHeightRatio:1.8
    };
    var cursor = {};
    var measureCanvas = $("<canvas />")[0].getContext("2d");
    var fontHeight = function(char){
        return Math.floor(parseFloat(char.fontSize));
    };
    var measureChar = function(char,preceding){
        measureCanvas.font = fontString(char.fontFamily,char.fontSize);
        var width;
        if(preceding){
            width = measureCanvas.measureText([preceding.char,char.char].join("")).width  - measureCanvas.measureText(preceding.char).width;
        }
        else{
            width = measureCanvas.measureText(char.char).width;
        }
        switch(char.char){
        case " ": break;
        case "\n": width = 0; break;
        default:;
        }
        return {
            width:width,
            height:fontHeight(char)
        }
    }
    var measureLine = function(y,box){
        y = y || cursor.y;
        var width = 0,height = 0;
        var i,char;
        var chars = _.concat(box.head,box.tail);
        var line = [];
        for(i = 0;i<chars.length;i++){
            char = chars[i];
            if(char.y < cursor.y) continue;
            if(char.y > cursor.y) break;
            line.push(char);
        }
        for(i = 0;i<line.length;i++){
            char = line[i];
            height = Math.max(height,char.height);
            width += char.width;
        }
        return {
            x:width > 0 ? line[0].x : 0,
            y:y,
            height:height,
            width:width,
            chars:line
        };
    }
    var fontString = function(fontFamily,fontSize){
        return sprintf("%spt %s",Math.floor(fontSize),fontFamily);
    };
    var setCursorFont = function(fontFamily,fontSize){
        cursor.fontFamily = fontFamily || cursor.fontFamily;
        cursor.fontSize = fontSize || cursor.fontSize;
    }
    var render = function(context,box){
        var char;
        var i;
        var screenPos;
        for(i = 0; i < box.head.length; i++){
            char = box.head[i];
            context.font = fontString(char.fontFamily,scaleWorldToScreen(char.fontSize));
            context.fillStyle = char.color;
            screenPos = worldToScreen(char.x,char.y);
            context.fillText(char.char, screenPos.x, screenPos.y);
        }
        for(i = 0; i < box.tail.length; i++){
            char = box.tail[i];
            context.font = fontString(char.fontFamily,scaleWorldToScreen(char.fontSize));
            context.fillStyle = char.color;
            screenPos = worldToScreen(char.x,char.y);
            context.fillText(char.char, screenPos.x, screenPos.y);
        }
        if(box == cursor.box){
	    context.fillStyle = cursor.color;
            char = box.head.length ? box.head[box.head.length-1] : {
                x:cursor.x,
                y:cursor.y,
                width:0,
                height:cursor.fontSize
            };
            var cursorPos = worldToScreen(char.x,char.y);
            var cursorWidth = scaleWorldToScreen(ergonomics.cursorWidth);
            var charWidth = scaleWorldToScreen(char.width);
            var cursorHeight = scaleWorldToScreen(char.height);
            context.fillRect(
                cursorPos.x+charWidth,
                cursorPos.y - cursorHeight,
                cursorWidth,
                cursorHeight * ergonomics.cursorOverlap);
        }
    };
    var wrap = function(box){
        var leftMargin = box.x;
        var cursorX = leftMargin;
        var cursorY = box.y;
        var startOfLine = 0;
        var wordStart = 0;
        var lineDimension;
        var chars = _.concat(box.head,box.tail);
        var char;
        for(var i = 0;i<chars.length;i++){
            char = chars[i];
            char.x = cursorX;
            char.y = cursorY;
            if(char.char == " "){
                wordStart = i;
            }
            if(char.char == "\n"){
                startOfLine = wordStart;
                cursorX = leftMargin;
                cursorY = cursorY + measureLine(char.y,box).height * ergonomics.lineHeightRatio;
                char.x = cursorX;
                char.y = cursorY;
            }
            else if((i - startOfLine) > ergonomics.comfortableColumnWidth && wordStart != startOfLine){
                startOfLine = wordStart;
                cursorY = cursorY + measureLine(char.y,box).height * ergonomics.lineHeightRatio;
                cursorX = leftMargin;
                i = wordStart;
            }
            else{
                cursorX += char.width;
            }
        }
    };
    return {
        newIdentity:function(){
            return sprintf("%s_%s_%s",UserSettings.getUsername(),Date.now(),_.uniqueId());
        },
        setAttributes:function(attributes){
            setCursorFont(attributes.fontFamily,attributes.fontSize);
            cursor.color = attributes.color;
	    console.log("Set attributes",cursor.color);
	    blit();
        },
        create:function(worldPos){
            var id = RichText.newIdentity();
            var box = boxes[id] = {
                identity:id,
                author:UserSettings.getUsername(),
                head:[],
                tail:[],
                x:worldPos.x,
                y:worldPos.y
            };
            cursor.box = box;
            blit();
        },
        listen:function(context){
            $("#textInputInvisibleHost").off("keydown").on("keydown",function(e){
                var chars = cursor.chars;
                var typed = e.key;
                var charSize;
                var tip, pretip;
                switch(typed){
                case "Shift":break;
                case "Alt":break;
                case "Control":break;
                case "CapsLock":break;
                case "ArrowLeft":
                    if(cursor.box.head.length){
                        cursor.box.tail.unshift(cursor.box.head.pop());
                        blit();
                    }
                    break;
                case "ArrowRight":
                    if(cursor.box.tail.length){
                        cursor.box.head.push(cursor.box.tail.shift());
                        blit();
                    }
                    break;
                case "Backspace":
                    if(cursor.box.head.length){
                        cursor.box.head.pop();
                        wrap(cursor.box);
                        blit();
                    }
                    break;
                case "Delete":
                    if(cursor.box.tail.length){
                        cursor.box.tail.shift();
                        wrap(cursor.box);
                        blit();
                    }
                    break;
                default:
                    typed = typed == "Enter" ? "\n" : typed;
                    if(typed.length > 1) return;/*F keys, Control codes etc.*/
                    console.log("cursor",typed,cursor.color);
                    var char = {
                        char:typed,
                        fontSize:cursor.fontSize,
                        fontFamily:cursor.fontFamily,
                        color:cursor.color,
                        x:cursor.x,
                        y:cursor.y
                    };
                    var previous = cursor.box.head[cursor.box.head.length-1];
                    cursor.box.head.push(char);
                    charSize = measureChar(char,previous);
                    char.width = charSize.width;
                    char.height = charSize.height;
                    wrap(cursor.box);
                    blit();
                }
            }).focus();
        },
        add:function(){},
        clear:function(){
            boxes = {};
        },
        render:function(canvasContext){
            _.each(boxes,function(box){
                render(canvasContext,box);
            });
        },
        cursor:function(){
            return cursor;
        },
        measureChar:function(i){
            return measureChar(cursor.box.chars[i]);
        }
    };
})();