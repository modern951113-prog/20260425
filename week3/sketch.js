// 遊戲狀態
const WAITING = 0;
const PLAYING = 1;
const FAILED = 2;
const SUCCESS = 3;
const MENU = 4;
let gameState = MENU;
let currentLevel = 1; // 新增關卡變數

// 軌道
let upperPoints = [];
let lowerPoints = [];
// 定義每個關卡的軌道寬度
const levelGaps = {
  1: 50, // 簡單
  2: 30, // 普通
  3: 15  // 困難
};
const numPoints = 20; // 軌道點的數量

// UI 元素
let startButton;
let finishZone;

// 雜訊參數，用於產生隨機軌道
let noiseOffsetX = 0;

// 計時器變數
let startTime = 0;
let elapsedTime = 0;

// 畫面效果變數
let flashEffect = 0;
let shakeEffect = 0;

// 背景圖片
let menuBackgroundImg;

function preload() {
  menuBackgroundImg = loadImage('Backgrounds.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // generateTrack(); // 延後到選擇困難度後再產生

  // 定義開始按鈕和終點區域的範圍
  startButton = { x: 0, y: 0, w: 100, h: height };
  finishZone = { x: width - 50, y: 0, w: 50, h: height };
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  startButton = { x: 0, y: 0, w: 100, h: height };
  finishZone = { x: width - 50, y: 0, w: 50, h: height };
  if (gameState !== MENU) {
    generateTrack();
  }
}

// 產生不規則的軌道點
function generateTrack() {
  upperPoints = [];
  lowerPoints = [];
  const trackGap = levelGaps[currentLevel]; // 根據目前關卡取得寬度
  const startY = height / 2;
  const stepX = width / (numPoints - 1);

  for (let i = 0; i < numPoints; i++) {
    let x = i * stepX;
    // 使用 Perlin noise 產生平滑的隨機 Y 座標
    let yOffset = map(noise(noiseOffsetX + i * 0.1), 0, 1, -height / 4, height / 4);
    let y = startY + yOffset;

    // 根據中心線和安全寬度計算上下邊界
    upperPoints.push(createVector(x, y - trackGap / 2));
    lowerPoints.push(createVector(x, y + trackGap / 2));
  }
}

function draw() {
  push(); // 為了畫面晃動效果

  if (shakeEffect > 0) {
    translate(random(-5, 5), random(-5, 5));
    shakeEffect--;
  }

  if (gameState === MENU) {
    drawMenu();
  } else {
    background(20, 20, 30); // 深色背景以突顯光暈效果

    drawTrack();
    drawStartZone();
    drawFinishZone();
    drawTimer();

    // 根據遊戲狀態更新畫面與邏輯
    switch (gameState) {
      case WAITING:
        drawStatusText(`關卡 ${currentLevel} - 準備好了嗎？點擊「開始」區域`, color(255));
        break;
      case PLAYING:
        elapsedTime = millis() - startTime;
        drawStatusText(`關卡 ${currentLevel} - 遊戲進行中...`, color(0, 255, 0));
        checkCollision();
        checkSuccess();
        drawCursor();
        break;
      case FAILED:
        drawStatusText("遊戲結束！", color(255, 0, 0));
        drawFailedButtons();
        break;
      case SUCCESS:
        drawStatusText("挑戰成功！你已征服所有關卡！", color(0, 255, 255));
        drawBackToMenuButton();
        break;
    }
  }

  pop(); // 恢復畫布狀態

  // 繪製閃爍效果 (在最上層，不受晃動影響)
  if (flashEffect > 0) {
    // 模擬電視壞掉的雜訊和掃描線效果
    for (let i = 0; i < 15; i++) {
      // 畫一些錯位的水平線
      stroke(random(255), random(50, 150));
      strokeWeight(random(1, 3));
      let y = random(height);
      line(random(-20, 20), y, width + random(-20, 20), y);
    }
    // 加上一些雜訊點
    for (let i = 0; i < 2000; i++) {
      stroke(random(255), random(200));
      point(random(width), random(height));
    }
    flashEffect--;
  }
}

// 繪製軌道（帶有光暈效果）
function drawTrack() {
  noFill();
  // 繪製多層半透明線條以產生光暈
  for (let i = 10; i > 0; i--) {
    stroke(0, 150, 255, 50 - i * 4);
    strokeWeight(i * 3);
    drawCurve(upperPoints);
    drawCurve(lowerPoints);
  }

  // 繪製主要的軌道實線
  stroke(255);
  strokeWeight(2);
  drawCurve(upperPoints);
  drawCurve(lowerPoints);
}

// 使用 curveVertex 繪製一條平滑曲線
function drawCurve(points) {
  beginShape();
  if (points.length > 0) {
    curveVertex(points[0].x, points[0].y); // 第一個點作為控制點
    for (let p of points) {
      curveVertex(p.x, p.y);
    }
    curveVertex(points[points.length - 1].x, points[points.length - 1].y); // 最後一個點作為控制點
  }
  endShape();
}

// 繪製開始區域
function drawStartZone() {
  noStroke();
  fill(0, 255, 0, 50);
  rect(startButton.x, startButton.y, startButton.w, startButton.h);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("開始", startButton.w / 2, startButton.h / 2);
}

// 繪製終點區域
function drawFinishZone() {
  noStroke();
  fill(0, 255, 255, 50);
  rect(finishZone.x, finishZone.y, finishZone.w, finishZone.h);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("終點", finishZone.x + finishZone.w / 2, finishZone.h / 2);
}

// 繪製計時器
function drawTimer() {
  fill(255);
  noStroke();
  textSize(20);
  textAlign(RIGHT, TOP);
  text("時間: " + (elapsedTime / 1000).toFixed(2) + "s", width - 20, 20);
}

// 繪製選單
function drawMenu() {
  image(menuBackgroundImg, 0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(40);
  noStroke();
  // 設定標題為紅色
  let title = "電流激激棒，擊中你心臟!";
  fill(255, 0, 0); // 紅色
  text(title, width / 2, height / 3);
  
  fill(255); // 將顏色重設為白色，供後續文字使用
  textSize(32);
  text("年輕人，你準備好了嗎?", width / 2, height / 3 + 60);
  
  let btnW = 200;
  let btnH = 50;
  let startY = height / 2;

  drawButton(width / 2, startY, btnW, btnH, "開始遊戲", color(0, 200, 0));
}

function drawButton(x, y, w, h, label, col) {
  rectMode(CENTER);
  fill(col);
  rect(x, y, w, h, 10);
  fill(0);
  textSize(24);
  text(label, x, y);
  rectMode(CORNER);
}

function drawBackToMenuButton() {
  let btnW = 200;
  let btnH = 50;
  let x = width / 2;
  let y = height / 2 + 100;
  drawButton(x, y, btnW, btnH, "回到首頁", color(200));
}

function drawFailedButtons() {
  let btnW = 200;
  let btnH = 50;
  let x = width / 2;
  let y1 = height / 2 + 50;
  let y2 = height / 2 + 120;
  drawButton(x, y1, btnW, btnH, "回到存檔點", color(0, 200, 0));
  drawButton(x, y2, btnW, btnH, "回到首頁", color(200, 0, 0));
}

// 繪製狀態提示文字
function drawStatusText(msg, col) {
  fill(col);
  noStroke();
  textSize(24);
  textAlign(CENTER, CENTER);
  text(msg, width / 2, 30);
}

// 繪製代表玩家的游標
function drawCursor() {
  fill(255, 255, 0);
  noStroke();
  ellipse(mouseX, mouseY, 10, 10);
}

// 處理滑鼠點擊事件
function mousePressed() {
  if (gameState === MENU) {
    checkMenuClick();
    return;
  }

  if (gameState === FAILED) {
    if (checkFailedClick()) return;
    return; // 失敗狀態下，必須點擊按鈕選擇
  }

  if (gameState === SUCCESS) {
    if (checkBackToMenuClick()) return;
    return; // 成功狀態下，必須點擊按鈕
  }

  // 檢查是否點擊了開始區域
  if (mouseX > startButton.x && mouseX < startButton.x + startButton.w &&
    mouseY > startButton.y && mouseY < startButton.y + startButton.h) {
    if (gameState === WAITING) {
      // 重新產生軌道並開始新遊戲
      noiseSeed(millis()); // 使用當前時間作為雜訊種子
      noiseOffsetX = random(1000);
      generateTrack();
      gameState = PLAYING;
      startTime = millis();
      elapsedTime = 0;
    }
  }
}

function checkMenuClick() {
  let btnW = 200;
  let btnH = 50;
  let startY = height / 2;

  if (isMouseOverButton(width / 2, startY, btnW, btnH)) {
    gameState = WAITING;
    currentLevel = 1; // 從第一關開始
    generateTrack();
  }
}

function checkFailedClick() {
  let btnW = 200;
  let btnH = 50;
  let x = width / 2;
  let y1 = height / 2 + 50;
  let y2 = height / 2 + 120;

  if (isMouseOverButton(x, y1, btnW, btnH)) {
    gameState = WAITING; // 回到當前關卡準備狀態
    generateTrack();
    return true;
  } else if (isMouseOverButton(x, y2, btnW, btnH)) {
    gameState = MENU; // 回到首頁
    return true;
  }
  return false;
}

function checkBackToMenuClick() {
  let btnW = 200;
  let btnH = 50;
  let x = width / 2;
  let y = height / 2 + 100;

  if (isMouseOverButton(x, y, btnW, btnH)) {
    gameState = MENU;
    return true;
  }
  return false;
}

function isMouseOverButton(x, y, w, h) {
  return mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2;
}

// 碰撞偵測邏輯
function checkCollision() {
  // 只有在遊戲區域內才進行偵測
  if (mouseX < startButton.w || mouseX > finishZone.x) {
    return;
  }

  const upperY = getCurveYatX(upperPoints, mouseX);
  const lowerY = getCurveYatX(lowerPoints, mouseX);

  // 如果滑鼠的 Y 座標超出安全範圍，則遊戲失敗
  if (mouseY < upperY || mouseY > lowerY) {
    if (gameState === PLAYING) { // 確保只觸發一次
      gameState = FAILED;
      flashEffect = 45; // 觸發閃爍效果，持續 45 幀
    }
  }
}

// 根據給定的 x 座標，計算曲線上對應的 y 座標
function getCurveYatX(points, x) {
  // 找到 x 所在的曲線段
  let segment = -1;
  for (let i = 0; i < points.length - 1; i++) {
    if (x >= points[i].x && x <= points[i + 1].x) {
      segment = i;
      break;
    }
  }

  if (segment === -1) return -1; // x 在曲線範圍之外

  // curvePoint 需要四個控制點 p1, p2, p3, p4
  // 我們要找的是 p2 和 p3 之間的點
  const p1 = points[max(0, segment - 1)];
  const p2 = points[segment];
  const p3 = points[segment + 1];
  const p4 = points[min(points.length - 1, segment + 2)];

  // 根據 x 在 p2 和 p3 之間的比例，估算 t 值 (0 到 1)
  const t = map(x, p2.x, p3.x, 0, 1);

  // 使用 curvePoint 計算對應的 y 值
  return curvePoint(p1.y, p2.y, p3.y, p4.y, t);
}

// 檢查是否到達終點
function checkSuccess() {
  if (mouseX > finishZone.x && gameState === PLAYING) {
    if (currentLevel < 3) {
      // 如果不是最後一關，進入下一關
      currentLevel++;
      noiseSeed(millis());
      noiseOffsetX = random(1000);
      generateTrack();
      gameState = WAITING; // 回到準備狀態，開始新關卡
    } else {
      // 如果是最後一關，則遊戲成功
      gameState = SUCCESS;
      shakeEffect = 30; // 觸發晃動效果，持續 30 幀
    }
  }
}
