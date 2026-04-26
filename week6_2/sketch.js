let gameState = "start"; // 管理遊戲狀態：start (開始畫面), nameInput (輸入名字), difficulty (選擇難度), playing (遊戲中)
let bloodImage; // 宣告圖片變數
let skullImage; // 宣告輸入名字畫面的背景圖變數
let bloodBgImage; // 宣告難度選擇畫面的背景圖變數
let playerNameInput; // 玩家名字輸入框
let playerNameButton; // 確認名字按鈕
let playerName = ""; // 儲存玩家名字
let selectedDifficulty = ""; // 儲存玩家選擇的難度
let pathPoints = []; // 儲存軌道路徑點
let pathWidth = 50;  // 軌道寬度
let isTracing = false; // 記錄是否已經點擊起點並開始闖關
let gameOverStartFrame = 0; // 記錄失敗畫面的起始幀數，用於彈跳動畫
let startTime = 0; // 記錄遊戲開始的時間
let elapsedTime = 0; // 記錄遊玩經過的時間
let completedLevels = { "簡單": false, "普通": false, "困難": false }; // 記錄已通關的難度
let lastMouseX = -1; // 記錄滑鼠最後X座標
let lastMouseY = -1; // 記錄滑鼠最後Y座標
let idleStartTime = 0; // 記錄滑鼠靜止的開始時間
let levelEnterTime = 0; // 記錄進入問號關卡的時間 (180秒限制)

function preload() {
  // 預先載入圖片素材，確保遊戲開始前圖片已準備好
  bloodImage = loadImage('流血.webp');
  skullImage = loadImage('images.jpg');
  bloodBgImage = loadImage('血液.jpg');
}

function setup() {
  // 建立填滿視窗的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 處理圖片：將白色背景與浮水印去除變成透明 (簡易去背)
  bloodImage.loadPixels();
  for (let i = 0; i < bloodImage.pixels.length; i += 4) {
    let r = bloodImage.pixels[i];
    let g = bloodImage.pixels[i + 1];
    let b = bloodImage.pixels[i + 2];
    // 如果 RGB 值都偏高 (偏白色/淺灰色)，則將透明度 (Alpha) 設為 0
    if (r > 180 && g > 180 && b > 180) {
      bloodImage.pixels[i + 3] = 0; 
    }
  }
  bloodImage.updatePixels();
  
  // 建立輸入框與確認按鈕 (預設先隱藏)
  playerNameInput = createInput('');
  playerNameInput.hide();
  playerNameInput.size(200, 30);
  playerNameInput.style('font-size', '20px');
  
  playerNameButton = createButton('確認');
  playerNameButton.hide();
  playerNameButton.size(60, 36);
  playerNameButton.style('font-size', '20px');
  playerNameButton.mousePressed(submitName); // 綁定點擊事件
}

function draw() {
  if (gameState === "start") {
    drawStartScreen();
  } else if (gameState === "nameInput") {
    drawNameInputScreen();
  } else if (gameState === "difficulty") {
    drawDifficultyScreen();
  } else if (gameState === "playing") {
    // 繪製遊戲進行中的畫面
    drawGameScreen();
  } else if (gameState === "gameOver") {
    drawGameOverScreen();
  } else if (gameState === "gameWin") {
    drawGameWinScreen();
  }
}

// 繪製開始/登入畫面
function drawStartScreen() {
  background(0); // 將底色改為純黑色
  
  // 只擷取並繪製有血液的範圍 (原圖的上下約 30%)
  let cropH = bloodImage.height * 0.3; // 擷取高度
  // image(圖, 畫布X, 畫布Y, 畫布寬, 畫布高, 來源X, 來源Y, 來源寬, 來源高)
  image(bloodImage, 0, 0, width, height * 0.3, 0, 0, bloodImage.width, cropH); // 上方血液
  image(bloodImage, 0, height * 0.7, width, height * 0.3, 0, bloodImage.height * 0.7, bloodImage.width, cropH); // 下方血液
  
  // 遊戲標題
  textAlign(CENTER, CENTER);
  textSize(64);
  fill(255, 0, 0); // 紅色
  text("電流急急棒 電到你發慌", width / 2, height / 2 - 50);
  
  // 點擊提示文字 (加入簡單的閃爍效果)
  textSize(24);
  fill(255);
  if (frameCount % 60 < 30) {
    text("點擊畫面開始遊戲", width / 2, height / 2 + 50);
  }
}

