let inputField;
let sizeSlider; // 新增滑桿變數
let colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']; // 定義色票陣列
let jumpButton; // 新增跳動按鈕變數
let isJumping = false; // 控制是否跳動的狀態變數

function setup() {
  // 建立全螢幕畫布
  createCanvas(windowWidth, windowHeight);

  // 產生文字輸入框並設定初始位置與預設文字
  inputField = createInput('💕🎶😒淡江大學 ');
  inputField.position(20, 20);
  inputField.size(300); // 增加輸入框的寬度
  inputField.style('font-size', '30px'); // 放大輸入框內的文字
  inputField.style('padding', '10px'); // 增加內距，讓整個輸入框變大
  inputField.style('background-color', 'pink'); // 將輸入框背景顏色改為粉紅色

  // 產生文字大小滑桿，範圍 15 到 80，預設值為 50
  sizeSlider = createSlider(15, 80, 50);
  
  // 設定滑桿位置：
  // X: 輸入框X(20) + 內容寬(300) + 左右內距(20) + 距離(20) = 360
  // Y: 輸入框Y(20) + 框高的一半(約25) - 滑桿高度的一半(約10) = 35 (達成垂直置中)
  sizeSlider.position(360, 35);

  // 產生跳動開關按鈕
  jumpButton = createButton('跳動開關');
  // 設定按鈕位置：
  // X: 滑桿X(360) + 滑桿預設寬度(約130) + 距離(20) = 510
  // Y: 與滑桿相同高度(35)
  jumpButton.position(510, 35);
  jumpButton.mousePressed(toggleJump); // 綁定點擊事件，按下時執行 toggleJump

  // 設定對齊方式 (對齊垂直置中)
  textAlign(LEFT, CENTER);

  // 產生一個置中的 DIV，與視窗四周距離 200px
  let iframeDiv = createDiv();
  iframeDiv.style('position', 'absolute');
  iframeDiv.style('top', '200px');
  iframeDiv.style('bottom', '200px');
  iframeDiv.style('left', '200px');
  iframeDiv.style('right', '200px');
  iframeDiv.style('z-index', '999'); // 確保網頁區塊顯示在最上層，不被畫布蓋住
  iframeDiv.style('opacity', '0.95'); // 設定透明度為 95%

  // 在 DIV 內建立 iframe 以載入指定網頁
  let webIframe = createElement('iframe');
  webIframe.attribute('src', 'https://www.et.tku.edu.tw');
  webIframe.style('width', '100%');
  webIframe.style('height', '100%');
  webIframe.style('border', 'none'); // 移除 iframe 的預設邊框
  webIframe.parent(iframeDiv); // 將 iframe 放入 div 內

  // 產生網頁下拉式選單
  let siteSelect = createSelect();
  // 設定選單位置：按鈕 X(510) + 按鈕預設寬度(約90) + 距離(20) = 620
  siteSelect.position(620, 35);
  siteSelect.option('淡江大學', 'https://www.tku.edu.tw');
  siteSelect.option('淡江教科系', 'https://www.et.tku.edu.tw');
  siteSelect.selected('https://www.et.tku.edu.tw'); // 將預設選項設為教科系，以符合 iframe 的初始網頁
  
  // 當選單選項改變時，更新 iframe 的 src 網址
  siteSelect.changed(() => {
    webIframe.attribute('src', siteSelect.value());
  });
}

// 切換跳動狀態的函式
function toggleJump() {
  isJumping = !isJumping; 
}

function draw() {
  background(220); // 每次重繪背景，清除上一幀

  let txt = inputField.value(); // 取得目前的輸入內容
  if (txt === '') return; // 如果輸入為空，則不繪製

  let currentSize = sizeSlider.value(); // 取得滑桿目前的數值
  textSize(currentSize); // 動態更新文字大小

  // 計算字串寬度，並加上 20px 的間距避免文字完全黏在一起
  let spacing = textWidth(txt) + 20; 

  // 設定排與排間的垂直間距固定為 50px
  let ySpacing = 50;

  // 從座標 y = 100 開始產生文字
  let startY = 100;
  for (let y = startY; y < height + ySpacing; y += ySpacing) {
    let colIndex = 0; // 每一行開始時重置顏色索引，讓每行都從第一個顏色開始
    for (let x = 0; x < width; x += spacing) {
      fill(colors[colIndex % colors.length]); // 依序從色票中取出顏色套用
      
      let offsetX = 0;
      let offsetY = 0;
      if (isJumping) {
        // 隨著時間 (frameCount) 與位置 (x, y) 產生不同的左右與上下跳動
        offsetX = sin(frameCount * 0.1 + x * 0.01 + y * 0.02) * 15;
        offsetY = cos(frameCount * 0.1 + x * 0.02 + y * 0.01) * 15;
      }
      
      text(txt, x + offsetX, y + offsetY);
      colIndex++; // 切換到下一個顏色
    }
  }
}

function windowResized() {
  // 當視窗大小改變時，重新調整畫布大小以維持全螢幕
  resizeCanvas(windowWidth, windowHeight);
}