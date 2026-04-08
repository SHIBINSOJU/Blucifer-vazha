const { createCanvas, loadImage } = require('canvas');
const path = require('path');

module.exports = async (member) => {
    const canvas = createCanvas(1024, 450);
    const ctx = canvas.getContext('2d');

    // ===== BACKGROUND =====
    const bg = await loadImage(path.join(__dirname, '../assets/bg.png'));
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);

    // ===== AVATAR (PERFECTLY FIT INSIDE CIRCLE) =====
    const avatarSize = 170;

    // 🔥 tuned for YOUR background
    const avatarX = 95;
    const avatarY = 95;

    ctx.save();
    ctx.beginPath();
    ctx.arc(
        avatarX + avatarSize / 2,
        avatarY + avatarSize / 2,
        avatarSize / 2,
        0,
        Math.PI * 2
    );
    ctx.closePath();
    ctx.clip();

    const avatar = await loadImage(
        member.user.displayAvatarURL({ extension: 'png', size: 512 })
    );
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // ===== USERNAME (CENTERED IN BAR) =====
    let username = member.user.username;

    // ✂️ Trim long names
    if (username.length > 16) {
        username = username.substring(0, 14) + '...';
    }

    ctx.font = '26px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';

    const usernameX = avatarX + avatarSize / 2;
    const usernameY = avatarY + avatarSize + 55;

    // Shadow for readability on bright bg
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;

    ctx.fillText(username, usernameX, usernameY);

    // reset shadow
    ctx.shadowBlur = 0;

    return canvas.toBuffer();
};