// 繪製輸入名字畫面
function drawNameInputScreen() {
  background(0);
  
  // 繪製新的背景圖 (images.jpg)，設定透明度 50% (127/255)
  tint(255, 127);
  image(skullImage, 0, 0, width, height);
  noTint(); // 重置圖片透明度設定，避免影響其他畫面
  
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  text("挑戰者 告訴我你的名字", width / 2, height / 2 - 100);
  
  // 更新輸入框與按鈕的位置 (確保視窗縮放時依然置中)
  playerNameInput.position(width / 2 - 140, height / 2);
  playerNameButton.position(width / 2 + 80, height / 2);
}

// 繪製難度選擇畫面
function drawDifficultyScreen() {
  background(0); // 鋪上黑底，避免背景過亮導致文字看不清
  
  // 繪製血液背景並調降透明度 (100/255) 以凸顯文字
  tint(255, 100);
  image(bloodBgImage, 0, 0, width, height);
  noTint(); // 重置透明度
  
  textAlign(CENTER, CENTER);
  textSize(48);
  fill(255);
  // 加入玩家名字，讓畫面更客製化
  text("挑戰者 " + playerName + "，請選擇難度", width / 2, height / 2 - 150);
  
  // 準備繪製四個難度按鈕 (設定為置中畫法)
  rectMode(CENTER);
  stroke(255, 0, 0); // 紅色邊框
  strokeWeight(3);
  
  let btnW = 160;
  let btnH = 60;
  let gap = 200; // 按鈕之間的間距
  
  // 畫出四個按鈕的底框 (半透明黑色)
  fill(0, 180);
  rect(width / 2 - gap, height / 2, btnW, btnH); // 簡單
  rect(width / 2, height / 2, btnW, btnH);       // 普通
  rect(width / 2 + gap, height / 2, btnW, btnH); // 困難
  
  let isSecretUnlocked = completedLevels["簡單"] && completedLevels["普通"] && completedLevels["困難"];
  
  // 如果條件達成，解鎖並讓問號底框發出紅色光芒
  if (isSecretUnlocked) {
    drawingContext.shadowBlur = 20;
    drawingContext.shadowColor = 'red';
    fill(50, 0, 0, 180);
  }
  rect(width / 2, height / 2 + 100, btnW, btnH); // ?關卡
  drawingContext.shadowBlur = 0; // 重置光暈特效
  
  // 繪製按鈕上的文字
  noStroke();
  fill(255);
  textSize(28);
  text("簡單", width / 2 - gap, height / 2);
  text("普通", width / 2, height / 2);
  text("困難", width / 2 + gap, height / 2);
  
  // 解鎖後文字變為紅色並發光，未解鎖則是暗灰色
  if (isSecretUnlocked) {
    fill(255, 50, 50); 
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = 'red';
  } else {
    fill(100); 
  }
  textSize(36);
  text("?", width / 2, height / 2 + 100);
  drawingContext.shadowBlur = 0;
  
  rectMode(CORNER); // 繪製完畢後恢復預設的對齊方式，避免影響到後續的遊戲畫面
}

