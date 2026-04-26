let seaweeds = [];
let bubbles = [];
let colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];
let numSeaweeds = 50;
let seaweedProps = []; // 宣告一個陣列來儲存每條水草的專屬屬性
let popSound; // 宣告音效變數
let isSoundEnabled = false; // 控制音效是否播放的開關

// --- 新增海底生物的陣列 ---
let fishes = [];
let crabs = [];
let seahorses = [];
let shrimps = [];

function preload() {
  // 載入音效，並加入成功與失敗的 Callback 處理，避免 404 時卡在 Loading 畫面
  popSound = loadSound('pop.mp3', 
    () => { console.log('音效載入成功！'); },
    (err) => { console.warn('找不到音效檔案，請確認檔名與路徑是否正確 (如 .mp3 或 .wav)', err); }
  );
}

function setup() {
  // 採用全螢幕畫布
  let canvas = createCanvas(windowWidth, windowHeight);
  
  // 設定畫布的 CSS 樣式，讓它固定在最上層，且「不阻擋滑鼠點擊 (pointer-events: none)」
  canvas.style('position', 'fixed');
  canvas.style('top', '0');
  canvas.style('left', '0');
  canvas.style('z-index', '1');
  canvas.style('pointer-events', 'none');
  
  // 產生一個滿版的 iframe 並放在畫布底層
  let iframe = createElement('iframe');
  iframe.attribute('src', 'https://www.et.tku.edu.tw');
  iframe.style('position', 'fixed');
  iframe.style('top', '0');
  iframe.style('left', '0');
  iframe.style('width', '100vw');
  iframe.style('height', '100vh');
  iframe.style('z-index', '-1');
  iframe.style('border', 'none');
  
  // 1. 利用陣列先產生並儲存每條水草的屬性：高度、顏色、粗細、搖晃頻率
  for (let i = 0; i < numSeaweeds; i++) {
    let c = color(random(colors));
    c.setAlpha(random(100, 180)); // 產生 100~180 的隨機透明度，增加交疊層次感
    seaweedProps.push({
      h: random(height * 0.3, height * 0.66), // 高度
      c: c,                                   // 帶有隨機透明度的顏色
      w: random(30, 60),                      // 粗細
      freq: random(0.005, 0.03)               // 搖晃頻率
    });
  }
  
  // 均衡產生 50 根水草
  let spacing = width / numSeaweeds;
  for (let i = 0; i < numSeaweeds; i++) {
    let startX = (i * spacing) + (spacing / 2);
    // 將陣列中對應的屬性資料傳入水草物件
    seaweeds.push(new Seaweed(startX, seaweedProps[i]));
  }
  
  // 初始化 50 個氣泡
  for (let i = 0; i < 50; i++) {
    bubbles.push(new Bubble());
  }

  // --- 初始化海底生物 ---
  for (let i = 0; i < 7; i++) {
    fishes.push(new Fish(random(colors)));
  }
  for (let i = 0; i < 5; i++) {
    crabs.push(new Crab(random(colors)));
  }
  for (let i = 0; i < 3; i++) {
    seahorses.push(new Seahorse(random(colors)));
  }
  for (let i = 0; i < 10; i++) {
    shrimps.push(new Shrimp(random(colors)));
  }

  // 建立「點擊開始」的啟動畫面來解鎖瀏覽器音效限制
  let startOverlay = createDiv('點擊畫面開始 (Click to Start)');
  startOverlay.style('position', 'fixed');
  startOverlay.style('top', '0');
  startOverlay.style('left', '0');
  startOverlay.style('width', '100vw');
  startOverlay.style('height', '100vh');
  startOverlay.style('background-color', 'rgba(0, 0, 0, 0.75)');
  startOverlay.style('color', 'white');
  startOverlay.style('display', 'flex');
  startOverlay.style('justify-content', 'center');
  startOverlay.style('align-items', 'center');
  startOverlay.style('font-size', '32px');
  startOverlay.style('z-index', '9999'); // 確保在最上層
  startOverlay.style('cursor', 'pointer');
  
  // 當點擊啟動畫面時
  startOverlay.mousePressed(() => {
    userStartAudio();     // 解鎖 AudioContext 音效引擎
    isSoundEnabled = true; // 啟用音效播放
    startOverlay.remove(); // 移除啟動畫面，讓使用者可以點擊後方的 iframe
    
    // 新增一個專屬的音效開關按鈕
    let soundBtn = createButton('🔊 音效 ON');
    soundBtn.position(20, 20); // 放置於畫面左上角
    soundBtn.style('position', 'fixed'); // 讓按鈕固定在畫面上，不會因為往下滾動網頁而消失
    soundBtn.style('z-index', '9999');
    soundBtn.style('pointer-events', 'auto'); // 確保點擊事件不會被畫布穿透影響
    soundBtn.style('padding', '10px 15px');
    soundBtn.style('background-color', 'rgba(0, 0, 0, 0.6)');
    soundBtn.style('color', 'white');
    soundBtn.style('border', 'none');
    soundBtn.style('border-radius', '8px');
    soundBtn.style('cursor', 'pointer');
    soundBtn.style('font-size', '16px');
    
    // 點擊按鈕時切換音效開關 (改用 mouseClicked 較穩定)
    soundBtn.mouseClicked(() => {
      isSoundEnabled = !isSoundEnabled;
      soundBtn.html(isSoundEnabled ? '🔊 音效 ON' : '🔇 音效 OFF');
    });
  });
}

