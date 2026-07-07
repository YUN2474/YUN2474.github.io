document.addEventListener('mousemove', (e) => {
    // 将鼠标坐标归一化到 [-1, 1] 区间
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    const bgX = x * -15;
    const bgY = y * -15;
    document.getElementById('bgLayer').style.transform = 
    `translate(${bgX}px, ${bgY}px) scale(1.1)`;

    const bgX2 = x * -20;
    const bgY2 = y * -20;
    document.getElementById('bgLayer-2').style.transform = 
    `translate(${bgX2}px, ${bgY2}px) scale(1.1)`;

    const contentX = x * 5;
    const contentY = y * 5;
    document.getElementById('app').style.transform = 
    `translate(${contentX}px, ${contentY}px)`;
});