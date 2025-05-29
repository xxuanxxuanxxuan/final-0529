// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let words = ["Elephant", "Kangaroo", "Rabbit", "Mango", "Guava", "Banana"]; // 新增 Elephant
let wordPositions = [];
let grabbedWordIndex = -1; // 紀錄被抓取的單字卡索引
let lockedWords = new Set(); // 紀錄已鎖定的單字卡索引
let score = 0; // 成績變數

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('sketch-holder'); // 將畫布附加到指定容器
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // 隨機排列單字
  words = shuffle(words); // 每次遊戲開始時打亂單字順序

  // 初始化單字卡位置，排列在畫面上方的 1/3 區域，增加間距
  let spacing = width / (words.length + 1);
  wordPositions = []; // 清空並重新初始化
  for (let i = 0; i < words.length; i++) {
    wordPositions.push({
      x: spacing * (i + 1),
      y: height / 6, // 畫面上方的 1/3 區域
    });
  }

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0); // 使用鏡頭畫面作為背景

  // 顯示成績欄位
  fill(255, 239, 213, 200); // 淺橘色背景，透明度 200
  stroke(255, 140, 0); // 深橘色邊框
  strokeWeight(2);
  rect(5, 5, 140, 40, 10); // 圓弧方框，圓角半徑為 10

  fill(0);
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  text(`成績: ${score} / 30`, 75, 25); // 成績文字置中

  // 計算左右區塊的範圍，固定框的位置
  let padding = 20; // 與邊框的距離
  let blockWidth = width / 2.5 - padding; // 區塊寬度
  let blockHeight = (2 * height) / 3; // 區塊高度
  let blockTop = height / 3; // 固定區塊的垂直位置

  let leftBlock = { x: padding, y: blockTop, w: blockWidth, h: blockHeight };
  let rightBlock = { x: width - blockWidth - padding, y: blockTop, w: blockWidth, h: blockHeight };

  // 繪製左側區塊
  fill(186, 85, 211, 80); // 柔和紫色區塊，透明度 80
  noStroke();
  rect(leftBlock.x, leftBlock.y, leftBlock.w, leftBlock.h);

  // 繪製右側區塊
  fill(144, 238, 144, 80); // 柔和綠色區塊，透明度 80
  rect(rightBlock.x, rightBlock.y, rightBlock.w, rightBlock.h);

  // 標示區塊文字
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(36); // 放大文字
  let leftTextX = leftBlock.x + leftBlock.w / 2;
  let leftTextY = leftBlock.y + leftBlock.h / 2;
  let rightTextX = rightBlock.x + rightBlock.w / 2;
  let rightTextY = rightBlock.y + rightBlock.h / 2;
  text("動物", leftTextX, leftTextY); // 左側文字
  text("水果", rightTextX, rightTextY); // 右側文字

  // 繪製單字卡
  score = 0; // 每次繪製時重新計算成績
  for (let i = 0; i < words.length; i++) {
    let pos = wordPositions[i];
    let color = 255; // 預設為白色
    let isCorrect = false; // 判斷是否放到正確區塊

    // 自動偵測單字是否放到正確或錯誤的區塊
    if (["Elephant", "Kangaroo", "Rabbit"].includes(words[i])) {
      // 檢查是否碰到左側文字
      if (dist(pos.x, pos.y, leftTextX, leftTextY) < 50) {
        color = [0, 255, 0]; // 綠色表示正確
        isCorrect = true;
      }
      // 檢查是否碰到右側文字
      else if (dist(pos.x, pos.y, rightTextX, rightTextY) < 50) {
        color = [255, 0, 0]; // 紅色表示錯誤
      }
    } else if (["Mango", "Guava", "Banana"].includes(words[i])) {
      // 檢查是否碰到右側文字
      if (dist(pos.x, pos.y, rightTextX, rightTextY) < 50) {
        color = [0, 255, 0]; // 綠色表示正確
        isCorrect = true;
      }
      // 檢查是否碰到左側文字
      else if (dist(pos.x, pos.y, leftTextX, leftTextY) < 50) {
        color = [255, 0, 0]; // 紅色表示錯誤
      }
    }

    // 如果單字卡正確，增加分數
    if (isCorrect) {
      score += 5;
    }

    // 根據檢測結果繪製單字卡
    fill(color);
    stroke(0);
    rect(pos.x - 40, pos.y - 20, 80, 40, 10); // 繪製單字卡

    // 繪製單字文字
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(14);
    text(words[i], pos.x, pos.y);
  }

  // 如果所有單字卡都已放置，根據得分顯示覆蓋畫面
  if (lockedWords.size === words.length) {
    if (score <= 15) {
      fill(255, 182, 193, 200); // 淺粉色背景，透明度 200
      rect(0, 0, width, height); // 覆蓋整個畫面

      fill(0);
      textSize(56); // 增加字體大小
      textAlign(CENTER, CENTER);
      text("再加油 💪", width / 2, height / 2); // 顯示文字和表情符號
    } else if (score <= 25) {
      fill(173, 216, 230, 200); // 淺藍色背景，透明度 200
      rect(0, 0, width, height); // 覆蓋整個畫面

      fill(0);
      textSize(56); // 增加字體大小
      textAlign(CENTER, CENTER);
      text("你很棒了 🌟", width / 2, height / 2); // 顯示文字和表情符號
    } else if (score === 30) {
      fill(144, 238, 144, 200); // 淺綠色背景，透明度 200
      rect(0, 0, width, height); // 覆蓋整個畫面

      fill(0);
      textSize(56); // 增加字體大小
      textAlign(CENTER, CENTER);
      text("恭喜你得滿分 🎉", width / 2, height / 2); // 顯示文字和表情符號
    }
  }

  // 確認是否有手部偵測到
  if (hands.length > 0) {
    let hand = hands[0]; // 使用第一隻手
    let indexFinger = hand.keypoints.find(kp => kp.name === "index_finger_tip"); // 找到食指尖端

    if (indexFinger) {
      fill(0, 255, 0);
      noStroke();
      circle(indexFinger.x, indexFinger.y, 20); // 繪製食指尖端位置

      // 如果正在抓取單字卡，更新單字卡位置
      if (grabbedWordIndex !== -1 && !lockedWords.has(grabbedWordIndex)) {
        wordPositions[grabbedWordIndex].x = indexFinger.x;
        wordPositions[grabbedWordIndex].y = indexFinger.y;

        // 檢查是否碰到左側或右側文字
        let pos = wordPositions[grabbedWordIndex];
        if (dist(pos.x, pos.y, leftTextX, leftTextY) < 50 || dist(pos.x, pos.y, rightTextX, rightTextY) < 50) {
          lockedWords.add(grabbedWordIndex); // 鎖定單字卡
          grabbedWordIndex = -1; // 釋放抓取
        }
      } else {
        // 檢查食指是否接觸到單字卡
        for (let i = 0; i < wordPositions.length; i++) {
          if (lockedWords.has(i)) continue; // 跳過已鎖定的單字卡
          let pos = wordPositions[i];
          if (
            indexFinger.x > pos.x - 40 &&
            indexFinger.x < pos.x + 40 &&
            indexFinger.y > pos.y - 20 &&
            indexFinger.y < pos.y + 20
          ) {
            grabbedWordIndex = i; // 抓取單字卡
            break;
          }
        }
      }
    }
  } else {
    grabbedWordIndex = -1; // 如果沒有手部偵測，釋放抓取
  }

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }
      }
    }
  }
}
