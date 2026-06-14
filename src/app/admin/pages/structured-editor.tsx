"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, ArrowUp, ArrowDown } from "lucide-react"

interface Block {
  id: string
  type: "heading" | "paragraph" | "list"
  content: string
  items?: string[]
}

interface StructuredEditorProps {
  html: string
  onChange: (html: string) => void
}

function parseHTMLToBlocks(html: string): Block[] {
  const blocks: Block[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, "text/html")
  let listId = 0

  Array.from(doc.body.children).forEach((child, index) => {
    const tagName = child.tagName.toLowerCase()
    if (tagName.startsWith("h")) {
      blocks.push({
        id: `heading-${index}`,
        type: "heading",
        content: child.textContent || "",
      })
    } else if (tagName === "p") {
      blocks.push({
        id: `paragraph-${index}`,
        type: "paragraph",
        content: child.innerHTML || "",
      })
    } else if (tagName === "ul" || tagName === "ol") {
      const items = Array.from(child.querySelectorAll("li")).map(li => li.textContent || "")
      blocks.push({
        id: `list-${listId++}`,
        type: "list",
        content: tagName,
        items,
      })
    }
  })

  return blocks
}

function blocksToHTML(blocks: Block[]): string {
  return blocks
    .map(block => {
      if (block.type === "heading") {
        return `<h2>${block.content}</h2>`
      }
      if (block.type === "paragraph") {
        return `<p>${block.content}</p>`
      }
      if (block.type === "list") {
        const tag = block.content === "ul" ? "ul" : "ul"
        const items = block.items?.map(item => `<li>${item}</li>`).join("") || ""
        return `<${tag}>${items}</${tag}>`
      }
      return ""
    })
    .join("")
}

export function StructuredEditor({ html, onChange }: StructuredEditorProps) {
  const blocks = parseHTMLToBlocks(html)

  const updateBlock = (index: number, updates: Partial<Block>) => {
    const newBlocks = blocks.map((block, i) => (i === index ? { ...block, ...updates } : block))
    onChange(blocksToHTML(newBlocks))
  }

  const addBlock = (type: Block["type"], afterIndex: number) => {
    const newBlock: Block = {
      id: `${type}-${Date.now()}`,
      type,
      content: type === "list" ? "ul" : "",
      items: type === "list" ? [""] : undefined,
    }
    const newBlocks = [...blocks]
    newBlocks.splice(afterIndex + 1, 0, newBlock)
    onChange(blocksToHTML(newBlocks))
  }

  const removeBlock = (index: number) => {
    const newBlocks = blocks.filter((_, i) => i !== index)
    onChange(blocksToHTML(newBlocks))
  }

  const moveBlock = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= blocks.length) return
    const newBlocks = [...blocks]
    ;[newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]]
    onChange(blocksToHTML(newBlocks))
  }

  const addListItem = (blockIndex: number) => {
    const block = blocks[blockIndex]
    if (block.type !== "list") return
    const newItems = [...(block.items || []), ""]
    updateBlock(blockIndex, { items: newItems })
  }

  const updateListItem = (blockIndex: number, itemIndex: number, value: string) => {
    const block = blocks[blockIndex]
    if (block.type !== "list") return
    const newItems = block.items?.map((item, i) => (i === itemIndex ? value : item))
    updateBlock(blockIndex, { items: newItems })
  }

  const removeListItem = (blockIndex: number, itemIndex: number) => {
    const block = blocks[blockIndex]
    if (block.type !== "list") return
    const newItems = block.items?.filter((_, i) => i !== itemIndex)
    updateBlock(blockIndex, { items: newItems })
  }

  return (
    <div className="space-y-3">
      {blocks.map((block, index) => (
        <div key={block.id} className="group relative rounded-lg border border-border bg-card p-3">
          {/* 移动/删除按钮 */}
          <div className="absolute right-2 top-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => moveBlock(index, "up")}
              disabled={index === 0}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="上移"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => moveBlock(index, "down")}
              disabled={index === blocks.length - 1}
              className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
              title="下移"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => removeBlock(index)}
              className="p-1 text-muted-foreground hover:text-red-500"
              title="删除"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* 块类型标签 */}
          <div className="mb-2 flex items-center gap-2">
            <span className="text-[10px] uppercase font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {block.type === "heading" && "标题"}
              {block.type === "paragraph" && "段落"}
              {block.type === "list" && "列表"}
            </span>
          </div>

          {/* 编辑区域 */}
          {block.type === "heading" && (
            <Input
              value={block.content}
              onChange={e => updateBlock(index, { content: e.target.value })}
              placeholder="输入标题..."
              className="h-9 text-sm"
            />
          )}

          {block.type === "paragraph" && (
            <Textarea
              value={block.content}
              onChange={e => updateBlock(index, { content: e.target.value })}
              placeholder="输入段落内容..."
              className="min-h-[60px] text-sm"
              rows={2}
            />
          )}

          {block.type === "list" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <select
                  value={block.content}
                  onChange={e => updateBlock(index, { content: e.target.value })}
                  className="text-xs border border-border rounded-md px-2 py-1 bg-background"
                >
                  <option value="ul">无序列表</option>
                  <option value="ol">有序列表</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addListItem(index)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />添加项
                </Button>
              </div>
              {block.items?.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-4">{itemIndex + 1}.</span>
                  <Input
                    value={item}
                    onChange={e => updateListItem(index, itemIndex, e.target.value)}
                    placeholder={`第${itemIndex + 1}项`}
                    className="h-8 text-sm flex-1"
                  />
                  <button
                    onClick={() => removeListItem(index, itemIndex)}
                    className="p-1 text-muted-foreground hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* 添加块按钮 */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => addBlock("heading", blocks.length - 1)}
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />添加标题
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addBlock("paragraph", blocks.length - 1)}
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />添加段落
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => addBlock("list", blocks.length - 1)}
          className="flex-1"
        >
          <Plus className="h-3.5 w-3.5 mr-1" />添加列表
        </Button>
      </div>

      {/* 提示 */}
      <p className="text-xs text-muted-foreground text-center">
        鼠标悬停在块上可移动或删除 · 块顺序与前台显示顺序一致
      </p>
    </div>
  )
}