function draw() {
  // 先清除畫布上的所有像素，避免帶有透明度的背景不斷疊加變成不透明的殘影
  clear();
  // 營造深海環境的深藍色背景，並加入 0.2 的透明度 (rgba)
  background('rgba(10, 77, 104, 0.2)');
  
  // 繪製與更新氣泡
  for (let b of bubbles) {
    b.update();
    b.display();
  }
  
  // 確認啟用 BLEND 混合模式，讓帶有透明度的水草能自然重疊透色
  blendMode(BLEND);
  // 繪製水草叢
  for (let s of seaweeds) {
    s.display();
  }

  // --- 繪製與更新海底生物 ---
  for (let f of fishes) {
    f.update();
    f.display();
  }
  for (let c of crabs) {
    c.update();
    c.display();
  }
  for (let s of seahorses) {
    s.update();
    s.display();
  }
  for (let s of shrimps) {
    s.update();
    s.display();
  }
}

// --- 氣泡類別 ---
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = random(height, height + 200);
    this.size = random(4, 12);
    this.speed = random(1, 3);
    // 隨機決定破裂的高度 (在畫面的中上段)
    this.popY = random(height * 0.1, height * 0.5); 
  }
  
  update() {
    this.y -= this.speed; // 往上飄
    this.x += sin(frameCount * 0.05 + this.y * 0.02) * 0.5; // 加上水波微幅搖晃
    
    // 當到達破裂高度時，重置回底部
    if (this.y < this.popY) {
      // 如果開關開啟，且音效已成功載入，則播放音效
      if (isSoundEnabled && popSound && popSound.isLoaded()) {
        // play(延遲時間, 播放速率/音高, 音量)
        // 利用亂數微調每次破裂的音高與降低音量，避免聲音重疊太吵雜
        popSound.play(0, random(0.8, 1.3), random(0.1, 0.3));
      }
      this.y = height + random(10, 50);
      this.x = random(width);
      this.popY = random(height * 0.1, height * 0.5);
    }
  }
  
  display() {
    noFill();
    stroke(255, 150);
    strokeWeight(1.5);
    circle(this.x, this.y, this.size);
    // 畫一點反光的亮點讓泡泡更立體
    fill(255, 200);
    noStroke();
    circle(this.x - this.size * 0.2, this.y - this.size * 0.2, this.size * 0.2);
  }
}

// --- 水草類別 ---
class Seaweed {
  constructor(x, prop) {
    this.baseX = x;
    // 從傳入的屬性陣列資料中取得高度
    this.h = prop.h; 
    this.segments = floor(random(15, 25));
    // 從傳入的屬性陣列資料中取得粗細
    this.baseWidth = prop.w;
    this.noiseOffset = random(1000);
    // 從傳入的屬性陣列資料中取得搖晃頻率
    this.swaySpeed = prop.freq;
    this.waveAmp = random(80, 150) * random([-1, 1]); // 乘以隨機正負 1 來打亂方向性
    // 賦予一個自然的隨機弧度偏移
    this.lean = random(-120, 120); 
    // 直接使用從陣列傳入，且已經包含隨機透明度設定的顏色
    this.color = prop.c;
  }

