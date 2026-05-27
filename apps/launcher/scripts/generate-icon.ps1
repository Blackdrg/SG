$signature = @"
public static System.Drawing.Icon CreateIcon()
{
    var bitmap = new System.Drawing.Bitmap(256, 256);
    using var g = System.Drawing.Graphics.FromImage(bitmap);
    using var brush = new System.Drawing.Drawing2D.LinearGradientBrush(
        new System.Drawing.Rectangle(0, 0, 256, 256),
        System.Drawing.Color.FromArgb(16, 185, 129),
        System.Drawing.Color.FromArgb(5, 150, 112),
        System.Drawing.Drawing2D.LinearGradientMode.Vertical
    );
    g.FillRectangle(brush, 0, 0, 256, 256);
    using var font = new System.Drawing.Font("Arial", 100, System.Drawing.FontStyle.Bold);
    using var sf = new System.Drawing.StringFormat { Alignment = System.Drawing.StringAlignment.Center, LineAlignment = System.Drawing.StringAlignment.Center };
    g.DrawString("SG", font, System.Drawing.Brushes.White, new System.Drawing.RectangleF(0, 60, 256, 120), sf);
    bitmap.Save("$env:USERPROFILE\Desktop\icon.ico", System.Drawing.Imaging.ImageFormat.Icon);
}
"@

Add-Type -TypeDefinition $signature
[IconCreator]::CreateIcon()