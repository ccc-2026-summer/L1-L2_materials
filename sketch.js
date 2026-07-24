/*
Project name: Rusty texture of tin house
Author: Yun-Chen Lee yclee@arch.nycu.edu.te
Date: July 23, 2026
Description: This sketch generates a layered abstract texture inspired by the weathered surface of a tin house. It combines randomized palettes, vertical strip structures, and dense dot fields to mimic rust, faded paint, and uneven metal wear. Small crosses and arcs appear occasionally to add visual noise and accidental detail, making each render feel handmade and slightly imperfect. A random palette is selected on every page load, so the same code can produce different atmospheres while keeping the same composition logic. The result is a simple generative study of material aging, surface pattern, and controlled randomness.
*/

// 色票預設 / Palette presets:
// - `colorPalette` 用在較小的表面筆觸。 / `colorPalette` is used for the smaller surface marks.
// - `basePalette` 用在較大的垂直紋理條。 / `basePalette` is used for the larger vertical texture strips.
// 每次重新整理頁面時都會隨機選一組，讓畫面保持變化。 / A random preset is chosen on every reload so the sketch feels different each time.
const PALETTE_PRESETS = [{
        name: "blue",
        colorPalette: ["#5D759A", "#222837", "#384056", "#33414f"],
        basePalette: ["#9DADBE", "#2b3139"]
    },
    {
        name: "green",
        colorPalette: ["#9FE3DB", "#9FE3DB", "#efecc8", "#ebfffd"],
        basePalette: ["#5F1C1C"]
    },
    {
        name: "brown",
        colorPalette: ["#E4DAC3", "#9D6735", "#3F332E", "#cd9154"],
        basePalette: ["#E1A060", "#E1A060"]
    }
];

// 這兩個全域變數會在 `setup()` 裡選定色票後再指定。 / These globals are assigned in `setup()` after a palette preset is selected.
let colorPalette = PALETTE_PRESETS[0].colorPalette;
let basePalette = PALETTE_PRESETS[0].basePalette;

// 負位移可以讓紋理延伸到畫布外，邊緣看起來不那麼死板。 / Negative offsets let the texture extend beyond the canvas so the edges feel less rigid.
let xPadding = 300;
let yPadding = 300;

// 使用 async 讓 setup 裡可以搭配 sleep() 做短暫停頓。 / Use async so `setup()` can pause with `sleep()`.
async function setup() {
    // 依照目前視窗大小建立畫布。 / Create the canvas using the current window size.
    createCanvas(2000, 1400);

    // 每次渲染都隨機挑一組色票，並在整個草圖中重複使用。 / Pick one palette preset for this render and reuse it everywhere.
    const selectedPalette = random(PALETTE_PRESETS);
    colorPalette = selectedPalette.colorPalette;
    basePalette = selectedPalette.basePalette;

    // 以色票中的顏色作為背景，而不是使用單調的中性色。 / Start with a palette color instead of a neutral background.
    background(random(colorPalette));
    noStroke();

    // 使用 HSB，方便從同一個顏色推導出明暗變化。 / Use HSB so lighter and darker variants are easier to derive.
    colorMode(HSB);

    // 從左到右先畫一排高直條，作為整體結構的基底。 / Draw a row of tall strips from left to right as the structural base.
    let sumWidth = 0;
    for (let i = 0; i < 40; i++) {
        // 每一條寬度都不同，避免機械式重複。 / Vary each strip width to avoid a mechanical repeat pattern.
        let stripX = sumWidth;
        let stripY = 0;
        let stripW = random(10, 150);
        let stripH = height;
        RJean_rect(stripX, stripY, stripW, stripH, basePalette);
        sumWidth += stripW;
        // 每畫完一條就稍微停一下，讓生成過程有節奏感。 / Pause briefly after each strip so the generation feels paced.
        await sleep(10);
        if (sumWidth > width) break;
    }

    // 再加入覆蓋整個畫布的紋理區塊，形成磨損、層疊的金屬表面感。 / Add overlapping blocks to build a worn, layered metal surface.
    for (let i = 0; i < 200; i++) {
        // 讓部分區塊從畫布外開始，畫面會更連續。 / Let some blocks start off-canvas so the composition feels continuous.
        let blockX = random(-xPadding, width);
        let blockY = random(-yPadding, height);
        let blockW = random(10, 150);
        let blockH = random(100, 1200);
        RJean_rect(blockX, blockY, blockW, blockH, colorPalette);
        // 每完成一個區塊就暫停一下，讓畫面是逐步長出來的。 / Pause after each block so the image grows gradually.
        await sleep(10);
    }

    noLoop();
}