  display() {
    fill(this.color);
    noStroke();
    beginShape();
    
    // 計算水草左側與右側的共同中心線
    let points = [];
    for (let i = 0; i <= this.segments; i++) {
      let t = i / this.segments;
      let y = height - (this.h * t);
      // 使用專屬的 swaySpeed 來計算動態
      let n = noise(frameCount * this.swaySpeed + this.noiseOffset, i * 0.1);
      // 使用專屬的 waveAmp 來決定擺動方向與幅度
      let wave = map(n, 0, 1, -this.waveAmp, this.waveAmp) * t;
      let arc = this.lean * (t * t); // 利用平方項製造自然的彎曲弧度
      let cx = this.baseX + wave + arc;
      let currentW = lerp(this.baseWidth, 0, t); // 寬度漸縮至 0 (頂部微尖)
      points.push({x: cx, y: y, w: currentW});
    }
    
    // 繪製水草左半邊 (由下往上)
    for (let p of points) curveVertex(p.x - p.w / 2, p.y);
    // 繪製頂部尖端
    curveVertex(points[points.length-1].x, points[points.length-1].y);
    // 繪製水草右半邊 (由上往下)
    for (let i = points.length - 1; i >= 0; i--) curveVertex(points[i].x + points[i].w / 2, points[i].y);
    
    endShape(CLOSE);
  }
}

// 確保視窗縮放時，畫布也能維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  
  // 視窗調整後重新計算水草位置，保持均衡分佈
  let spacing = width / numSeaweeds;
  for (let i = 0; i < seaweeds.length; i++) {
    seaweeds[i].baseX = (i * spacing) + (spacing / 2);
  }
}

// ----------------------------------------------------
// --- 海底生物類別 ---
// ----------------------------------------------------

// --- 魚 ---
class Fish {
  constructor(c) {
    this.x = random(width);
    this.y = random(height * 0.2, height * 0.8);
    this.size = random(15, 40);
    this.color = color(c);
    this.speed = random(1, 3) * (random() > 0.5 ? 1 : -1);
    this.yOffset = random(1000);
  }

  update() {
    this.x += this.speed;
    // 增加上下游動的感覺
    this.y += sin(frameCount * 0.05 + this.yOffset) * 0.5;

    // 從畫面另一邊繞回來
    if (this.speed > 0 && this.x > width + this.size) {
      this.x = -this.size;
      this.y = random(height * 0.2, height * 0.8);
    } else if (this.speed < 0 && this.x < -this.size) {
      this.x = width + this.size;
      this.y = random(height * 0.2, height * 0.8);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    // 讓魚根據游動方向翻轉
    if (this.speed < 0) {
      scale(-1, 1);
    }
    noStroke();
    fill(this.color);
    
    // 身體
    ellipse(0, 0, this.size, this.size * 0.6);
    
    // 會擺動的尾巴
    let tailWiggle = sin(frameCount * 0.2) * (this.size * 0.1);
    triangle(
      -this.size * 0.5, 0,
      -this.size * 0.8, -this.size * 0.3 + tailWiggle,
      -this.size * 0.8, this.size * 0.3 + tailWiggle
    );
    
    // 眼睛
    fill(0);
    circle(this.size * 0.25, 0, this.size * 0.1);
    
    pop();
  }
}

// --- 螃蟹 ---
class Crab {
  constructor(c) {
    this.x = random(width);
    this.y = height - random(10, 40); // 在底部附近
    this.size = random(20, 50);
    this.color = color(c);
    this.speed = random(0.5, 1.5) * (random() > 0.5 ? 1 : -1);
  }

