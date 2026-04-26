// --- 作品分組 ---
const workGroups = [
  [{ week: "第一週", url: "week1/index.html" }, { week: "第二週", url: "week2/index.html" }],
  [{ week: "第三週", url: "week3/index.html" }, { week: "第四週", url: "week4/index.html" }],
  [{ week: "第五週", url: "week5/index.html" }, { week: "第五週-2", url: "week5_2/index.html" }],
  [{ week: "第六週", url: "week6/index.html" }, { week: "第六週-2", url: "week6_2/index.html" }]
];
const workGroupTitles = [
  '第一、二週作品',
  '第三、四週作品',
  '第五週作品',
  '第六週作品'
];

let iframeContainer;
let myIframe;
let closeBtn;

// --- 狀態管理 (State Management) ---
let appState = 'loading'; // 'loading', 'loadingFadeOut', 'home', 'portalTransition', 'worksZoomIn', 'homeZoomIn', 'works'
let currentWorkGroupIndex = -1; // -1 表示未選擇

// --- 轉場與動畫變數 (Transition & Animation) ---
let transitionStartTime;
const FADE_DURATION = 500; // 淡出/入時間 (毫秒)
const PORTAL_TRANSITION_DURATION = 1500; // 傳送門動畫時間 (毫秒)
const ZOOM_DURATION = 700; // 縮放動畫時間 (毫秒)

// --- 讀取畫面變數 ---
let loadingProgress = 0;
let stickFigurePhase = 0;

// --- 時空穿越特效變數 ---
let particles = [];
const NUM_PARTICLES = 500;

// --- 世界二特效變數 ---
let jellyfishes = [];
let bubbles = [];

// --- 世界三特效變數 ---
let windParticles = [];

// --- 世界四特效變數 ---
let forestDecorations = [];

// --- 流星特效變數 ---
let shootingStars = [];

// --- 離屏緩衝區 (Off-screen buffer) ---
let worksBuffer;

// --- Main Screen Background ---
let bgImages = [];
let bgHome;
const bgImagePaths = [
  'assets/星空1.jpg',
  'assets/星空2.png',
  'assets/星空3.png',
  'assets/海底1.png', // 修正：世界二背景，.jpg -> .png
  'assets/天空2.jpg', // 新增：世界三背景
  'assets/森林3.jpg'  // 新增：世界四背景
];

let workItemWidth = 300; // 再次增加按鈕寬度
let workItemHeight = 300; // 再次增加按鈕高度
let workItems = []; // To store position and work data for clickable areas

// --- Icon Images ---
let iconImages = [];
const iconImagePaths = [
  'assets/天蠍座.png',
  'assets/天平座.png', // 修正：依照您的要求，將「天秤座」改為「天平座」
  'assets/鳳梨屋.png', // 新增
  'assets/石頭屋.png',  // 新增
  'assets/天空之城.png', // 新增
  'assets/刀劍神諭.png',   // 新增
  'assets/阿寶.png', // 新增
  'assets/老皮.png',  // 新增
  'assets/水母.png',   // 新增
  'assets/飛機.png',
  'assets/桐人.png',
  'assets/黏.png',
  'assets/泡泡糖.png',
  'assets/薄荷糖.png',
  'assets/公主.png',
  'assets/B某.png',
  'assets/火焰.png',
  'assets/阿鵝.png',
  'assets/皮妹.png',
  'assets/冰霸.png',
  'assets/吸血鬼.png' // 新增
];

// --- Music ---
let music1;
const music1Path = 'assets/音樂1(你的).mp3'; // 假設是 .mp3 格式
let music2;
const music2Path = 'assets/音樂3(海綿).mp3';
let music3_1, music3_2; // For World 3
const music3_1Path = 'assets/音樂4(天空).mp3';
const music3_2Path = 'assets/音樂5(刀劍).mp3';
let music4; // For World 4
const music4Path = 'assets/音樂2(探險).mp3';

// --- UI Elements ---
let portals = [];
let backButton;
let portalPhase = 0;

class StarParticle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(-width, width);
    this.y = random(-height, height);
    this.z = random(width);
    this.pz = this.z;
  }

  update(speed) {
    this.z -= speed;
    if (this.z < 1) {
      this.reset();
      this.z = width; // 從遠處重新開始
      this.pz = this.z;
    }
  }

  show() {
    fill(255);
    noStroke();

    const sx = map(this.x / this.z, 0, 1, 0, width);
    const sy = map(this.y / this.z, 0, 1, 0, height);
    const r = map(this.z, 0, width, 10, 0);
    ellipse(sx, sy, r, r);

    const px = map(this.x / this.pz, 0, 1, 0, width);
    const py = map(this.y / this.pz, 0, 1, 0, height);
    this.pz = this.z;

    stroke(255, 150);
    strokeWeight(r / 2 + 1);
    line(px, py, sx, sy);
  }
}

class ShootingStar {
  constructor() {
    // 從畫布頂部或左側隨機位置開始
    if (random() > 0.5) {
      this.x = random(width);
      this.y = -10;
    } else {
      this.x = -10;
      this.y = random(height * 0.7);
    }
    this.speed = random(10, 20);
    this.angle = PI / 4; // 固定角度，看起來像流星雨
    this.history = [];
    this.len = random(30, 50); // 拖尾長度
  }

  isOffscreen() {
    return (this.y > height + 50 || this.x > width + 50);
  }

  update() {
    this.x += this.speed * cos(this.angle);
    this.y += this.speed * sin(this.angle);
    this.history.push(createVector(this.x, this.y));
    if (this.history.length > this.len) {
      this.history.splice(0, 1);
    }
  }

  show(pg) {
    pg.noStroke();
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      let alpha = map(i, 0, this.history.length, 0, 200);
      pg.fill(255, 255, 230, alpha); // 帶點暖黃色的白光
      let size = map(i, 0, this.history.length, 0, 3);
      pg.ellipse(pos.x, pos.y, size, size);
    }
  }
}

class WindParticle {
  constructor(type) {
    // 85% 是流動的線條，15% 是氣旋
    this.type = type || (random() > 0.85 ? 'swirl' : 'line');
    this.y = random(height);
    this.x = random(-200, -50);
    this.speed = random(2, 6);
    this.alpha = random(50, 120); // 讓粒子更柔和

    if (this.type === 'line') {
      this.history = [];
      this.len = random(30, 60); // 拖尾的長度
      this.wobble = random(0.01, 0.03); // 軌跡的彎曲度
      this.wobbleHeight = random(0.5, 1.5); // 軌跡的上下擺幅
    } else { // swirl
      this.radius = random(15, 40);
      this.angle = random(TWO_PI);
      this.rotSpeed = random(0.02, 0.05);
    }
  }

  isOffscreen() {
    return this.x > width + (this.len * this.speed || this.radius || 0);
  }