// 繪製遊戲畫面與電流軌道
function drawGameScreen() {
  background(20); // 深灰色背景，凸顯電流軌道

  if (pathPoints.length === 0) return;

  // 1. 繪製軌道外圍發光效果 (視覺裝飾)
  noFill();
  stroke(0, 150, 255, 100); // 半透明霓虹藍
  strokeWeight(pathWidth + 10);
  strokeJoin(ROUND); // 讓轉折處圓滑
  strokeCap(ROUND);  // 讓線條起訖處圓滑
  beginShape();
  for (let pt of pathPoints) vertex(pt.x, pt.y);
  endShape();

  // 2. 繪製主要軌道通道 (玩家前進的安全區)
  stroke(220, 255, 255); // 偏白的亮藍色
  strokeWeight(pathWidth);
  beginShape();
  for (let pt of pathPoints) vertex(pt.x, pt.y);
  endShape();

  // 3. 繪製起點與終點區域
  let startPt = pathPoints[0];
  let endPt = pathPoints[pathPoints.length - 1];

  noStroke();
  fill(0, 255, 0, 180); // 起點綠色
  circle(startPt.x, startPt.y, pathWidth);
  
  fill(255, 0, 0, 180); // 終點紅色
  circle(endPt.x, endPt.y, pathWidth);

  // 標示文字
  fill(0);
  textSize(20);
  textAlign(CENTER, CENTER);
  text("人間", startPt.x, startPt.y);
  text("地獄", endPt.x, endPt.y);
  
  // 顯示當前挑戰資訊
  fill(255);
  textAlign(LEFT, TOP);
  textSize(24);
  text(`挑戰者：${playerName} | 難度：${selectedDifficulty}`, 20, 20);

  // 計算並顯示計時器 (問號關卡採用獨特 180 秒倒數計時)
  if (selectedDifficulty === "?") {
    let totalTime = millis() - levelEnterTime;
    let timeLeft = max(0, 180 - totalTime / 1000).toFixed(2);
    fill(255, 100, 100);
    textAlign(RIGHT, TOP);
    text(`⏳ 倒數：${timeLeft} 秒`, width - 20, 20);
    
    // 180 秒大限一到，強制失敗
    if (totalTime > 180000) {
      isTracing = false;
      gameState = "gameOver";
      gameOverStartFrame = frameCount;
    }
  } else {
    if (isTracing) {
      elapsedTime = millis() - startTime;
    }
    fill(255);
    textAlign(RIGHT, TOP);
    let seconds = (elapsedTime / 1000).toFixed(2);
    text(`⏱️ 時間：${seconds} 秒`, width - 20, 20);
  }

  // --- 遊戲核心邏輯 ---
  if (!isTracing) {
    // 尚未開始時的提示
    fill(255, 255, 0);
    textAlign(CENTER, CENTER);
    text("將滑鼠移至「人間」並點擊左鍵開始", width / 2, 80);
    idleStartTime = millis(); // 尚未開始時，不斷重置靜止時間
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  } else {
    // 繪製玩家游標 (一個發光的小圓點代表電流)
    fill(255, 255, 255);
    noStroke();
    circle(mouseX, mouseY, 12);

    // 檢查是否到達終點 (地獄)
    if (dist(mouseX, mouseY, endPt.x, endPt.y) < pathWidth / 2) {
      isTracing = false;
      if (selectedDifficulty !== "?") {
        completedLevels[selectedDifficulty] = true; // 標記為已通關
      }
      gameState = "gameWin";
    } else {
      // 碰撞判定：檢查滑鼠與軌道路徑的最小距離
      let isSafe = false;
      for (let i = 0; i < pathPoints.length - 1; i++) {
        let p1 = pathPoints[i];
        let p2 = pathPoints[i + 1];
        let d = pDistance(mouseX, mouseY, p1.x, p1.y, p2.x, p2.y);
        // 只要與其中一段軌道的距離小於或等於軌道半徑，就是安全的
        if (d <= pathWidth / 2) {
          isSafe = true;
          break;
        }
      }

      // 如果不安全 (碰觸邊緣或超出軌道)，則失敗
      if (!isSafe) {
        isTracing = false;
        if (selectedDifficulty === "?") {
          // 問號關卡特性：碰壁只回到起點，不觸發 game over 畫面
        } else {
          gameState = "gameOver";
          gameOverStartFrame = frameCount; // 記錄死亡當下的時間幀數
        }
      }
    }
    
    // 問號關卡隱藏獲勝機制：原地不動 30 秒
    if (selectedDifficulty === "?") {
      if (mouseX !== lastMouseX || mouseY !== lastMouseY) {
        lastMouseX = mouseX; // 如果游標有移動，就更新位置並重置倒數
        lastMouseY = mouseY;
        idleStartTime = millis();
      } else if (millis() - idleStartTime >= 30000) {
        isTracing = false;
        gameState = "gameWin"; // 成功觸發隱藏結局
      }
    }
  }
}

// 計算點 (x, y) 到線段 (x1, y1) - (x2, y2) 的最短距離 (核心碰撞算法)
function pDistance(x, y, x1, y1, x2, y2) {
  let A = x - x1;
  let B = y - y1;
  let C = x2 - x1;
  let D = y2 - y1;
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;
  
  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }
  
  let dx = x - xx;
  let dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