  update() {
    this.x += this.speed;
    // 在畫面邊緣反彈
    if (this.x > width - this.size / 2 || this.x < this.size / 2) {
      this.speed *= -1;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    stroke(this.color);
    strokeWeight(3);
    fill(this.color);
    
    // 身體 (半圓形)
    arc(0, 0, this.size, this.size, PI, TWO_PI);
    
    // 眼睛
    fill(0);
    noStroke();
    circle(-this.size * 0.2, -this.size * 0.1, 4);
    circle(this.size * 0.2, -this.size * 0.1, 4);
    
    // 蟹腳
    stroke(this.color);
    let legWiggle = sin(frameCount * 0.1 + this.x) * 5;
    for (let i = 0; i < 3; i++) {
      let angle = PI / 4 * (i + 1);
      line(0, 0, -cos(angle) * this.size * 0.6, sin(angle) * this.size * 0.3 + legWiggle);
      line(0, 0, cos(angle) * this.size * 0.6, sin(angle) * this.size * 0.3 + legWiggle);
    }
    
    // 蟹螯
    strokeWeight(4);
    line(-this.size * 0.4, 0, -this.size * 0.6, -this.size * 0.3);
    line(this.size * 0.4, 0, this.size * 0.6, -this.size * 0.3);
    noFill();
    arc(-this.size * 0.65, -this.size * 0.4, 15, 15, PI / 2, PI * 1.5);
    arc(this.size * 0.65, -this.size * 0.4, 15, 15, PI * 1.5, PI / 2);

    pop();
  }
}

// --- 海馬 ---
class Seahorse {
  constructor(c) {
    this.x = random(width);
    this.y = random(height * 0.4, height * 0.8);
    this.size = random(40, 80);
    this.color = color(c);
    this.xOffset = random(1000);
  }

  update() {
    // 溫和地上下漂浮與左右移動
    this.y += sin(frameCount * 0.02 + this.xOffset) * 0.3;
    this.x += sin(frameCount * 0.01 + this.xOffset) * 0.2;

    if (this.y < height * 0.2 || this.y > height * 0.9) {
      this.y = constrain(this.y, height * 0.2, height * 0.9);
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    scale(this.size / 100); // 縮放整體繪圖
    
    noFill();
    stroke(this.color);
    strokeWeight(8);

    // S 型身體
    beginShape();
    curveVertex(-20, -40);
    curveVertex(0, -50);
    curveVertex(20, -20);
    curveVertex(0, 0);
    curveVertex(-15, 30);
    curveVertex(10, 50);
    curveVertex(5, 60);
    endShape();

    // 頭部
    fill(this.color);
    noStroke();
    circle(0, -50, 20);
    // 嘴
    rect(-5, -70, 10, 20);
    // 眼睛
    fill(0);
    circle(5, -55, 3);

    // 擺動的鰭
    let finWiggle = sin(frameCount * 0.5) * 3;
    fill(this.color);
    triangle(15, -15, 30 + finWiggle, -5, 30 + finWiggle, -25);

    pop();
  }
}

// --- 蝦子 ---
class Shrimp {
  constructor(c) {
    this.x = random(width);
    this.y = random(height * 0.7, height - 20);
    this.size = random(10, 25);
    this.color = color(c);
    this.vx = 0;
    this.vy = 0;
    this.dir = random() > 0.5 ? 1 : -1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;

    // 加上一些阻力
    this.vx *= 0.95;
    this.vy *= 0.95;

    // 加上一點重力
    this.vy += 0.1;

    // 隨機彈跳
    if (random(1) < 0.03) {
      this.vx = random(-2, 2) * this.dir;
      this.vy = -random(2, 4);
    }

    // 讓牠們保持在底部附近
    if (this.y > height - 10) {
      this.y = height - 10;
      this.vy = 0;
    }
  }

  display() {
    push();
    translate(this.x, this.y);
    if (this.vx < 0) {
      scale(-1, 1);
    }
    
    noFill();
    stroke(this.color);
    strokeWeight(3);

    // 身體
    arc(0, 0, this.size, this.size * 1.5, HALF_PI, PI + HALF_PI);

    // 觸鬚
    strokeWeight(1);
    let angle = -PI / 6 + sin(frameCount * 0.1) * 0.2;
    line(this.size / 2, -this.size * 0.75, this.size / 2 + cos(angle) * this.size, -this.size * 0.75 + sin(angle) * this.size);
    angle = -PI / 4 + sin(frameCount * 0.1 + 1) * 0.2;
    line(this.size / 2, -this.size * 0.75, this.size / 2 + cos(angle) * this.size * 0.8, -this.size * 0.75 + sin(angle) * this.size * 0.8);
    
    pop();
  }
}
