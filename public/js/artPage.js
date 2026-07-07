import json from './json.js';

let finalPieceImgColumn, sketchImgColumn;
let jsonData;

window['art'] = async function init(params){
    finalPieceImgColumn = document.getElementById("finalPieceImgColumn");
    sketchImgColumn = document.getElementById("sketchImgColumn");

    sketchImgColumn.style.display = "none";

    const categorySectionA = document.querySelectorAll(".category-section a");

    categorySectionA.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            switch (link.dataset.type) 
            {
                case "FinalPiece":
                    finalPieceImgColumn.style.display = "contents";
                    sketchImgColumn.style.display = "none";
                    break;
                case "Sketch":
                    sketchImgColumn.style.display = "contents";
                    finalPieceImgColumn.style.display = "none";
                    break;
            } 
        });
    });

    await getLoadImages();

    /* --------- 查看图片 --------- */
    const thumbnails = document.querySelectorAll('.card img');
    
    const overlay = document.createElement('div');
    overlay.className = 'lightbox-overlay';
    const closeLightboxBtn = document.createElement('button');
    closeLightboxBtn.className = 'lightbox-closeButton';
    closeLightboxBtn.innerHTML = `<img src="src/img/Theme/1/UI/close-icon.png" class="play-icon" id="playIcon" width="100px" height="100px"></img>`;
    const img = document.createElement('img');
    img.className = 'lightbox-image';
    overlay.appendChild(closeLightboxBtn);
    overlay.appendChild(img);
    document.getElementById("artPage").appendChild(overlay);

    // 打开灯箱
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function(e) {
            e.stopPropagation();
            const largeSrc = this.dataset.large || this.src; // 获取大图地址
            img.src = largeSrc;
            overlay.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // 禁止背景滚动
        });
    });

    // 关闭灯箱（点击遮罩或按ESC键）
    function closeLightbox() {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        currentScale = 1;
        translateX = 0, translateY = 0;
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
    closeLightboxBtn.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeLightbox();
    });

    /* --------- 缩放图片 --------- */
    let currentScale = 1;
    const MIN_SCALE = 0.5;
    const MAX_SCALE = 3;
    const SCALE_STEP = 0.1; // 每次滚动变化量
    let translateX = 0, translateY = 0; // 用于平移偏移

    img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;

    overlay.addEventListener('wheel', function(e) {
        e.preventDefault();

        const rect = img.getBoundingClientRect();
        // 鼠标相对于图片左上角的位置（百分比）
        const mouseX = (e.clientX - rect.left) / rect.width;
        const mouseY = (e.clientY - rect.top) / rect.height;
        
        const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP;
        let newScale = currentScale + delta;
        newScale = Math.min(Math.max(newScale, MIN_SCALE), MAX_SCALE);
        
        if (newScale !== currentScale) {
            // 计算缩放前后鼠标位置对应的偏移变化
            const scaleRatio = newScale / currentScale;
            // 偏移量 = 鼠标位置偏移（因为原点移动）
            // 我们需要保持鼠标指向的图片点不变
            // 原理：translate += (mouseX * imgSize) * (1 - scaleRatio)
            const imgWidth = rect.width;
            const imgHeight = rect.height;
            // 这里的偏移是在缩放后的坐标系中，需要累加到当前偏移
            translateX += (mouseX * imgWidth) * (1 - scaleRatio);
            translateY += (mouseY * imgHeight) * (1 - scaleRatio);
            
            currentScale = newScale;
            // 同时应用缩放和平移
            img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
            // 注意：transform-origin 需保持默认 (0 0) 或设为中心
        }
    }, { passive: false });

    /* --------- 拖拽平移 --------- */
    let isDragging = false;
    let startX = 0, startY = 0;      // 鼠标按下时的坐标
    let originX = 0, originY = 0;    // 按下时的图片偏移值

    overlay.addEventListener('mousedown', function(e) {
      if (e.button !== 0) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      originX = translateX;
      originY = translateY;
      img.classList.add('dragging');
      img.style.cursor = 'grabbing';
      e.preventDefault();
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // 新偏移 = 原偏移 + 鼠标移动量
      translateX = originX + dx;
      translateY = originY + dy;
      applyTransform();
    });

    window.addEventListener('mouseup', function(e) {
      if (isDragging) {
        isDragging = false;
        img.classList.remove('dragging');
        img.style.cursor = 'grab';
      }
    });

    function applyTransform() {
      img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    }
}

async function getLoadImages()
{
    jsonData = await json.loadJsonFromUrl(`./src/art/data.json`);
    sketchImgColumn.innerHTML = "";
    finalPieceImgColumn.innerHTML = "";

    for (var i=0; i<jsonData.length; i++)
    {
        const htmlString = `
            <button class="card">
                <div class="card-cover">
                    <img src="./src/art/${jsonData[i]["imgPath"]}" alt="cover">
                </div>
                <div class="card-info">
                    <p class="card-title">${jsonData[i]["title"]}</p>
                    <p class="card-author">${jsonData[i]["author"]}</p>
                    <p class="card-date">${jsonData[i]["date"]}</p>
                </div>
            </button>
        `;

        switch (jsonData[i]["Type"]) 
        {
            case "FinalPiece":
                finalPieceImgColumn.insertAdjacentHTML('beforeend', htmlString);
                break;
            case "Sketch":
                sketchImgColumn.insertAdjacentHTML('beforeend', htmlString);
                break;
        } 
    }

}