  update() {
    this.x += this.speed;
    if (this.type === 'line') {
      this.y += sin(this.x * this.wobble) * this.wobbleHeight;
      this.history.push(createVector(this.x, this.y));
      if (this.history.length > this.len) {
        this.history.splice(0, 1);
      }
    } else { // swirl
      this.angle += this.rotSpeed;
    }
  }

  show(pg) {
    if (this.type === 'line') {
      pg.noFill();
      pg.beginShape();
      for (let i = 0; i < this.history.length; i++) {
        let pos = this.history[i];
        let currentAlpha = map(i, 0, this.history.length, 0, this.alpha);
        pg.stroke(255, currentAlpha);
        pg.strokeWeight(map(i, 0, this.history.length, 0, 1.5));
        pg.vertex(pos.x, pos.y);
      }
      pg.endShape();
    } else { // swirl
      pg.push();
      pg.translate(this.x, this.y);
      pg.rotate(this.angle);
      pg.noFill();
      pg.stroke(255, this.alpha * 0.7); // 讓氣旋更透明
      pg.strokeWeight(1.5);
      pg.arc(0, 0, this.radius, this.radius, 0, PI * 1.5);
      pg.arc(0, 0, this.radius * 0.6, this.radius * 0.6, PI, PI * 2.5);
      pg.pop();
    }
  }
}

class Jellyfish {
  constructor(img, avoidAreas = []) {
    this.img = img;
    this.size = random(80, 150);
    this.bobOffset = random(TWO_PI);
    this.alpha = random(100, 180);

    let validPosition = false;
    let attempts = 0;
    while (!validPosition && attempts < 50) {
      this.x = random(width);
      this.y = random(height * 0.2, height * 0.8);

      let overlaps = false;
      const jellyBox = {
        x: this.x - this.size / 2,
        y: this.y - this.size / 2,
        w: this.size,
        h: this.size
      };

      for (const area of avoidAreas) {
        if (jellyBox.x < area.x + area.w && jellyBox.x + jellyBox.w > area.x && jellyBox.y < area.y + area.h && jellyBox.y + jellyBox.h > area.y) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        validPosition = true;
      }
      attempts++;
    }
  }

  update() {
    // 緩慢上下漂浮
    this.y += sin(frameCount * 0.02 + this.bobOffset) * 0.3;
  }

  show(pg) {
    pg.push();
    pg.tint(255, this.alpha);
    pg.imageMode(CENTER);
    let imgRatio = this.img.height / this.img.width;
    pg.image(this.img, this.x, this.y, this.size, this.size * imgRatio);
    pg.noTint();
    pg.pop();
  }
}

class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(50);
    this.size = random(5, 30);
    this.speedY = random(1, 3);
    this.wobbleX = random(0.5, 2);
    this.lifespan = 255;
  }

  isOffscreen() {
    return this.y < -this.size || this.lifespan <= 0;
  }

  update() {
    this.y -= this.speedY;
    this.x += sin(this.y * 0.05) * this.wobbleX;
    // 氣泡越往上越透明
    this.lifespan -= 1;
  }

  show(pg) {
    pg.push();
    pg.noFill();
    pg.stroke(255, min(this.lifespan, 150)); // 限制最大透明度
    pg.strokeWeight(2);
    pg.ellipse(this.x, this.y, this.size);
    pg.pop();
  }
}