// 根據難度生成軌道路徑點
function generateLevel(difficulty) {
  pathPoints = [];
  let startX = 100; // 起點X座標
  let endX = width - 100; // 終點X座標
  let numPoints = 150; // 切割成150個節點讓曲線平滑
  
  let seed = random(10000); // 隨機生成種子，讓每次生成的地形都完全不同
  let noiseScale = 0; // 控制雜訊的密集度 (彎折頻率)
  let amplitude = 0;  // 控制高低起伏幅度

  // 依據難度調整軌道粗細、隨機變化的頻率與高低差
  if (difficulty === "簡單") {
    pathWidth = 90; 
    noiseScale = 0.015;
    amplitude = height * 0.4;
  } else if (difficulty === "普通") {
    pathWidth = 45; 
    noiseScale = 0.03;
    amplitude = height * 0.5;
  } else if (difficulty === "困難") {
    pathWidth = 25; 
    noiseScale = 0.05;
    amplitude = height * 0.65;
  } else if (difficulty === "?") {
    pathWidth = 4; // 極端狹窄 (比游標還小)，正常人絕對過不了
    noiseScale = 0.2; // 瘋狂且不規則的折彎
    amplitude = height * 1.5; // 超出螢幕範圍的極端起伏
  }

  for (let i = 0; i <= numPoints; i++) {
    let x = map(i, 0, numPoints, startX, endX);
    
    // 使用 Perlin noise 產生不規則隨機但連續的曲線 (值介於 0~1)
    let n = noise(seed + i * noiseScale);
    // 將 noise 轉換到畫面 Y 軸，加入振幅
    let y = height / 2 + (n - 0.5) * amplitude;

    // 限制Y軸座標，確保軌道不會畫到螢幕外
    y = constrain(y, 100, height - 100);
    pathPoints.push({ x: x, y: y });
  }
}

// 繪製失敗畫面
function drawGameOverScreen() {
  // 稍微閃爍的暗紅色背景
  if (random(1) > 0.1) {
    background(100, 0, 0); 
  } else {
    background(150, 0, 0); // 偶爾閃爍成較亮、刺眼的紅色
  }
  
  push();
  translate(width / 2, height / 2 - 50);

  // 彈跳出現效果 (持續計算，帶有阻尼回彈感)
  let elapsed = frameCount - gameOverStartFrame;
  let scaleFactor = constrain(elapsed / 10, 0, 1) + sin(elapsed * 0.6) * exp(-elapsed * 0.15);
  scale(scaleFactor);

  textAlign(CENTER, CENTER);
  textSize(64);

  // 恐怖亂碼特效
  let txt = "你以跌入深淵 被死神抓走";
  if (random(1) < 0.2) { // 20% 機率文字變成恐怖亂碼
    txt = "";
    let chars = "無死殺血咒怨亡鬼苦痛@#$%&*!?";
    for (let i = 0; i < 12; i++) {
      txt += chars.charAt(floor(random(chars.length)));
    }
    // 亂碼時文字劇烈震動與顏色突變
    translate(random(-10, 10), random(-10, 10));
    fill(random(150, 255), 0, random(0, 50)); 
  } else {
    fill(255);
  }
  
  text(txt, 0, 0);
  pop();

  // 隨機在畫面上產生恐怖的背景血紅字元
  if (random(1) < 0.3) {
    fill(255, 0, 0, random(50, 150));
    textSize(random(20, 80));
    text(random(["死", "亡", "怨", "無", "抓", "!?", "血"]), random(width), random(height));
  }

  // 副標題
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(200);
  if (frameCount % 60 < 40) { // 讓副標題閃爍
    text("點擊畫面返回難度選擇，重新挑戰", width / 2, height / 2 + 50);
  }
}

