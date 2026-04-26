let gameState = 'LOADING'; // 將初始狀態改為載入中
let radarAngle = 0;
let loadingProgress = 0; // 進度條變數
let bgImg;
let cellSize = 50; // 網格的大小
let cols, rows; // 總欄數與列數
let targetCol, targetRow; // 破關目標格子的座標
let currentLevel = 1; // 目前關卡
let maxLevel = 3; // 總共三關
let gridData = []; // 紀錄玩家探索過的格子
let timeLeft = 60; // 倒數計時
let confettis = []; // 儲存彩帶特效陣列
let bgMusic; // 背景音樂變數

function preload() {
  // 假設圖片副檔名為 .png，如果是 .jpg 等請自行修改
  bgImg = loadImage('true.png');
  // 載入背景音樂 (假設副檔名為 .mp3)
  bgMusic = loadSound('Night_Dance-500audio.com.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textAlign(CENTER, CENTER);
}

function draw() {
  if (gameState === 'LOADING') {
    drawLoading();
  } else if (gameState === 'START') {
    drawCover();
  } else if (gameState === 'PLAYING') {
    drawPlaying();
  } else if (gameState === 'WIN') {
    drawWin();
  } else if (gameState === 'GAMEOVER') {
    drawGameOver();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function drawLoading() {
  background(30); // 深灰色背景
  
  // 載入中文字
  fill(255);
  noStroke();
  textSize(32);
  text("載入中...", width / 2, height / 2 - 50);
  
  // 進度條外框
  stroke(255);
  strokeWeight(2);
  noFill();
  rect(width / 2 - 150, height / 2, 300, 30, 15);
  
  // 進度條填滿
  noStroke();
  fill(0, 255, 100); // 螢光綠色進度
  let barWidth = map(loadingProgress, 0, 100, 0, 290);
  rect(width / 2 - 145, height / 2 + 5, barWidth, 20, 10);
  
  // 更新進度
  loadingProgress += 1.5; // 可以調整此數值來改變載入速度
  
  if (loadingProgress >= 100) {
    gameState = 'START'; // 進度滿後切換至開始畫面
  }
}

function drawCover() {
  // 計算等比例縮放，確保圖片不會被壓縮變形且能填滿畫面
  let imgRatio = bgImg.width / bgImg.height;
  let canvasRatio = width / height;
  let drawWidth = width;
  let drawHeight = height;
  
  if (canvasRatio > imgRatio) {
    drawHeight = width / imgRatio;
  } else {
    drawWidth = height * imgRatio;
  }
  imageMode(CENTER);
  tint(255, 60); // 降低透明度至約 23%，避免干擾文字閱讀
  image(bgImg, width / 2, height / 2, drawWidth, drawHeight);
  noTint(); // 恢復透明度設定，以免影響到後面畫的雷達與文字

  // 繪製雷達 (放置於右下角)
  push();
  translate(width - 120, height - 120); // 移至右下角
  scale(0.5); // 縮小雷達尺寸以免喧賓奪主
  stroke(0, 255, 0, 80);
  noFill();
  for (let i = 50; i <= 300; i += 50) {
    circle(0, 0, i);
  }
  line(-200, 0, 200, 0);
  line(0, -200, 0, 200);
  
  // 雷達掃描光束特效
  rotate(radarAngle);
  fill(0, 255, 0, 40);
  noStroke();
  arc(0, 0, 300, 300, 0, 60);
  radarAngle += 2;
  pop();

  // 標題文字
  fill(255, 105, 180); // 粉紅色
  stroke(75, 0, 130);  // 深紫色邊框
  strokeWeight(6);
  textSize(80); // 超大字體
  text("雷達找顏色 簡單又快樂", width / 2, 100); // 顯示在視窗上方成一排

  // 閃爍的點擊提示
  if (frameCount % 60 < 30) {
    noStroke();
    fill(255, 0, 0); // 改為紅色
    textSize(36); // 放大點擊提示字體
    text("點擊滑鼠開始遊戲", width / 2, height - 80);
  }
}

function initGame() {
  // 依據關卡設定難度 (格子大小，關卡越高格子越小且越多)
  if (currentLevel === 1) {
    cellSize = 120; // 第一關：低難度
  } else if (currentLevel === 2) {
    cellSize = 75;  // 第二關：中等難度
  } else if (currentLevel === 3) {
    cellSize = 40;  // 第三關：高難度
  }

  // 根據視窗大小計算可以容納多少欄與列
  cols = floor(width / cellSize);
  rows = floor(height / cellSize);
  
  // 隨機決定目標(破關)格子的位置
  targetCol = floor(random(cols));
  targetRow = floor(random(rows));

  // 初始化探索紀錄，false 代表還沒被滑鼠摸過
  gridData = [];
  for (let c = 0; c < cols; c++) {
    let colArr = [];
    for (let r = 0; r < rows; r++) {
      colArr.push(0); // 0 代表透明度 (尚未探索)，255 為完全探索
    }
    gridData.push(colArr);
  }

  timeLeft = 60; // 每一關開始時重置倒數計時
}

function drawPlaying() {
  background(15); // 深色背景讓顏色更突出

  // 第三關機制：目標點會隨時間隨機移動 (每 450 幀，約 7.5 秒換一次位置)
  if (currentLevel === 3 && frameCount % 450 === 0) {
    targetCol = floor(random(cols));
    targetRow = floor(random(rows));
  }

  // 繪製交錯的直線與橫線形成網格
  stroke(50);
  strokeWeight(1);
  for (let x = 0; x <= width; x += cellSize) {
    line(x, 0, x, height);
  }
  for (let y = 0; y <= height; y += cellSize) {
    line(0, y, width, y);
  }

  // 計算目前滑鼠落在哪個格子內
  let mCol = floor(mouseX / cellSize);
  let mRow = floor(mouseY / cellSize);

  // 紀錄滑鼠走過的格子，將該格透明度設為 255
  if (mCol >= 0 && mCol < cols && mRow >= 0 && mRow < rows) {
    gridData[mCol][mRow] = 255;
  }

  let maxD = dist(0, 0, cols, rows); // 畫面上可能的最長距離

  // 繪製格子內被探索出來的圓圈
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      if (gridData[c][r] > 0) {
        let d = dist(c, r, targetCol, targetRow);
        
        // 圓圈大小與顏色隨距離變化
        let circleSize = map(d, 0, maxD, cellSize * 0.9, cellSize * 0.2); 
        let cr = constrain(map(d, 0, maxD * 0.4, 255, 0), 0, 255);
        let cg = constrain(map(d, 0, maxD, 0, 200), 0, 255);
        let cb = constrain(map(d, 0, maxD, 0, 255), 0, 255);

        if (c === targetCol && r === targetRow) {
          cr = 255; cg = 0; cb = 0; // 最大且紅色
          circleSize = cellSize * 0.95;
        }

        // 計算繪製透明度，最大限制在 220
        let currentAlpha = min(gridData[c][r], 220);
        fill(cr, cg, cb, currentAlpha); 
        noStroke();
        circle(c * cellSize + cellSize / 2, r * cellSize + cellSize / 2, circleSize);

        // 第二關與第三關機制：滑鼠離開後軌跡逐漸消失
        if (currentLevel >= 2) {
          if (c !== mCol || r !== mRow) {
            gridData[c][r] -= 4; // 數值越大消失越快，4 大約是留存 1 秒的軌跡
          }
        }
      }
    }
  }

  // 確保滑鼠在遊戲畫面內才繪製雷達
  if (mCol >= 0 && mCol < cols && mRow >= 0 && mRow < rows) {
    // 計算滑鼠當前格子到目標格子的距離
    let d = dist(mCol, mRow, targetCol, targetRow);

    // 距離越近（d越小），雷達圈越大
    let radarSize = map(d, 0, maxD, 300, 40); 

    // 顏色計算：近為紅色，遠為藍綠色冷色調
    let r = constrain(map(d, 0, maxD * 0.4, 255, 0), 0, 255);
    let g = constrain(map(d, 0, maxD, 0, 200), 0, 255);
    let b = constrain(map(d, 0, maxD, 0, 255), 0, 255);

    if (d === 0) {
      // 正中目標時，強制顯示純紅色與最大圈
      r = 255; g = 0; b = 0;
    }

    // 在滑鼠周圍繪製雷達探測點
    push();
    translate(mouseX, mouseY);
    
    // 雷達外圈
    stroke(r, g, b, 150); // 稍微降低透明度，以免擋住格子內的圓圈
    strokeWeight(3);
    noFill();
    circle(0, 0, radarSize);
    circle(0, 0, radarSize * 0.3); // 內層裝飾圈

    // 雷達旋轉光束
    rotate(radarAngle);
    fill(r, g, b, 60);
    noStroke();
    arc(0, 0, radarSize, radarSize, 0, 60);
    radarAngle += 6; // 掃描速度
    pop();
  }

  // 倒數計時邏輯與 UI
  if (frameCount % 60 === 0 && timeLeft > 0) {
    timeLeft--;
  }
  if (timeLeft <= 0) {
    gameState = 'GAMEOVER'; // 時間到，通關失敗
  }

  // 繪製左上角倒數計時器
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text(`時間剩餘: ${timeLeft} 秒`, 20, 20);
  textAlign(CENTER, CENTER); // 恢復置中設定以免影響其他文字
}

function drawWin() {
  background(20, 100, 20); // 綠色背景表示成功

  // 產生與繪製彩帶特效
  if (frameCount % 2 === 0) {
    confettis.push({
      x: random(width),
      y: -20, // 從畫面最上方產生
      c: color(random(100, 255), random(100, 255), random(100, 255)), // 隨機亮色系
      size: random(10, 20),
      speedY: random(3, 8), // 下墜速度
      speedX: random(-2, 2), // 左右飄移速度
      angle: random(360),
      spin: random(-10, 10) // 自轉速度
    });
  }

  for (let i = confettis.length - 1; i >= 0; i--) {
    let p = confettis[i];
    push();
    translate(p.x, p.y);
    rotate(p.angle);
    fill(p.c);
    noStroke();
    rectMode(CENTER);
    rect(0, 0, p.size, p.size * 1.5);
    pop();

    p.x += p.speedX;
    p.y += p.speedY;
    p.angle += p.spin;

    // 移除超出畫面的彩帶，節省效能
    if (p.y > height + 50) {
      confettis.splice(i, 1);
    }
  }

  fill(255);
  noStroke();
  textSize(64);
  
  if (currentLevel < maxLevel) {
    text(`🎈 恭喜通過 第 ${currentLevel} 關！ 🎈`, width / 2, height / 2 - 20);
    
    fill(200, 255, 200);
    textSize(32);
    text("點擊滑鼠進入下一關", width / 2, height / 2 + 50);
  } else {
    fill(255, 215, 0); // 全破顯示金色
    text("🎈 恭喜！全部關卡破關！ 🎈", width / 2, height / 2 - 20);
    
    fill(200, 255, 200);
    textSize(32);
    text("點擊滑鼠返回首頁", width / 2, height / 2 + 50);
  }
}

function drawGameOver() {
  background(150, 20, 20); // 暗紅色背景表示失敗

  // 繪製背景巨大跳動的叉叉 (X)
  push();
  translate(width / 2, height / 2 - 20);
  stroke(100, 0, 0, 150); // 深紅色半透明
  strokeWeight(60);
  let pulse = sin(frameCount * 5) * 15; // 呼吸跳動效果
  line(-150 - pulse, -150 - pulse, 150 + pulse, 150 + pulse);
  line(150 + pulse, -150 - pulse, -150 - pulse, 150 + pulse);
  pop();
  
  fill(255);
  noStroke();
  textSize(64);
  text("💀 通關失敗！ 💀", width / 2, height / 2 - 20);
  
  fill(255, 200, 200);
  textSize(32);
  text("時間到，點擊滑鼠返回首頁", width / 2, height / 2 + 50);
}

function mousePressed() {
  if (gameState === 'START') {
    // 確保點擊後才播放音樂，並設定為循環播放 (loop)
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();
    }
    currentLevel = 1; // 從第一關開始
    initGame(); // 產生關卡目標
    gameState = 'PLAYING';
  } else if (gameState === 'PLAYING') {
    // 判斷點擊時是否在目標格子上
    let mCol = floor(mouseX / cellSize);
    let mRow = floor(mouseY / cellSize);
    if (mCol === targetCol && mRow === targetRow) {
      gameState = 'WIN'; // 勝利！切換到破關畫面
      confettis = []; // 清空之前的彩帶，為新的過關畫面做準備
    }
  } else if (gameState === 'WIN') {
    if (currentLevel < maxLevel) {
      currentLevel++; // 進入下一關
      initGame();
      gameState = 'PLAYING';
    } else {
      gameState = 'START'; // 全破返回首頁
    }
  } else if (gameState === 'GAMEOVER') {
    gameState = 'START'; // 失敗後返回首頁
  }
}