function preload() {
  // 載入所有背景圖片
  for (let path of bgImagePaths) {
    bgImages.push(loadImage(path));
  }
  // 載入所有圖示圖片
  for (let path of iconImagePaths) {
    iconImages.push(loadImage(path));
  }

  // 載入音樂
  // 警告：中文檔名在網頁環境中非常容易出錯。如果音樂無法播放，
  // 請務必將檔案重新命名為英文 (例如 music1.mp3) 並在此處同步修改路徑。
  music1 = loadSound(music1Path, null, (err) => {
    console.error(`錯誤：無法載入音樂 '${music1Path}'。`, err);
  });
  // 新增：載入世界二的音樂
  // 警告：同樣，如果音樂無法播放，請務必將檔案重新命名為英文。
  music2 = loadSound(music2Path, null, (err) => {
    console.error(`錯誤：無法載入音樂 '${music2Path}'。`, err);
  });
  // 新增：載入世界三的音樂
  // 警告：同樣，如果音樂無法播放，請務必將檔案重新命名為英文。
  music3_1 = loadSound(music3_1Path, null, (err) => {
      console.error(`錯誤：無法載入音樂 '${music3_1Path}'。`, err);
  });
  music3_2 = loadSound(music3_2Path, null, (err) => {
      console.error(`錯誤：無法載入音樂 '${music3_2Path}'。`, err);
  });
  // 新增：載入世界四的音樂
  // 警告：同樣，如果音樂無法播放，請務必將檔案重新命名為英文。
  music4 = loadSound(music4Path, null, (err) => {
      console.error(`錯誤：無法載入音樂 '${music4Path}'。`, err);
  });

  // 提醒：請確保您已將 '星空3.png' 檔案放置在 'assets' 資料夾中
  if (bgImagePaths.length > 2 && !bgImages[2]) { // 檢查第三張圖片是否存在
      console.error("錯誤：找不到 'assets/星空3.png'。請確認您已將圖片放置在正確的資料夾中。將使用預設背景替代。");
      // 作為備用，如果找不到圖片，就使用第一張
      if (bgImages[0]) { bgImages[2] = bgImages[0]; }
  }
  // 新增提醒：請確保您已將 '海底1.png' 檔案放置在 'assets' 資料夾中
  if (bgImagePaths.length > 3 && !bgImages[3]) { // 檢查第四張圖片是否存在
      console.error("錯誤：找不到 'assets/海底1.png'。請確認您已將圖片放置在正確的資料夾中。將使用預設背景替代。");
      // 作為備用，如果找不到圖片，就使用第一張
      if (bgImages[0]) { bgImages[3] = bgImages[0]; }
  }
  // 新增提醒：請確保您已將 '天空2.jpg' 檔案放置在 'assets' 資料夾中
  if (bgImagePaths.length > 4 && !bgImages[4]) { // 檢查第五張圖片是否存在
      console.error("錯誤：找不到 'assets/天空2.jpg'。請確認您已將圖片放置在正確的資料夾中。將使用預設背景替代。");
      if (bgImages[0]) { bgImages[4] = bgImages[0]; }
  }
  // 新增提醒：請確保您已將 '森林3.jpg' 檔案放置在 'assets' 資料夾中
  if (bgImagePaths.length > 5 && !bgImages[5]) { // 檢查第六張圖片是否存在
      console.error("錯誤：找不到 'assets/森林3.jpg'。請確認您已將圖片放置在正確的資料夾中。將使用預設背景替代。");
      if (bgImages[0]) { bgImages[5] = bgImages[0]; }
  }

  // 新增圖示的錯誤檢查
  if (iconImagePaths.length > 0 && !iconImages[0]) {
      console.error("錯誤：找不到 'assets/天蠍座.png'。");
  }
  if (iconImagePaths.length > 1 && !iconImages[1]) {
      console.error("錯誤：找不到 'assets/天平座.png'。請確認您的檔案名稱是否正確。");
  }
  if (iconImagePaths.length > 2 && !iconImages[2]) {
      console.error("錯誤：找不到 'assets/鳳梨屋.png'。");
  }
  if (iconImagePaths.length > 3 && !iconImages[3]) {
      console.error("錯誤：找不到 'assets/石頭屋.png'。");
  }
  if (iconImagePaths.length > 4 && !iconImages[4]) {
      console.error("錯誤：找不到 'assets/天空之城.png'。");
  }
  if (iconImagePaths.length > 5 && !iconImages[5]) {
      console.error("錯誤：找不到 'assets/刀劍神諭.png'。");
  }
  if (iconImagePaths.length > 6 && !iconImages[6]) {
      console.error("錯誤：找不到 'assets/阿寶.png'。");
  }
  if (iconImagePaths.length > 7 && !iconImages[7]) {
      console.error("錯誤：找不到 'assets/老皮.png'。");
  }
  if (iconImagePaths.length > 8 && !iconImages[8]) {
      console.error("錯誤：找不到 'assets/水母.png'。");
  }
  if (iconImagePaths.length > 9 && !iconImages[9]) {
      console.error("錯誤：找不到 'assets/飛機.png'。");
  }
  if (iconImagePaths.length > 10 && !iconImages[10]) {
      console.error("錯誤：找不到 'assets/桐人.png'。");
  }
  // 新增：為世界四的裝飾物件做錯誤檢查
  if (iconImagePaths.length > 11 && !iconImages[11]) { console.error("錯誤：找不到 'assets/黏.png'。"); }
  if (iconImagePaths.length > 12 && !iconImages[12]) { console.error("錯誤：找不到 'assets/泡泡糖.png'。"); }
  if (iconImagePaths.length > 13 && !iconImages[13]) { console.error("錯誤：找不到 'assets/薄荷糖.png'。"); }
  if (iconImagePaths.length > 14 && !iconImages[14]) { console.error("錯誤：找不到 'assets/公主.png'。"); }
  if (iconImagePaths.length > 15 && !iconImages[15]) { console.error("錯誤：找不到 'assets/B某.png'。"); }
  if (iconImagePaths.length > 16 && !iconImages[16]) { console.error("錯誤：找不到 'assets/火焰.png'。"); }
  if (iconImagePaths.length > 17 && !iconImages[17]) { console.error("錯誤：找不到 'assets/阿鵝.png'。"); }
  if (iconImagePaths.length > 18 && !iconImages[18]) { console.error("錯誤：找不到 'assets/皮妹.png'。"); }
  if (iconImagePaths.length > 19 && !iconImages[19]) { console.error("錯誤：找不到 'assets/冰霸.png'。"); }
  if (iconImagePaths.length > 20 && !iconImages[20]) { console.error("錯誤：找不到 'assets/吸血鬼.png'。"); }

  if (iconImagePaths.length > 9 && !iconImages[9]) {
      console.error("錯誤：找不到 'assets/飛機.png'。");
  }
  if (iconImagePaths.length > 10 && !iconImages[10]) {
      console.error("錯誤：找不到 'assets/桐人.png'。");
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 從前兩張圖中隨機選擇一張作為主頁背景
  bgHome = random(bgImages.slice(0, 2));

  // 模擬讀取過程
  const loadingInterval = setInterval(() => { // 調整此數值可改變讀取速度 (更慢)
    loadingProgress += 0.5;
    if (loadingProgress >= 100) {
      loadingProgress = 100;
      clearInterval(loadingInterval);
      // 讀取完成後稍微延遲，再顯示主畫面
      setTimeout(() => {
        appState = 'loadingFadeOut';
        transitionStartTime = millis();
      }, 300);
    }
  }, 30); // 保持間隔時間，只調整進度增量

  // 創建粒子
  for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push(new StarParticle());
  }
  // 創建用於縮放效果的離屏畫布
  worksBuffer = createGraphics(width, height);

  // Initialize UI element properties
  backButton = { x: 20, y: 20, w: 120, h: 40 };


  // Initialize positions for all elements
  initializePositions();

  // Iframe DOM integration: Create popup display area and button
  iframeContainer = createDiv('');
  iframeContainer.position(width * 0.1, height * 0.1);
  iframeContainer.size(width * 0.8, height * 0.8);
  iframeContainer.style('display', 'none'); // Default hidden
  iframeContainer.style('background', 'rgba(255, 255, 255, 0.85)');
  iframeContainer.style('border-radius', '15px');
  iframeContainer.style('box-shadow', '0 8px 16px rgba(0,0,0,0.5)');
  iframeContainer.style('backdrop-filter', 'blur(5px)');
  iframeContainer.style('z-index', '10');
  closeBtn = createButton('✖ 關閉作品');
  closeBtn.parent(iframeContainer);
  closeBtn.position(15, 15);
  closeBtn.style('font-size', '16px');
  closeBtn.style('padding', '5px 10px');
  closeBtn.style('cursor', 'pointer');
  closeBtn.mousePressed(closeIframe);

  myIframe = createElement('iframe');
  myIframe.parent(iframeContainer);
  myIframe.position(15, 60);
  myIframe.size(iframeContainer.width - 30, iframeContainer.height - 75);
  myIframe.style('border', 'none');
  myIframe.style('border-radius', '8px');
}

function draw() {
  switch (appState) {
    case 'loading':
      drawLoadingScreen();
      break;
    case 'loadingFadeOut':
      drawLoadingFadeOut();
      break;
    case 'home':
      drawHomeScreen();
      break;
    case 'portalTransition':
      drawPortalTransition();
      break;
    case 'worksZoomIn':
      drawWorksZoomIn();
      break;
    case 'homeZoomIn':
      drawHomeZoomIn();
      break;
    case 'works':
      drawWorksScreen();
      break;
  }
}

function drawCoverBackground(img, pg = this) {
  pg.imageMode(CORNER);
  let canvasAspect = pg.width / pg.height;
  let imgAspect = img.width / img.height;
  // 比較畫布與圖片的長寬比，確保圖片能填滿整個畫布 (cover)
  if (canvasAspect > imgAspect) {
    let newImgWidth = pg.width;
    let newImgHeight = pg.width / imgAspect;
    pg.image(img, 0, (pg.height - newImgHeight) / 2, newImgWidth, newImgHeight);
  } else {
    let newImgHeight = pg.height;
    let newImgWidth = pg.height * imgAspect;
    pg.image(img, (pg.width - newImgWidth) / 2, 0, newImgWidth, newImgHeight);
  }
}

