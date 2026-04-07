const { createCanvas, loadImage, registerFont } = require('canvas');
const path = require('path');

// Optional: add minecraft font later
// registerFont(path.join(__dirname, '../assets/minecraft.ttf'), { family: 'Minecraft' });

module.exports = async (member) => {
    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    // Background
    const bg = await loadImage(path.join(__dirname, '../assets/bg.png'));
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // ===== AVATAR SETTINGS =====
    const avatarSize = 180;
    const avatarX = 120;
    const avatarY = canvas.height / 2 - avatarSize / 2 - 30;

    // Draw avatar (circle)
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(member.user.displayAvatarURL({ extension: 'png', size: 512 }));
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // ===== USERNAME =====
    ctx.font = '28px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const usernameX = avatarX + avatarSize/2;
    const usernameY = avatarY + avatarSize + 50;

    ctx.fillText(member.user.username, usernameX, usernameY);

    // ===== RIGHT SIDE TEXT =====
    ctx.textAlign = 'left';

    // "WELCOME TO"
    ctx.font = '50px sans-serif';
    ctx.fillStyle = '#e5e7eb';
    ctx.fillText('WELCOME TO', 450, 180);

    // "ZeakMC"
    ctx.font = 'bold 80px sans-serif';

    // Glow effect
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 20;

    ctx.fillStyle = '#00ff88';
    ctx.fillText('ZeakMC', 450, 270);

    ctx.shadowBlur = 0;

    return canvas.toBuffer();
};
