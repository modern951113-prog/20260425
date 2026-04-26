/**
 * p5_audio_visualizer
 * 這是一個結合 p5.js 與 p5.sound 的程式，載入音樂並循環播放，
 * 畫面上會有多個隨機生成的多邊形在視窗內移動反彈，
 * 且其大小會跟隨音樂的振幅（音量）即時縮放。
 */

// 全域變數宣告
let shapes = [];
let bubbles = []; // 儲存氣泡的陣列
let song;
let amplitude;
// 外部定義的二維陣列，做為多邊形頂點的基礎座標
let points = [[-3, 5], [3, 7], [1, 5], [2, 4], [4, 3], [5, 2], [6, 2], [8, 4], [8, -1], [6, 0], [0, -3], [2, -6], [-2, -3], [-4, -2], [-5, -1], [-6, 1], [-6, 2]];

function preload() {
  // 在程式開始前預載入外部音樂資源
  song = loadSound('midnight-quirk-255361.mp3');
}

function setup() {
  // 初始化畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化 p5.Amplitude 物件
  amplitude = new p5.Amplitude();

  // 產生 10 個形狀物件
  for (let i = 0; i < 10; i++) {
    let m = random(10, 30); // 隨機倍率 (移到 map 外，確保整隻魚比例一致)
    // 透過 map() 讀取全域陣列 points，產生變形後的頂點
    let shapePoints = points.map(pt => {
      return { x: pt[0] * m, y: -pt[1] * m };
    });

    let shape = {
      x: random(0, windowWidth),
      y: random(0, windowHeight),
      dx: random(-3, 3),
      dy: random(-3, 3),
      scale: random(1, 10),
      color: color(random(255), random(255), random(255)),
      points: shapePoints
    };

    shapes.push(shape);
  }
}

function draw() {
  // 設定背景顏色
  background('#ffcdb2');
  
  // 設定邊框粗細
  strokeWeight(2);

  // 取得當前音量大小
  let level = amplitude.getLevel();
  
  // 將音量映射到縮放倍率
  let sizeFactor = map(level, 0, 1, 0.5, 2);

  // --- 氣泡產生與繪製 ---
  if (random(1) < 0.05) { // 每一幀有 5% 機率產生新氣泡
    bubbles.push(new Bubble());
  }

  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isDead()) {
      bubbles.splice(i, 1);
    }
  }

  // 走訪 shapes 陣列進行更新與繪製
  for (let shape of shapes) {
    // 位置更新
    shape.x += shape.dx;
    shape.y += shape.dy;

    // 邊緣反彈檢查
    if (shape.x < 0 || shape.x > windowWidth) {
      shape.dx *= -1;
    }
    if (shape.y < 0 || shape.y > windowHeight) {
      shape.dy *= -1;
    }

    // 設定外觀
    fill(shape.color);
    stroke(shape.color);

    // 座標轉換與縮放
    push();
    translate(shape.x, shape.y);
    if (shape.dx > 0) {
      scale(-1, 1); // 圖片往右移動時，左右顛倒
    }
    scale(sizeFactor); // 依照音樂音量縮放圖形

    // 繪製多邊形
    beginShape();
    for (let pt of shape.points) {
      vertex(pt.x, pt.y);
    }
    endShape(CLOSE);

    // 狀態還原
    pop();
  }

  // 如果音樂沒有播放，顯示提示文字
  if (song.isLoaded() && !song.isPlaying()) {
    fill(50);
    textAlign(CENTER, CENTER);
    textSize(32);
    text('Click to Play', width / 2, height / 2);
  }
}

// 額外加入：點擊滑鼠以確保音訊播放 (處理瀏覽器自動播放策略)
function mousePressed() {
  userStartAudio();
  if (song.isLoaded()) {
    if (song.isPlaying()) {
      song.pause();
    } else {
      song.loop();
    }
  }
}

// 額外加入：視窗大小改變時調整畫布
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// 氣泡類別
class Bubble {
  constructor() {
    this.x = random(width);
    this.y = height + random(20); // 從底部下方生成
    this.size = random(5, 20);
    this.speed = random(1, 3);
    this.wobble = random(1000); // 噪聲偏移量
    this.popY = random(height * 0.1, height * 0.8); // 隨機設定破掉的高度
    this.popping = false;
    this.popTimer = 10; // 破掉動畫持續時間
  }

  update() {
    if (!this.popping) {
      this.y -= this.speed;
      this.x += map(noise(this.wobble), 0, 1, -1, 1); // 左右搖擺
      this.wobble += 0.01;

      // 到達設定高度時破掉
      if (this.y < this.popY) {
        this.popping = true;
      }
    } else {
      this.popTimer--;
    }
  }

  display() {
    if (!this.popping) {
      noFill();
      stroke(255, 150);
      strokeWeight(1);
      ellipse(this.x, this.y, this.size);
    } else {
      // 破掉的效果：圓圈放大並消失
      noFill();
      stroke(255, map(this.popTimer, 10, 0, 255, 0));
      ellipse(this.x, this.y, this.size + (10 - this.popTimer) * 2);
    }
  }

  isDead() {
    return this.popping && this.popTimer <= 0;
  }
}