function drawHomeScreenBackground(pg = this) {
  drawCoverBackground(bgHome, pg);
}

function drawLoadingScreen(opacity = 255) {
  background(0); // 純黑色背景，更具復古感

  // --- 繪製像素風格的 "LOADING..." 文字 (直接繪製) ---
  noSmooth(); // 關閉平滑，讓文字和圖形更像素化
  textAlign(CENTER, CENTER);
  fill(255, 220, 0, opacity); // 經典的黃色
  // 使用可靠的等寬字體來營造像素風格
  textFont('monospace');
  textSize(48);
  text('LOADING...', width / 2, height / 2 - 80); // 向上移動
  smooth(); // 恢復平滑，以免影響主畫面

  // --- 繪製讀取條 ---
  let barWidth = width * 0.6;
  let barHeight = 20; // 窄一點的讀取條
  let barX = (width - barWidth) / 2;
  let barY = height / 2 + 40; // 再次向下移動，拉開與文字的距離

  // 讀取條外框
  stroke(255, 220, 0, opacity); // 黃色外框
  strokeWeight(2);
  noFill();
  rect(barX, barY, barWidth, barHeight); // 移除圓角

  // 讀取進度
  noStroke();
  fill(255, 220, 0, opacity); // 黃色填滿
  let progressW = map(loadingProgress, 0, 100, 0, barWidth);
  rect(barX + 2, barY + 2, progressW - 4, barHeight - 4); // 留出邊框

  // --- 繪製火柴人 ---
  stickFigurePhase += 0.15; // 減慢跑步速度
  let stickManX = barX + progressW;
  // 限制火柴人位置，避免超出讀取條
  stickManX = constrain(stickManX, barX + 10, barX + barWidth - 10);
  drawStickFigure(stickManX, barY, opacity); // 火柴人的腳站在讀取條上
}

function drawLoadingFadeOut() {
  let elapsedTime = millis() - transitionStartTime;
  let progress = constrain(elapsedTime / FADE_DURATION, 0, 1);
  let opacity = lerp(255, 0, progress);

  drawHomeScreen(); // 先畫主頁
  drawLoadingScreen(opacity); // 再疊加透明度變化的讀取畫面

  if (progress >= 1) {
    appState = 'home';
  }
}

function drawStickFigure(x, y, opacity = 255) {
  push();
  // 身體上下擺動，讓跑步更有動感
  let bobY = 3 * abs(sin(stickFigurePhase * 2)); // 擺動幅度加大
  translate(x, y - bobY);
  scale(-1, 1); // 水平翻轉，修正跑步方向
  stroke(255, opacity);
  strokeWeight(4); // 加粗
  noFill();

  // --- 身體和頭部 (放大) ---
  const hipY = -45;
  const shoulderY = -72;
  const headY = shoulderY - 15;
  line(0, hipY, 0, shoulderY); // 軀幹
  ellipse(0, headY, 20, 20); // 頭

  // --- 肢體動畫參數 ---
  const legPhase1 = stickFigurePhase;
  const legPhase2 = stickFigurePhase + PI;
  const armPhase1 = stickFigurePhase + PI; // 手臂與對側腿同步
  const armPhase2 = stickFigurePhase;

  // --- 繪製更自然的腿部跑動 ---
  // 抬腿動作
  let legLift = 25; // 增加抬腿高度
  let footY1 = -legLift * max(0, sin(legPhase1));
  let footY2 = -legLift * max(0, sin(legPhase2));

  // 確保最低的腳剛好在 "地面" (y=0) 上
  let groundOffset = -max(footY1, footY2);
  translate(0, groundOffset);

  // 腿 1
  let legX1 = 22 * cos(legPhase1);
  // 當腿在後面時(cos<0)，膝蓋彎曲更明顯，模擬收腿後蹬的動作
  let kneeBend1 = 18 * max(0, -cos(legPhase1)); // 增強後蹬彎曲幅度
  let kneeX1 = legX1 * 0.5;
  let kneeY1 = hipY * 0.5 + footY1 * 0.5 - kneeBend1; // 調整膝蓋彎曲計算
  line(0, hipY, kneeX1, kneeY1); // 大腿
  line(kneeX1, kneeY1, legX1, footY1); // 小腿

  // 腿 2
  let legX2 = 22 * cos(legPhase2);
  let kneeBend2 = 18 * max(0, -cos(legPhase2));
  let kneeX2 = legX2 * 0.5;
  let kneeY2 = hipY * 0.5 + footY2 * 0.5 - kneeBend2;
  line(0, hipY, kneeX2, kneeY2);
  line(kneeX2, kneeY2, legX2, footY2);

  // --- 繪製手臂 (帶有手肘彎曲效果) (放大) ---
  const armSwing = 18;
  const elbowBendFactor = 0.6;

  // 手臂 1
  let handX1 = armSwing * cos(armPhase1);
  let elbowX1 = handX1 * elbowBendFactor;
  let elbowY1 = shoulderY + 8 * sin(armPhase1);
  line(0, shoulderY, elbowX1, elbowY1);
  line(elbowX1, elbowY1, handX1, shoulderY + 5); // 微調手部位置

  // 手臂 2
  let handX2 = armSwing * cos(armPhase2);
  let elbowX2 = handX2 * elbowBendFactor;
  let elbowY2 = shoulderY + 8 * sin(armPhase2);
  line(0, shoulderY, elbowX2, elbowY2);
  line(elbowX2, elbowY2, handX2, shoulderY + 8);
  pop();
}

function drawHomeScreen() {
  drawHomeScreenBackground();
  drawHomePage();
}