// 繪製成功畫面
function drawGameWinScreen() {
  // 電視機壞掉的閃爍背景
  if (random(1) > 0.1) {
    background(0, random(50, 100), 0); // 暗綠色閃爍
  } else {
    background(random(150, 255)); // 偶爾出現強烈白/灰光閃爍
  }

  // 繪製隨機橫向雜訊條紋 (Glitch 雜訊)
  noStroke();
  for (let i = 0; i < random(5, 15); i++) {
    fill(random(255), random(50, 150));
    rect(0, random(height), width, random(2, 20));
  }

  textAlign(CENTER, CENTER);
  textSize(64);
  
  let txt = selectedDifficulty === "?" ? "呵呵 算你聰明" : "恭喜 地獄歡迎你";
  let textX = width / 2;
  let textY = height / 2 - 50;

  // 模擬電視畫面壞掉的文字色散/錯位特效 (紅青 3D 錯位)
  fill(255, 0, 0, 200); // 紅色錯位
  text(txt, textX - random(3, 8), textY + random(-3, 3));
  fill(0, 255, 255, 200); // 青色錯位
  text(txt, textX + random(3, 8), textY + random(-3, 3));
  
  // 主要文字
  fill(255);
  text(txt, textX, textY);

  // 顯示通關時間
  textSize(32);
  fill(255, 255, 0); // 黃色顯示秒數
  if (selectedDifficulty === "?") {
    text(`通關時間：30.00 秒 (隱藏機制)`, width / 2, height / 2 + 30);
  } else {
    text(`通關時間：${(elapsedTime / 1000).toFixed(2)} 秒`, width / 2, height / 2 + 30);
  }

  textSize(24);
  fill(200);
  text("點擊畫面返回難度選擇", width / 2, height / 2 + 80);
  
  // 繪製傳統電視掃描線 (Scanlines)
  for (let y = 0; y < height; y += 4) {
    stroke(0, 80);
    strokeWeight(1);
    line(0, y, width, y);
  }
}

// 處理姓名提交
function submitName() {
  playerName = playerNameInput.value();
  if (playerName.trim() === "") {
    playerName = "無名氏"; // 如果玩家沒填就給個預設名字
  }
  playerNameInput.hide(); // 隱藏輸入框
  playerNameButton.hide(); // 隱藏按鈕
  gameState = "difficulty"; // 進入難度選擇畫面
}

// 處理滑鼠點擊事件
function mousePressed() {
  if (gameState === "start") {
    gameState = "nameInput"; // 點擊畫面後切換到輸入名字畫面
    playerNameInput.show();  // 顯示輸入框
    playerNameButton.show(); // 顯示確認按鈕
  } else if (gameState === "difficulty") {
    // 定義按鈕的寬高與間距 (這裡的數值必須跟繪製時的一模一樣)
    let btnW = 160;
    let btnH = 60;
    let gap = 200;
    
    // 檢查滑鼠點擊座標是否在某個按鈕的範圍內
    let checkClick = (x, y) => {
      return mouseX > x - btnW / 2 && mouseX < x + btnW / 2 && 
             mouseY > y - btnH / 2 && mouseY < y + btnH / 2;
    };
    
    // 判斷玩家點擊了哪個難度按鈕，並進入遊戲
    if (checkClick(width / 2 - gap, height / 2)) { 
      selectedDifficulty = "簡單"; 
      generateLevel(selectedDifficulty); // 生成對應關卡
      isTracing = false; // 確保每次進關卡都是初始狀態
      elapsedTime = 0; // 重置計時器
      gameState = "playing"; 
    } else if (checkClick(width / 2, height / 2)) { 
      selectedDifficulty = "普通"; 
      generateLevel(selectedDifficulty);
      isTracing = false;
      elapsedTime = 0;
      gameState = "playing"; 
    } else if (checkClick(width / 2 + gap, height / 2)) { 
      selectedDifficulty = "困難"; 
      generateLevel(selectedDifficulty);
      isTracing = false;
      elapsedTime = 0;
      gameState = "playing"; 
    } else if (checkClick(width / 2, height / 2 + 100)) { 
      // 必須前置三個難度皆通關才能點擊
      if (completedLevels["簡單"] && completedLevels["普通"] && completedLevels["困難"]) {
        selectedDifficulty = "?"; 
        generateLevel(selectedDifficulty);
        isTracing = false;
        levelEnterTime = millis(); // 記錄進入問號關卡的時間，用於180秒限制
        gameState = "playing"; 
      }
    }
  } else if (gameState === "playing") {
    // 若在遊戲中點擊，判斷是否在「人間」區域內以啟動遊戲
    if (!isTracing && dist(mouseX, mouseY, pathPoints[0].x, pathPoints[0].y) < pathWidth / 2) {
      isTracing = true; // 正式開始闖關
      startTime = millis(); // 記錄開始時間
    }
  } else if (gameState === "gameOver" || gameState === "gameWin") {
    gameState = "difficulty"; // 遊戲結束後點擊返回難度選擇
  }
}

// 確保視窗縮放時畫布能跟著調整
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
