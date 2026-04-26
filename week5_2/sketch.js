let grasses = [];
let bubbles = [];
const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'];
let popSound;

function preload() {
  // 假設音效素材為 mp3，如果是 wav 請自行更改副檔名為 'pop.wav'
  popSound = loadSound('pop.mp3');
}

function setup() {
  let cnv = createCanvas(windowWidth, windowHeight);
  cnv.position(0, 0);
  cnv.style('pointer-events', 'none'); // 讓滑鼠事件穿透畫布，才能操作後方的 iframe
  cnv.style('z-index', '1');           // 確保畫布在 iframe 上層
  
  // 消除預設邊距並隱藏網頁本身的捲軸 (交由 iframe 內部獨立捲動)
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';

  // 動態建立 iframe 作為底層的背景網站
  let iframe = document.createElement('iframe');
  iframe.src = 'https://www.et.tku.edu.tw';
  iframe.style.position = 'absolute';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '100vw';
  iframe.style.height = '100vh';
  iframe.style.zIndex = '0'; // 確保 iframe 在畫布底層
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  let numGrasses = 50;
  
  for (let i = 0; i < numGrasses; i++) {
    let c = color(random(colors));
    c.setAlpha(random(80, 160)); // 調低透明度 (80~160)，讓水草重疊時的透明海草效果更佳明顯
    
    grasses.push({
      x: random(width),                       // 允許隨機分佈與自然重疊
      color: c,                               // 替換為帶有透明度的顏色物件
      thickness: random(30, 60),              // 粗細介於 30 到 60 之間
      grassHeight: random(height * 0.2, height * 0.66), // 獨立的水草高度 (不超過視窗的 2/3)
      frequency: random(0.002, 0.015),        // 獨立的搖晃頻率
      noiseOffset: random(10000),             // 獨立的 noise 起點 (確保每根搖晃軌跡不同)
      swayDir: random() > 0.5 ? 1 : -1        // 隨機的搖晃方向
    });
  }
  
  let numBubbles = 30; // 設定畫面上同時存在的水泡數量
  for (let i = 0; i < numBubbles; i++) {
    let b = {};
    resetBubble(b);
    b.y = random(height, height + 200); // 初始時隨機散佈在畫面下方
    bubbles.push(b);
  }
}

function draw() {
  clear(); // 每幀先清除畫布，避免半透明背景不斷疊加變成不透明
  background('rgba(202, 240, 248, 0.2)'); // 將原本的 #caf0f8 轉換為 RGBA 並設定 0.2 透明度
  blendMode(BLEND); // 明確設定 BLEND 混合模式，使半透明的顏色自然重疊
  
  noFill();
  
  for (let i = 0; i < grasses.length; i++) {
    let g = grasses[i];
    stroke(g.color); // 套用該小草專屬的隨機顏色
    strokeWeight(g.thickness); // 套用專屬粗細
    
    beginShape();
    // 利用視窗高度減去水草高度，計算出水草的頂端座標 (topY)
    let topY = height - g.grassHeight;
    
    for (let y = height; y > topY; y -= 10) {
      let distanceFromBottom = height - y; // 這裡相當於你提到的 i
      // 利用 map 與 true 限制 0~50 之間的 deltaFactor 為 0~1，讓底部移動較慢
      let deltaFactor = map(distanceFromBottom, 0, 50, 0, 1, true);
      // 結合水草獨立的 noiseOffset 讓每根搖晃軌跡不同
      let deltaX = deltaFactor * (noise(g.noiseOffset + distanceFromBottom / 400 + frameCount / 100) - 0.5) * 200 * g.swayDir;
      
      curveVertex(g.x + deltaX, y);
    }
    endShape();
  }
  
  // 水泡繪製與邏輯
  for (let i = 0; i < bubbles.length; i++) {
    let b = bubbles[i];
    
    if (!b.isPopping) {
      // 水泡往上升，並加上微微的左右搖晃感
      b.y -= b.speed;
      b.x += sin(frameCount * 0.05 + b.wobble) * 1;
      
      // 畫水泡主體 (白色，透明度 0.5)
      noStroke();
      fill('rgba(255, 255, 255, 0.5)');
      circle(b.x, b.y, b.size);
      
      // 畫水泡上的反光小圓圈 (白色，透明度 0.7)
      fill('rgba(255, 255, 255, 0.7)');
      circle(b.x - b.size * 0.2, b.y - b.size * 0.2, b.size * 0.4);
      
      // 判斷是否到達破掉的高度
      if (b.y < b.popHeight) {
        b.isPopping = true;
        popSound.play(); // 播放泡泡破裂音效
      }
    } else {
      // 破裂特效：產生一個擴散且淡出的圓圈
      noFill();
      stroke(`rgba(255, 255, 255, ${b.popAlpha})`);
      strokeWeight(2);
      circle(b.x, b.y, b.popRadius);
      
      b.popRadius += 2;      // 破裂的圈圈變大
      b.popAlpha -= 0.03;    // 透明度逐漸消失
      
      // 特效結束後，重置水泡回到畫面底部
      if (b.popAlpha <= 0) {
        resetBubble(b);
      }
    }
  }
}

// 用來重置水泡屬性的獨立函式
function resetBubble(b) {
  b.x = random(width);
  b.y = height + random(20, 100);         // 從視窗底部以下開始往上浮
  b.size = random(10, 25);                // 水泡大小
  b.speed = random(1, 3);                 // 上升速度
  b.wobble = random(1000);                // 獨立的左右搖晃起點
  b.popHeight = random(50, height * 0.7); // 隨機決定水泡到達哪個高度時會破掉
  b.isPopping = false;                    // 是否正在破裂
  b.popRadius = b.size;                   // 破裂擴散圈的初始大小
  b.popAlpha = 0.5;                       // 破裂擴散圈的初始透明度
}