function drawHomePage(pg = this, checkHover = true) {
  // --- 繪製主頁標題 ---
  pg.push();
  pg.noStroke();
  pg.fill(255);
  pg.textSize(48);
  pg.textAlign(CENTER, CENTER);
  pg.text('今日 上哪走走?', pg.width / 2, pg.height * 0.1);
  pg.pop();

  // --- 繪製傳送門 (根據背景圖顯示不同風格) ---
  portalPhase += 0.03;

  if (bgHome === bgImages[0]) { // 如果是星空1的背景
    // --- 風格一：漩渦風格 ---
    for (const portal of portals) {
      let d = checkHover ? dist(mouseX, mouseY, portal.x + portal.w / 2, portal.y + portal.h / 2) : 999;
      let isHovered = d < portal.w / 2;

      pg.push();
      pg.translate(portal.x + portal.w / 2, portal.y + portal.h / 2);
      
      let c = portal.isColorful ? color(255) : portal.color;
      let rotationSpeed = isHovered ? 2.5 : 1;

      // 繪製多層旋轉的漩渦臂
      pg.noFill();
      for (let i = 0; i < 6; i++) { // 6 arms
        pg.push();
        let angle = portalPhase * (i % 2 === 0 ? -1 : 1) * (i * 0.3 + 1) * rotationSpeed;
        pg.rotate(angle);
        
        let alpha = isHovered ? 255 - i * 25 : 200 - i * 25;

        if (portal.isColorful) {
          pg.colorMode(HSB, 360, 100, 100, 1);
          let hue = (frameCount * 2 + i * 60) % 360;
          pg.stroke(hue, 90, 100, alpha / 255);
        } else {
          c.setAlpha(alpha);
          pg.stroke(c);
        }
        pg.strokeWeight(1 + i * 0.8);
        
        let r = portal.w * (0.3 + i * 0.1);
        pg.arc(0, 0, r, r, 0, PI * 1.2);
        pg.pop();
      }
      pg.colorMode(RGB);

      // 中心光暈
      pg.noStroke();
      for (let i = 4; i > 0; i--) {
        let alpha = isHovered ? 70 - i * 12 : 40 - i * 8;
        if (portal.isColorful) {
          pg.fill(255, alpha);
        } else {
          pg.fill(red(c), green(c), blue(c), alpha);
        }
        pg.ellipse(0, 0, portal.w * (0.1 + i * 0.1));
      }
      
      // 傳送門標題
      pg.noStroke();
      pg.fill(255, isHovered ? 255 : 220);
      pg.textSize(isHovered ? 22 : 20);
      pg.textStyle(BOLD);
      pg.textAlign(CENTER, CENTER);
      pg.text(portal.label, 0, 0);
      pg.textStyle(NORMAL);
      pg.pop();
    }
  } else {
    // --- 風格二：光環風格 (適用於星空2等其他背景) ---
    for (const portal of portals) {
      let d = checkHover ? dist(mouseX, mouseY, portal.x + portal.w / 2, portal.y + portal.h / 2) : 999;
      let isHovered = d < portal.w / 2;

      pg.push();
      pg.translate(portal.x + portal.w / 2, portal.y + portal.h / 2);

      // 模擬時空穿越的感覺：多層次、發光、旋轉的圓環
      for (let i = 3; i > 0; i--) {
        let pulse = sin(portalPhase * i * 0.5 + portal.groupIndex) * 5 + 5;
        let diameter = portal.w + pulse * i;
        let alpha = isHovered ? 150 - i * 30 : 100 - i * 20;

        pg.noFill();
        if (portal.isColorful) {
          pg.colorMode(HSB, 360, 100, 100, 1);
          let hue = (frameCount + i * 60) % 360;
          pg.stroke(hue, 80, 100, alpha / 255);
        } else {
          pg.stroke(red(portal.color), green(portal.color), blue(portal.color), alpha);
        }
        pg.strokeWeight(2 + i);
        pg.rotate(sin(portalPhase * 0.5 + i) * 0.1);
        pg.ellipse(0, 0, diameter, diameter);
      }
      pg.colorMode(RGB); // 重設顏色模式

      // 傳送門標題
      pg.noStroke();
      pg.fill(255, isHovered ? 255 : 200);
      pg.textSize(isHovered ? 22 : 20);
      pg.text(portal.label, 0, 0);
      pg.pop();
    }
  }
}

function drawWorksScreen() {
  drawWorksScreenBackground();

  // 如果是世界一 (星空3背景)，則繪製流星
  if (currentWorkGroupIndex === 0) {
    // 每秒產生 1~3 顆流星
    if (frameCount % 60 === 0) {
      let num = floor(random(1, 4));
      for (let i = 0; i < num; i++) {
        shootingStars.push(new ShootingStar());
      }
    }

    // 更新並繪製流星
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      let star = shootingStars[i];
      star.update();
      star.show(this);
      if (star.isOffscreen()) {
        shootingStars.splice(i, 1);
      }
    }
  }

  // 如果是世界二 (海底背景)，則繪製水母和氣泡
  if (currentWorkGroupIndex === 1) {
    // 如果還沒有水母，就生成幾隻
    if (jellyfishes.length === 0) {
      let jellyfishImg = iconImages[8];
      if (jellyfishImg) {
        const avoidAreas = [workItems[0], workItems[1]];
        for (let i = 0; i < 8; i++) { // 增加水母的數量
          jellyfishes.push(new Jellyfish(jellyfishImg, avoidAreas));
        }
      }
    }
    // 更新並繪製水母
    for (const jellyfish of jellyfishes) {
      jellyfish.update();
      jellyfish.show(this);
    }

    // 每隔一段時間產生新氣泡
    if (frameCount % 15 === 0) {
      bubbles.push(new Bubble());
    }
    // 更新並繪製氣泡
    for (let i = bubbles.length - 1; i >= 0; i--) {
      let bubble = bubbles[i];
      bubble.update();
      bubble.show(this);
      if (bubble.isOffscreen()) {
        bubbles.splice(i, 1);
      }
    }
  }

  // 如果是世界三 (天空背景)，則繪製額外圖片和風流動特效
  if (currentWorkGroupIndex === 2) {
    // 風流動特效
    if (frameCount % 8 === 0) {
      windParticles.push(new WindParticle());
    }
    for (let i = windParticles.length - 1; i >= 0; i--) {
      let p = windParticles[i];
      p.update();
      p.show(this);
      if (p.isOffscreen()) {
        windParticles.splice(i, 1);
      }
    }

    let planeImg = iconImages[9];
    let kiritoImg = iconImages[10];

    push();
    imageMode(CENTER);
    tint(255, 200); // 讓圖片稍微透明，更好地融入背景

    if (planeImg) {
      let imgRatio = planeImg.height / planeImg.width;
      let imgW = 400;
      // 修正：調整位置到左下角，避免與按鈕重疊
      image(planeImg, width * 0.15, height * 0.7, imgW, imgW * imgRatio);
    }
    if (kiritoImg) {
      let imgRatio = kiritoImg.height / kiritoImg.width;
      // 修正：縮小圖片並調整位置到右上角
      let imgW = 220;
      image(kiritoImg, width * 0.85, height * 0.3, imgW, imgW * imgRatio);
    }
    pop();
  }

  // 如果是世界四 (森林背景)，則繪製裝飾物件
  if (currentWorkGroupIndex === 3) {
    if (forestDecorations.length === 0) {
      // 定義按鈕區域以避免重疊
      const btn1 = { x: width * 0.25 - workItemWidth / 2, y: height / 2 - workItemHeight / 2, w: workItemWidth, h: workItemHeight };
      const btn2 = { x: width * 0.75 - workItemWidth / 2, y: height / 2 - workItemHeight / 2, w: workItemWidth, h: workItemHeight };
      
      const decoSize = 120; // 縮小圖片尺寸
      const margin = decoSize / 2; // 圖片與邊界的距離

      // 裝飾圖片從索引 11 開始
      for (let i = 11; i < iconImages.length; i++) {
        const img = iconImages[i];
        if (img) {
          let x, y;
          let validPosition = false;
          let attempts = 0; // 避免無限迴圈

          while (!validPosition && attempts < 100) {
            // 產生在螢幕範圍內的位置
            x = random(margin, width - margin);
            y = random(margin, height - margin);
            
            let overlaps = false;

            // 檢查是否與按鈕重疊 (AABB collision detection)
            const decoBox = { x: x - margin, y: y - margin, w: decoSize, h: decoSize };
            if ( (decoBox.x < btn1.x + btn1.w && decoBox.x + decoBox.w > btn1.x && decoBox.y < btn1.y + btn1.h && decoBox.y + decoBox.h > btn1.y) ||
                 (decoBox.x < btn2.x + btn2.w && decoBox.x + decoBox.w > btn2.x && decoBox.y < btn2.y + btn2.h && decoBox.y + decoBox.h > btn2.y) ) {
              overlaps = true;
            }
            if (overlaps) {
              attempts++;
              continue;
            }

            // 檢查是否與其他已放置的裝飾重疊
            for (const deco of forestDecorations) {
              if (dist(x, y, deco.x, deco.y) < decoSize * 1.5) { // 確保間距更寬
                overlaps = true;
                break;
              }
            }
            if (overlaps) {
              attempts++;
              continue;
            }
            
            validPosition = true;
          }

          if (validPosition) {
            forestDecorations.push({
              img: img,
              x: x,
              y: y,
              size: decoSize
            });
          }
        }
      }
    }

    // 繪製裝飾
    push();
    imageMode(CENTER);
    for (const deco of forestDecorations) {
      const imgRatio = deco.img.width / deco.img.height;
      let imgW, imgH;
      if (imgRatio > 1) { // 寬圖
        imgW = deco.size;
        imgH = deco.size / imgRatio;
      } else { // 高圖
        imgH = deco.size;
        imgW = deco.size * imgRatio;
      }
      image(deco.img, deco.x, deco.y, imgW, imgH);
    }
    pop();
  }

  drawWorksPage(this);
}

