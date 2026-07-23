const { ImageResponse } = require("next/og")
const React = require("react")
const fs = require("fs/promises")

const BG = "#E0A87C"

async function render(size) {
  const style = {
    fontSize: Math.round(size * 0.72),
    background: BG,
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    borderRadius: Math.round(size * 0.22),
  }
  const el = React.createElement("div", { style }, "🎮")
  const res = new ImageResponse(el, { width: size, height: size })
  const buf = Buffer.from(await res.arrayBuffer())
  await fs.writeFile(`public/icon-${size}.png`, buf)
  console.log(`wrote public/icon-${size}.png (${buf.length} bytes)`)
}

;(async () => {
  await render(192)
  await render(512)
  console.log("done")
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
