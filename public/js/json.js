export async function loadJsonFromUrl(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('请求失败');
    const data = await response.json();
    return data;
}

export default {
    loadJsonFromUrl
};