function drawWorksPage(pg, checkHover = true) {
  pg.push();
  // --- 繪製作品集標題 ---
  pg.fill(255);
  pg.noStroke();
  pg.textSize(32);
  pg.textAlign(CENTER, TOP);
  pg.text(workGroupTitles[currentWorkGroupIndex], pg.width / 2, 30);

  // --- 繪製返回按鈕 ---
  let isBackHovered = checkHover && mouseX > backButton.x && mouseX < backButton.x + backButton.w &&
                      mouseY > backButton.y && mouseY < backButton.y + backButton.h;
  pg.stroke(255);
  pg.strokeWeight(1.5);
  pg.fill(isBackHovered ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.15)');
  pg.rect(backButton.x, backButton.y, backButton.w, backButton.h, 8);
  pg.noStroke();
  pg.fill(255);
  pg.textSize(16);
  pg.textAlign(CENTER, CENTER);
  pg.text('返回主世界', backButton.x + backButton.w / 2, backButton.y + backButton.h / 2);

  // --- 繪製作品項目 ---
  pg.textFont('sans-serif');
  pg.textSize(20);
  pg.textStyle(NORMAL);
  pg.textAlign(CENTER, CENTER);

  for (let item of workItems) {
    let isHovered = checkHover && mouseX > item.x && mouseX < item.x + item.width &&
                    mouseY > item.y && mouseY < item.y + item.height;

    // 如果是世界一 (星空3背景)，則繪製星座按鈕
    if (currentWorkGroupIndex === 0) {
      pg.push();
      pg.translate(item.x + item.width / 2, item.y + item.height / 2);

      // 繪製星座
      let img;

      if (item.work.week === "第一週") { // 天蠍座 (Scorpius) - 重新繪製
        img = iconImages[0]; // 天蠍座圖片
      } else if (item.work.week === "第二週") { // 天平座
        img = iconImages[1]; // 天平座圖片
      }

      // 繪製圖片
      if (img) {
        pg.imageMode(CENTER);
        let imgSize = isHovered ? 160 : 150; // 再次放大圖片尺寸
        if (isHovered) {
          pg.tint(255, 255, 200, 255); // 懸停時發出黃光
        }
        pg.image(img, 0, -25, imgSize, imgSize); // 將圖片向上移動更多
        pg.noTint(); // 重置色調
      }
      
      // 繪製文字
      pg.noStroke();
      pg.fill(isHovered ? 255 : 220);
      pg.textSize(28); // 再次放大文字
      pg.text(item.work.week, 0, 60); // 將文字向下移動更多

      pg.pop();
    } else if (currentWorkGroupIndex === 1) { // 世界二 (海底背景)
      pg.push();
      pg.translate(item.x + item.width / 2, item.y + item.height / 2);

      let img;
      if (item.work.week === "第三週") {
        img = iconImages[2]; // 鳳梨屋圖片
      } else if (item.work.week === "第四週") {
        img = iconImages[3]; // 石頭屋圖片
      }

      if (img) {
        pg.imageMode(CENTER);
        
        // 修正：維持圖片比例，避免壓縮
        // 並確保不同比例的圖片看起來大小相似
        let imgRatio = img.width / img.height;
        let maxSize = isHovered ? 250 : 240;
        let imgW, imgH;
        if (imgRatio > 1) { // 寬圖 (如石頭屋)
          imgW = maxSize;
          imgH = maxSize / imgRatio;
        } else { // 高圖 (如鳳梨屋)
          imgH = maxSize;
          imgW = maxSize * imgRatio;
        }

        if (isHovered) {
          // 使用外發光效果來模擬水中的光暈
          pg.drawingContext.shadowBlur = 20;
          pg.drawingContext.shadowColor = color(255, 255, 200);
        }
        pg.image(img, 0, -60, imgW, imgH); // 調整圖片位置
        pg.drawingContext.shadowBlur = 0; // 重置陰影
      }

      pg.noStroke();
      pg.fill(isHovered ? 255 : 220);
      pg.textSize(40); // 再次放大文字
      pg.text(item.work.week, 0, 95); // 調整文字位置
      pg.pop();
    } else if (currentWorkGroupIndex === 2) { // 世界三 (天空背景)
      pg.push();
      pg.translate(item.x + item.width / 2, item.y + item.height / 2);

      let img;
      if (item.work.week === "第五週") {
        img = iconImages[4]; // 天空之城圖片
      } else if (item.work.week === "第五週-2") {
        img = iconImages[5]; // 刀劍神諭圖片
      }

      if (img) {
        pg.imageMode(CENTER);
        let imgRatio = img.width / img.height;
        let maxSize = isHovered ? 250 : 240;
        let imgW, imgH;
        if (imgRatio > 1) {
          imgW = maxSize;
          imgH = maxSize / imgRatio;
        } else {
          imgH = maxSize;
          imgW = maxSize * imgRatio;
        }

        if (isHovered) {
          pg.drawingContext.shadowBlur = 20;
          pg.drawingContext.shadowColor = color(200, 220, 255);
        }
        pg.image(img, 0, -60, imgW, imgH);
        pg.drawingContext.shadowBlur = 0;
      }

      pg.noStroke();
      pg.fill(isHovered ? 255 : 220);
      pg.textSize(40);
      pg.text(item.work.week, 0, 95);
      pg.pop();
    } else if (currentWorkGroupIndex === 3) { // 世界四 (森林背景)
      pg.push();
      pg.translate(item.x + item.width / 2, item.y + item.height / 2);

      let img;
      if (item.work.week === "第六週") {
        img = iconImages[6]; // 阿寶圖片
      } else if (item.work.week === "第六週-2") {
        img = iconImages[7]; // 老皮圖片
      }

      if (img) {
        pg.imageMode(CENTER);
        let imgRatio = img.width / img.height;
        let maxSize = isHovered ? 250 : 240;
        let imgW, imgH;
        if (imgRatio > 1) {
          imgW = maxSize;
          imgH = maxSize / imgRatio;
        } else {
          imgH = maxSize;
          imgW = maxSize * imgRatio;
        }

        if (isHovered) {
          pg.drawingContext.shadowBlur = 20;
          pg.drawingContext.shadowColor = color(255, 255, 150); // Yellow glow
        }
        pg.image(img, 0, -60, imgW, imgH);
        pg.drawingContext.shadowBlur = 0;
      }

      pg.noStroke();
      pg.fill(isHovered ? 255 : 220);
      pg.textSize(40);
      pg.text(item.work.week, 0, 95);
      pg.pop();
    } else {
      // 其他世界維持原本的矩形按鈕
      pg.fill(isHovered ? 'rgba(200, 200, 220, 0.9)' : 'rgba(220, 220, 240, 0.7)');
      pg.stroke(0);
      pg.strokeWeight(2);
      pg.rect(item.x, item.y, item.width, item.height, 10);

      pg.fill(0);
      pg.text(item.work.week, item.x + item.width / 2, item.y + item.height / 2);
    }
  }
  pg.pop();
}

