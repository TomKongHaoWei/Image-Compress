// 配置参数
const MAX_WIDTH = 1200; // 限制图片最大宽度
const JPEG_QUALITY = 0.7; // JPEG 压缩质量 (0.0 - 1.0)

const fileInput = document.getElementById('fileInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusMessage = document.getElementById('statusMessage');
const sizeInfo = document.getElementById('sizeInfo');
const canvas = document.getElementById('imageCanvas');
const ctx = canvas.getContext('2d');

let compressedDataURL = null; // 存储压缩后的图片数据
let originalFileName = '';    // 存储原始文件名

// 步骤 1: 监听文件导入
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 重置状态
    downloadBtn.disabled = true;
    compressedDataURL = null;
    originalFileName = file.name.substring(0, file.name.lastIndexOf('.')) || 'compressed-image';
    statusMessage.textContent = '图片导入成功，正在进行压缩...';
    sizeInfo.textContent = `原始大小：${(file.size / 1024).toFixed(2)} KB`;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        statusMessage.textContent = '❌ 请导入有效的图片文件。';
        return;
    }

    // 使用 FileReader 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 步骤 2: 进行图片压缩
            compressImage(img, file.type);
        };
        img.onerror = () => {
            statusMessage.textContent = '❌ 图片加载失败。';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

/**
 * 使用 Canvas 进行图片尺寸调整和质量压缩
 * @param {HTMLImageElement} img - 加载的图片对象
 * @param {string} originalType - 原始文件的 MIME Type
 */
function compressImage(img, originalType) {
    let width = img.width;
    let height = img.height;

    // 1. 调整尺寸 (如果宽度超过限制)
    if (width > MAX_WIDTH) {
        height = Math.round(height * (MAX_WIDTH / width));
        width = MAX_WIDTH;
    }

    // 设置 Canvas 尺寸
    canvas.width = width;
    canvas.height = height;

    // 2. 绘制图片到 Canvas
    ctx.clearRect(0, 0, width, height); // 清除旧内容
    ctx.drawImage(img, 0, 0, width, height);

    // 3. 导出压缩后的数据 (使用 JPEG 格式和设定的质量)
    // 强制使用 'image/jpeg' 以利用质量参数进行体积减少
    compressedDataURL = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

    // 4. 更新状态
    const compressedSizeKB = (atob(compressedDataURL.split(',')[1]).length / 1024).toFixed(2);

    statusMessage.textContent = '✅ 图片压缩完成！';
    sizeInfo.textContent += ` | 压缩后大小：${compressedSizeKB} KB`;

    downloadBtn.disabled = false;
}

// 步骤 3: 监听下载按钮
downloadBtn.addEventListener('click', () => {
    if (!compressedDataURL) return;
    // 创建一个临时的 a 标签进行下载
    const a = document.createElement('a');
    a.href = compressedDataURL;
    // 设置下载文件名
    a.download = `${originalFileName}_compressed.jpeg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    statusMessage.textContent = '文件已开始下载。';
});

// 重置文件输入框，以便再次导入相同文件
fileInput.addEventListener('click', function () {
    this.value = null;
});