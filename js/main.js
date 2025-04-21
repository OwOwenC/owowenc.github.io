"use strict";

//初始化背景
window.$ = selector => document.querySelector(selector);
const getOriginalContent = selector => $(selector).getAttribute("original-content");
window.subtitle = getOriginalContent(".content-subtitle");
window.config = {
  SIM_RESOLUTION: 128,
  DYE_RESOLUTION: 1024,
  CAPTURE_RESOLUTION: 512,
  DENSITY_DISSIPATION: 1,
  VELOCITY_DISSIPATION: 0.2,
  PRESSURE: 0.8,
  PRESSURE_ITERATIONS: 20,
  CURL: 30,
  SPLAT_RADIUS: 0.25,
  SPLAT_FORCE: 6000,
  SHADING: true,
  COLORFUL: true,
  COLOR_UPDATE_SPEED: 10,
  PAUSED: false,
  BACK_COLOR: { r: 30, g: 30, b: 30 },
  TRANSPARENT: false,
  BLOOM: false,
  BLOOM_ITERATIONS: 8,
  BLOOM_RESOLUTION: 256,
  BLOOM_INTENSITY: 0.2,
  BLOOM_THRESHOLD: 0.6,
  BLOOM_SOFT_KNEE: 0.7,
  SUNRAYS: true,
  SUNRAYS_RESOLUTION: 196,
  SUNRAYS_WEIGHT: 1.0,
}

// 将类数组对象转换为数组
function _arrayLikeToArray(arr, len) {
  if (arr == null) return;
  if (len == null || len > arr.length) len = arr.length;
  var arr2 = new Array(len);
  for (var i = 0; i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}

// 如果是数组，则直接转换为数组
function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

// 如果对象可迭代，则转换为数组
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null) {
    return Array.from(iter);
  }
}

// 针对不支持迭代的对象进行转换
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

// 抛出错误提示不可迭代
function _nonIterableSpread() {
  throw new TypeError(
    "Invalid attempt to spread non-iterable instance.\n" +
      "In order to be iterable, non-array objects must have a [Symbol.iterator]() method."
  );
}

// 综合各种方式将对象转换为数组
function _toConsumableArray(arr) {
  return (
    _arrayWithoutHoles(arr) ||
    _iterableToArray(arr) ||
    _unsupportedIterableToArray(arr) ||
    _nonIterableSpread()
  );
}

// ----------------------
// 主逻辑函数
// ----------------------

// 根据起始和结束坐标计算移动方向（仅在手机端生效）
function getMoveDirection(xStart, yStart, xEnd, yEnd) {
  if (isPhone) {
    var dx = xEnd - xStart;
    var dy = yEnd - yStart;
    // 如果移动幅度极小，视为未定方向
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) return DIRECTIONS.UNDIRECTED;
    // 计算角度，单位为度
    var angle = (180 * Math.atan2(dy, dx)) / Math.PI;
    if (angle >= -135 && angle <= -45) {
      return DIRECTIONS.UP;
    } else if (angle > 45 && angle < 135) {
      return DIRECTIONS.DOWN;
    } else if ((angle >= 135 && angle <= 180) || (angle >= -180 && angle < -135)) {
      return DIRECTIONS.LEFT;
    } else if (angle >= -45 && angle <= 45) {
      return DIRECTIONS.RIGHT;
    } else {
      return DIRECTIONS.UNDIRECTED;
    }
  }
}


// 加载 Intro 动画
function loadIntro() {
  // 如果页面当前处于隐藏状态或者已加载过 intro，则不再执行
  if (document[hiddenProperty] || loadIntro.loaded) return;
  setTimeout(function () {
    $(".wrap").classList.add("in");
    setTimeout(function () {
      $(".content-subtitle").innerHTML =
        "<span>" + _toConsumableArray(subtitle).join("</span><span>") + "</span>";
    }, 270);
  }, 0);
  loadIntro.loaded = true;
}



// 切换页面动画（从 Intro 到 Main） （enter部分）
function switchPage() {
  if (!switchPage.switched) {
    var elements = {
      intro: $(".content-intro"),
    };
  }
}

// ----------------------
// 全局变量与事件绑定
// ----------------------

