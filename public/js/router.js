const appElement = document.getElementById("app");
const navLinks = document.querySelectorAll("nav a");

const executedScripts = new Set();

let currentPage;

async function loadPage(route, params) {
    try {
        const res = await fetch(`pages/${route}.html`);

        if (!res.ok) {
            throw new Error(`${res.status}: ${res.statusText}`);
        }

        const html = await res.text();

        // 创建临时容器，将 HTML 放进去
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // 找出所有 script 标签（包括内联和外部）
        const scripts = temp.querySelectorAll('script');

        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');

            const scriptId = oldScript.src || script.textContent.trim();
            newScript.type ="module";

            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }

            newScript.onload = () => {
                const initFn = window[route];
                if (typeof initFn === 'function') initFn(params);
            };

            // 将新 script 追加到 document 中（head 或 body 均可）
            document.body.appendChild(newScript);
            document.body.removeChild(newScript);
        });

        // 最后将非 script 的内容插入到 app 容器
        appElement.innerHTML = '';
        while (temp.firstChild) {
            if (temp.firstChild.nodeType === Node.ELEMENT_NODE && temp.firstChild.tagName === 'SCRIPT') {
                temp.removeChild(temp.firstChild);
            } else {
                appElement.appendChild(temp.firstChild);
            }
        }
    } catch(e) {
        appElement.innerHTML = `
            <div class="Column">
                <h2 style="text-align: center;">${route}不存在</h2>
                <p>${e}</p>
            </div>
        `;
    }
}

// 提取查询参数对象
function getHashParams() {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return new URLSearchParams();
    const queryString = hash.slice(queryIndex + 1);   // 取得 ? 后面的字符串
    return new URLSearchParams(queryString);
}


navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        loadPage(route, getHashParams())
    });
});


function getRouteFromHash() {
    const hash = window.location.hash.slice(1); // 去掉 #
    return hash.split('?')[0] || 'home'; // 默认首页
}

// 初始化
window.addEventListener('DOMContentLoaded', () => {
    const route = getRouteFromHash();
    loadPage(route, getHashParams());
});

// 监听 hash 变化
window.addEventListener('hashchange', () => {
    const route = getRouteFromHash();
    loadPage(route, getHashParams());
});

// 拦截链接点击（改用 hash 链接）
document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"]');
    if (link) {
        e.preventDefault();
        const hash = link.getAttribute('href').slice(1);
        window.location.hash = hash; // 触发 hashchange
    }
});