function draw() {
    // 所有內容都在 `setup()` 完成，所以不需要動畫迴圈。 / Everything is drawn in `setup()`, so no animation loop is needed.
}

function windowResized() {
    // 視窗改變大小時同步更新畫布。 / Resize the canvas when the window size changes.
    resizeCanvas(windowWidth, windowHeight);
}

function RJean_rect(x, y, w, h, palette) {
    // 用一格一格的小記號，組出一個有紋理的矩形區塊。 / Build one textured rectangle from a grid of tiny marks.
    // 這裡的隨機性會讓每個區塊都略有不同。 / Randomness makes every block look slightly different.
    let dotSize = 5;
    // 稍微隨機偏移，避免點陣太整齊。 / Add a small random offset so the dots do not align too perfectly.
    let dotScl = random(-1, 2);
    // 點與點之間的水平與垂直間距。 / Horizontal and vertical spacing between dots.
    let xSpan = dotSize + random(2, 5);
    let ySpan = dotSize + random(3);
    // 把區塊尺寸換算成格數。 / Convert the block size into grid counts.
    let xCount = int((w + xSpan) / xSpan);
    let yCount = int((h + ySpan) / ySpan);
    // 控制點陣從上到下衰減的速度。 / Control how quickly the dot field fades from top to bottom.
    let tailScale = random(0, 1);

    // 為這個區塊挑一個主色。 / Pick a main color for this block.
    // 小機率改成鏽棕色，讓表面更有材質感。 / With a small chance, force a rusty brown accent for more material feel.
    let mainClr = random(palette);
    if (random() < 0.1) mainClr = "#945031";

    // 從主色推導出一個稍亮的版本，做細微變化。 / Derive a slightly lighter version of the same color for subtle variation.
    let mainHue = hue(mainClr);
    let mainSat = saturation(mainClr);
    let mainBri = brightness(mainClr);
    let lightClr = color(mainHue, mainSat - 10, mainBri + 50);

    for (let i = 0; i < yCount; i++) {
        // 區塊內目前的列位置。 / Current row position inside the block.
        let py = i * ySpan + y;
        for (let j = 0; j < xCount; j++) {
            // 區塊內目前的欄位置。 / Current column position inside the block.
            let px = j * xSpan + x;

            // 儲存目前的繪圖狀態，讓每個格子都能獨立處理。 / Save the current drawing state so each cell can be handled independently.
            push();
            translate(px, py);

            // 稍微變化每個點的大小，讓質感更像手工生成。 / Slightly vary each dot size so the texture feels hand-made.
            let dotSizeVariation = dotSize * random(0.8, 1.2) + dotScl;

            // 主點陣：上方較密，下方較疏。 / Main dot field: denser near the top, lighter near the bottom.
            if ((random() - tailScale) < (1 - i / yCount)) {
                fill(mainClr);
                // 當 x 落在正弦帶狀區時，切換成較亮的顏色。 / Switch to a lighter color when x falls into a sine-based band.
                if (abs(sin(px / 10)) < 0.3) fill(lightClr);

                // 少量亮點可以打破大面積平坦區。 / Rare accent dots break up large flat areas.
                if (random() < 0.01) fill(random(colorPalette));
                circle(0, 0, dotSizeVariation);
            }

            // 偶爾加上十字記號。 / Add an occasional cross mark.
            if (random() < 0.05) {
                noFill();
                stroke(mainClr);
                strokeWeight(2);
                // 兩條對角線組成一個小 X。 / Two diagonal lines create a small X shape.
                line(-dotSize, -dotSize, dotSize, dotSize);
                line(-dotSize, dotSize, dotSize, -dotSize);
            }

            // 極少量的弧線，增加表面變化。 / Rare arcs add extra surface variation.
            if (random() < 0.005) {
                noFill();
                stroke("#945031");
                strokeWeight(2);
                push();
                // 旋轉弧線，避免方向太固定。 / Rotate the arc so the detail does not repeat in one direction.
                rotate(random(PI * 2));
                // 畫一段不完整的圓弧，像是刮痕或掉漆。 / Draw a partial arc that feels like a scratch or chipped paint.
                arc(-random(dotSize),
                    random(dotSize),
                    dotSize * 2 * random(0.8, 2),
                    dotSize * 2 * random(0.8, 2),
                    0,
                    PI * 1.5
                );
                pop();
            }

            // 回復繪圖狀態，進入下一格。 / Restore the drawing state before moving to the next cell.
            pop();
        }
    }
}

// 暫停指定毫秒數，常用來控制生成速度。 / Pause for a specified number of milliseconds, useful for controlling generation speed.
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}