// 定义页面隐藏属性，兼容不同浏览器
window.hiddenProperty =
  "hidden" in document
    ? "hidden"
    : "webkitHidden" in document
    ? "webkitHidden"
    : "mozHidden" in document
    ? "mozHidden"
    : null;

// 定义方向常量
window.DIRECTIONS = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  UNDIRECTED: "UNDIRECTED",
};

// 判断是否为手机设备
window.isPhone = /Mobile|Android|iOS|iPhone|iPad|iPod|Windows Phone|KFAPWI/i.test(
  navigator.userAgent
);

// 定义页面可见性变化事件
window.visibilityChangeEvent = hiddenProperty.replace(/hidden/i, "visibilitychange");
window.addEventListener(visibilityChangeEvent, loadIntro);
window.addEventListener("DOMContentLoaded", loadIntro);


// 手机端手势监听
if (isPhone) {
  document.addEventListener(
    "touchstart",
    function (e) {
      window.startx = e.touches[0].pageX;
      window.starty = e.touches[0].pageY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    function (e) {
      var endX = e.changedTouches[0].pageX;
      var endY = e.changedTouches[0].pageY;
      if (getMoveDirection(startx, starty, endX, endY) === DIRECTIONS.UP) {
        loadAll();
      }
    },
    { passive: true }
  );
}




// 页面切换

var isAnimating = false;

function scrollToPage(pageIndex) {
  if (isAnimating || pageIndex < 0 || pageIndex >= totalPages) return;
  isAnimating = true;
  anime({
    targets: pagesContainer,
    translateY: -pageIndex * window.innerHeight,
    duration: 1100,
    easing: "easeInOutSine",
    complete: function() {
      isAnimating = false;
    }
  });
  currentPage = pageIndex;
}

document.addEventListener('DOMContentLoaded', function() {
  // 页面切换动画逻辑：通过动画改变 .pages-container 的 translateY 实现上下滚动
  var pagesContainer = document.querySelector('.pages-container');
  var currentPage = 0;
  var pages = document.querySelectorAll('.page');
  var totalPages = pages.length;
  
  function scrollToPage(pageIndex) {
    if (pageIndex < 0 || pageIndex >= totalPages) return;
    anime({
      targets: pagesContainer,
      translateY: -pageIndex * window.innerHeight,
      duration: 1100,
      easing: "easeInOutSine"
    });
    currentPage = pageIndex;
  }
  
  // 导航栏点击事件，点击时根据链接跳转到对应页面
  document.querySelectorAll('nav .navbar li a').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      var target = this.getAttribute('href').replace('#', '');
      var index = 0;
      switch(target) {
        case 'home': index = 0; break;
        case 'about': index = 1; break;
        case 'project': index = 2; break;
        case 'resume': index = 3; break;
        case 'contact': index = 4; break;
        default: index = 0;
      }
      scrollToPage(index);
    });
  });
  
  // 首页“进入个人介绍”按钮绑定：点击后跳转到第二页
  var enterBtn = document.getElementById('enterBtn');
  if (enterBtn) {
    enterBtn.addEventListener('click', function() {
      scrollToPage(1);
    });
  }
  
  // 监听鼠标滚轮事件，向上向下滚动时切换页面
  window.addEventListener('wheel', function(e) {
    if (e.deltaY > 0 && currentPage < totalPages - 1) {
      scrollToPage(currentPage + 1);
    } else if (e.deltaY < 0 && currentPage > 0) {
      scrollToPage(currentPage - 1);
    }
  });
  
  // 语言切换函数（示例代码）
  window.switchLanguage = function(lang) {
    if (lang === 'zh') {
      alert('切换到中文');
      // 添加实际中文切换逻辑
    } else if (lang === 'en') {
      alert('Switched to English');
      // 添加实际英文切换逻辑
    }
  }
});

  // 点击 WeChat 或 QQ 图标时，切换对应二维码的显示状态
  function showQR(type) {
    // 获取这两个二维码元素
    const wechatQR = document.getElementById('qr-wechat');
    const qqQR = document.getElementById('qr-qq');

    // 如果点击 WeChat，就显示 wechatQR，隐藏 qqQR
    // 如果点击 QQ，就显示 qqQR，隐藏 wechatQR
    if (type === 'wechat') {
      wechatQR.style.display = 'block';
      qqQR.style.display = 'none';
    } else if (type === 'qq') {
      wechatQR.style.display = 'none';
      qqQR.style.display = 'block';
    }
  }


