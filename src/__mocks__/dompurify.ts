/**
 * Mock for isomorphic-dompurify in Jest tests
 * Returns a minimal sanitizer that strips script tags
 */
const DOMPurify = {
  sanitize(html: string, _config?: Record<string, unknown>): string {
    if (!html) return ""
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
  },
}

export default DOMPurify