function drawWorksScreenBackground(pg = this) {
  let bg;
  // 根據不同的世界，使用不同的背景
  if (currentWorkGroupIndex === 0) { // 世界一
    bg = bgImages[2]; // 使用星空3
  } else if (currentWorkGroupIndex === 1) { // 世界二
    bg = bgImages[3]; // 使用海底1
  } else if (currentWorkGroupIndex === 2) { // 世界三
    bg = bgImages[4]; // 使用天空2
  } else if (currentWorkGroupIndex === 3) { // 世界四
    bg = bgImages[5]; // 使用森林3
  } else {
    bg = bgHome; // 其他世界使用預設主頁背景
  }
  drawCoverBackground(bg, pg);
}


function drawPortalTransition() {
  let elapsedTime = millis() - transitionStartTime;
  let progress = constrain(elapsedTime / PORTAL_TRANSITION_DURATION, 0, 1);

  background(0);
  translate(width / 2, height / 2);
  for (let particle of particles) {
    // 速度隨時間加快
    particle.update(map(progress, 0, 1, 5, 40));
    particle.show();
  }
  translate(-width / 2, -height / 2);

  if (progress >= 1) {
    worksBuffer.clear();
    if (currentWorkGroupIndex === -1) { // 如果是返回主世界
      drawHomeScreenBackground(worksBuffer);
      drawHomePage(worksBuffer, false);
      appState = 'homeZoomIn';
    } else { // 如果是進入某個世界
      // 預先繪製完整的作品頁面到緩衝區
      drawWorksScreenBackground(worksBuffer); // 將背景繪製到緩衝區
      drawWorksPage(worksBuffer, false);     // 將 UI 繪製到緩衝區

      // 如果進入世界一，開始播放音樂
      if (currentWorkGroupIndex === 0 && music1.isLoaded() && !music1.isPlaying()) {
        music1.loop();
      }

      // 如果進入世界二，開始播放音樂
      if (currentWorkGroupIndex === 1 && music2.isLoaded() && !music2.isPlaying()) {
        music2.loop();
      }

      // 如果進入世界三，開始播放音樂
      if (currentWorkGroupIndex === 2 && music3_1.isLoaded() && music3_2.isLoaded()) {
          if (!music3_1.isPlaying() && !music3_2.isPlaying()) {
              // 設定循環播放邏輯
              music3_1.onended(() => {
                  music3_2.play();
              });
              music3_2.onended(() => {
                  music3_1.play();
              });

              // 隨機播放第一首
              if (random() > 0.5) { music3_1.play(); } else { music3_2.play(); }
          }
      }
      // 如果進入世界四，開始播放音樂
      if (currentWorkGroupIndex === 3 && music4.isLoaded() && !music4.isPlaying()) {
        music4.loop();
      }

      appState = 'worksZoomIn';
    }

    transitionStartTime = millis();
  }
}

function drawWorksZoomIn() {
  let elapsedTime = millis() - transitionStartTime;
  let progress = constrain(elapsedTime / ZOOM_DURATION, 0, 1);
  // 使用 easeOutCubic 函數，讓縮放有漸慢效果
  let easedProgress = 1 - pow(1 - progress, 3);

  drawWorksScreenBackground(); // 修正：在縮放動畫期間顯示正確的背景

  // 繪製從遠處飛來的完整作品頁面 (worksBuffer)
  push();
  translate(width / 2, height / 2);
  scale(easedProgress);
  translate(-width / 2, -height / 2);
  image(worksBuffer, 0, 0);
  pop();

  if (progress >= 1) {
    appState = 'works';
  }
}

function drawHomeZoomIn() {
  let elapsedTime = millis() - transitionStartTime;
  let progress = constrain(elapsedTime / ZOOM_DURATION, 0, 1);
  let easedProgress = 1 - pow(1 - progress, 3);

  // 1. 先繪製目標畫面的背景 (home background)
  drawHomeScreenBackground();

  // 2. 繪製從遠處飛來的 UI 層 (worksBuffer)
  push();
  translate(width / 2, height / 2);
  scale(easedProgress);
  translate(-width / 2, -height / 2);
  image(worksBuffer, 0, 0);
  pop();

  if (progress >= 1) {
    appState = 'home';
  }
}