// js/main.js
"use strict";
// …（前面的通用动画、intro、页面切换等代码保持不变）…

// Project 部分逻辑
function getStyle(obj, attr) {
  return obj.currentStyle ? obj.currentStyle[attr] : window.getComputedStyle(obj, null)[attr];
}
function animate(obj, json, fn) {
  clearInterval(obj.timer);
  obj.timer = setInterval(function(){
    var done = true;
    for (var k in json) {
      var leader = k === 'opacity'
        ? parseInt((getStyle(obj,k)||1)*100)
        : parseInt(getStyle(obj,k)) || 0;
      var step = (json[k] - leader) / 10;
      step = step>0 ? Math.ceil(step) : Math.floor(step);
      leader += step;
      if (k === 'opacity') {
        obj.style.opacity = leader/100;
        obj.style.filter = 'alpha(opacity=' + leader + ')';
      } else if (k === 'zIndex') {
        obj.style.zIndex = json[k];
      } else {
        obj.style[k] = leader + 'px';
      }
      if (leader !== json[k]) done = false;
    }
    if (done) {
      clearInterval(obj.timer);
      fn && fn();
    }
  }, 10);
}

window.onload = function(){
  // 三个位置
  var size = [
    {top:20, left:0,   width:400, height:300, zIndex:1, opacity:40},
    {top:0,  left:300, width:600, height:360, zIndex:3, opacity:100},
    {top:20, left:800, width:400, height:300, zIndex:1, opacity:40}
  ];
  var activeCount = size.length;
  var pj_c_wrap = document.getElementById("pj_card_wrap");
  var PJcontentUl = pj_c_wrap.getElementsByClassName("project_content")[0];
  var liArr = PJcontentUl.children;
  var flag = true;
  var speed = 7000;
  var currentIndex = 0;

  // 初始显示
  updateSlides(true);

  // 绑定左右按钮
  var prevBtn = pj_c_wrap.querySelector('.prev');
  var nextBtn = pj_c_wrap.querySelector('.next');
  prevBtn.onclick = function(){ if(flag) move(false); };
  nextBtn.onclick = function(){ if(flag) move(true); };

  // 鼠标移入/移出
  pj_c_wrap.onmouseover = function(){
    prevBtn.style.display = nextBtn.style.display = "block";
    clearInterval(pj_c_wrap.timer);
  };
  pj_c_wrap.onmouseout = function(){
    prevBtn.style.display = nextBtn.style.display = "none";
    pj_c_wrap.timer = setInterval(function(){ move(true); }, speed);
  };
  // 自动轮播
  pj_c_wrap.timer = setInterval(function(){ move(true); }, speed);

  // 更新幻灯片显示
  function updateSlides(noAnimate){
    for(var i=0;i<liArr.length;i++){
      liArr[i].style.display = "none";
    }
    for(var j=0;j<activeCount;j++){
      var idx = (currentIndex + j) % liArr.length;
      var el = liArr[idx];
      el.style.display = "block";
      if(noAnimate){
        el.style.top    = size[j].top + "px";
        el.style.left   = size[j].left + "px";
        el.style.width  = size[j].width + "px";
        el.style.height = size[j].height + "px";
        el.style.zIndex = size[j].zIndex;
        el.style.opacity= size[j].opacity/100;
      } else {
        animate(el, size[j], function(){ flag = true; });
      }
    }
  }
  // 切换下一张/上一张
  function move(next){
    if(!flag) return;
    flag = false;
    currentIndex = next
      ? (currentIndex + 1) % liArr.length
      : (currentIndex - 1 + liArr.length) % liArr.length;
    updateSlides();
  }
};

document.addEventListener('DOMContentLoaded', function () {

  // 新增：处理带锚点跳转（如 index.html#resume）
  const hash = window.location.hash;
  if (hash) {
    const target = hash.replace('#', '');
    const indexMap = {
      home: 0,
      about: 1,
      project: 2,
      resume: 3,
      contact: 4
    };
    if (indexMap[target] !== undefined) {
      scrollToPage(indexMap[target]);
    }
  }
});
