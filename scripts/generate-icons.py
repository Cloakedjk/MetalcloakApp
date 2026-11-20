"""Draw the placeholder MetalCloak mark. Not a copy of the company logo."""

from PIL import Image, ImageDraw, ImageFont

BG = (11, 12, 14, 255)
AMBER = (224, 122, 47, 255)
INK = (26, 16, 8, 255)
WHITE = (244, 241, 234, 255)
FONT = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"


def badge(size: int, fill, ink, background) -> Image.Image:
    image = Image.new("RGBA", (size, size), background)
    draw = ImageDraw.Draw(image)
    margin = int(size * 0.16)
    radius = int(size * 0.14)
    draw.rounded_rectangle((margin, margin, size - margin, size - margin), radius=radius, fill=fill)
    font = ImageFont.truetype(FONT, int(size * 0.28))
    text = "MC"
    box = draw.textbbox((0, 0), text, font=font)
    width = box[2] - box[0]
    height = box[3] - box[1]
    x = (size - width) / 2 - box[0]
    y = (size - height) / 2 - box[1] - size * 0.015
    draw.text((x, y), text, font=font, fill=ink)
    return image


def main() -> None:
    badge(1024, AMBER, INK, BG).save("assets/icon.png")
    badge(1024, AMBER, INK, (0, 0, 0, 0)).save("assets/android-icon-foreground.png")
    badge(1024, WHITE, INK, (0, 0, 0, 0)).save("assets/android-icon-monochrome.png")
    Image.new("RGBA", (1024, 1024), BG).save("assets/android-icon-background.png")
    badge(512, AMBER, INK, (0, 0, 0, 0)).save("assets/splash-icon.png")
    badge(48, AMBER, INK, BG).save("assets/favicon.png")


if __name__ == "__main__":
    main()