// Click event for work items
function mousePressed() {
  // 修正：增加保護，確保在讀取畫面時或 DOM 元素未建立前，點擊無效
  if (appState === 'loading' || appState === 'loadingFadeOut' || !iframeContainer) {
    return;
  }

  if (appState === 'home') {
    // 檢查是否點擊傳送門
    for (const portal of portals) {
      if (dist(mouseX, mouseY, portal.x + portal.w / 2, portal.y + portal.h / 2) < portal.w / 2) {
        appState = 'portalTransition';
        transitionStartTime = millis();
        currentWorkGroupIndex = portal.groupIndex;
        initializePositions(); // 為選擇的群組計算版面
        // 重置粒子效果，讓它們從中心開始
        for (let p of particles) {
          p.reset();
        }
        break;
      }
    }
  } else if (appState === 'works') {
    // 檢查是否點擊 "返回主頁" 按鈕
    if (mouseX > backButton.x && mouseX < backButton.x + backButton.w &&
        mouseY > backButton.y && mouseY < backButton.y + backButton.h) {
      
      // 如果音樂正在播放，則停止
      if (music1.isPlaying()) {
        music1.stop();
      }
      // 新增：如果世界二的音樂正在播放，也停止
      if (music2.isPlaying()) {
        music2.stop();
      }
      // 新增：如果世界三的音樂正在播放，也停止
      if (music3_1.isPlaying()) {
        music3_1.stop();
        music3_1.onended(null); // 清除回呼，避免記憶體洩漏
      }
      if (music3_2.isPlaying()) {
        music3_2.stop();
        music3_2.onended(null); // 清除回呼
      }
      // 新增：如果世界四的音樂正在播放，也停止
      if (music4.isPlaying()) {
        music4.stop();
      }

      // 新增：清除世界二的特效物件
      if (jellyfishes.length > 0) {
        jellyfishes = [];
        bubbles = [];
      }

      // 新增：清除世界三的風流動特效
      if (windParticles.length > 0) {
        windParticles = [];
      }

      // 新增：清除世界四的裝飾物件
      if (forestDecorations.length > 0) {
        forestDecorations = [];
      }

      // 新增：清除流星，避免回到主頁時還在畫
      if (shootingStars.length > 0) {
        shootingStars = [];
      }

      appState = 'portalTransition';
      transitionStartTime = millis();
      currentWorkGroupIndex = -1;
      for (let p of particles) {
        p.reset();
      }
      return; // 返回後，不執行後續的點擊檢查
    }

    // 如果 iframe 已開啟，則不觸發作品項目點擊
    if (iframeContainer.style('display') === 'block') return;

    // 檢查是否點擊作品項目
    for (let item of workItems) {
      if (mouseX > item.x && mouseX < item.x + item.width &&
          mouseY > item.y && mouseY < item.y + item.height) {
        openIframe(item.work.url);
        break;
      }
    }
  }
}

function openIframe(url) {
  myIframe.attribute('src', url);
  iframeContainer.style('display', 'block');
}

function closeIframe() {
  myIframe.attribute('src', '');
  iframeContainer.style('display', 'none');
}

function initializePositions() {
  // --- 傳送門定義 ---
  // 修正：將定義移至此處，以確保在 windowResized 時也能正確重新建立
  portals = [
    // 左：綠色
    { w: 160, h: 160, color: color(100, 255, 150, 200), label: '世界一', groupIndex: 0, position: 'left' },
    // 上：粉色
    { w: 160, h: 160, color: color(255, 150, 200, 200), label: '世界二', groupIndex: 1, position: 'top' },
    // 右：橘色
    { w: 160, h: 160, color: color(255, 180, 100, 200), label: '世界三', groupIndex: 2, position: 'right' },
    // 下：彩色
    { w: 160, h: 160, color: color(255), label: '世界四', groupIndex: 3, position: 'bottom', isColorful: true }
  ];
  // --- 計算傳送門的位置 ---
  const portalSize = 160;
  portals[0].x = width * 0.2 - portalSize / 2; // 左
  portals[0].y = height / 2 - portalSize / 2;
  portals[1].x = width / 2 - portalSize / 2;     // 上
  portals[1].y = height * 0.3 - portalSize / 2;
  portals[2].x = width * 0.8 - portalSize / 2; // 右
  portals[2].y = height / 2 - portalSize / 2;
  portals[3].x = width / 2 - portalSize / 2;     // 下
  portals[3].y = height * 0.7 - portalSize / 2;


  // --- 計算作品集項目的位置 ---
  if (currentWorkGroupIndex === -1) {
    workItems = [];
    return;
  }

  const currentGroup = workGroups[currentWorkGroupIndex];
  if (!currentGroup || currentGroup.length === 0) {
    workItems = [];
    return;
  }

  workItems = [];

  // 為世界一（星座）設置特別的佈局
  if (currentWorkGroupIndex === 0) {
    // 左上角按鈕
    workItems.push({
      x: width * 0.25 - workItemWidth / 2,
      y: height * 0.4 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[0]
    });
    // 右上角按鈕
    workItems.push({
      x: width * 0.75 - workItemWidth / 2,
      y: height * 0.4 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[1]
    });
  } else if (currentWorkGroupIndex === 1) { // 世界二的佈局
    // 左邊按鈕
    workItems.push({
      x: width * 0.25 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[0]
    });
    // 右邊按鈕
    workItems.push({
      x: width * 0.75 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[1]
    });
  } else if (currentWorkGroupIndex === 2) { // 世界三的佈局
    // 左邊按鈕
    workItems.push({
      x: width * 0.25 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[0]
    });
    // 右邊按鈕
    workItems.push({
      x: width * 0.75 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[1]
    });
  } else if (currentWorkGroupIndex === 3) { // 世界四的佈局
    // 左邊按鈕
    workItems.push({
      x: width * 0.25 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[0]
    });
    // 右邊按鈕
    workItems.push({
      x: width * 0.75 - workItemWidth / 2,
      y: height / 2 - workItemHeight / 2,
      width: workItemWidth,
      height: workItemHeight,
      work: currentGroup[1]
    });
  } else { // 其他世界的預設佈局
    let totalWidth = currentGroup.length * workItemWidth + (currentGroup.length - 1) * 20;
    let startX = (width - totalWidth) / 2;
    let startY = height / 2 + 50;
    for (let i = 0; i < currentGroup.length; i++) {
      workItems.push({
        x: startX + i * (workItemWidth + 20),
        y: startY,
        width: workItemWidth,
        height: workItemHeight,
        work: currentGroup[i]
      });
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  initializePositions();
  // 確保離屏畫布也跟著調整大小
  worksBuffer = createGraphics(windowWidth, windowHeight);
  iframeContainer.position(width * 0.1, height * 0.1);
  iframeContainer.size(width * 0.8, height * 0.8);
  myIframe.size(iframeContainer.width - 30, iframeContainer.height - 75);
}
