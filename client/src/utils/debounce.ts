/* 防抖 */
export function debounce(fn: any, delay: number = 300) {
  let timer: NodeJS.Timeout | null = null
  return function (this: unknown, ...args: any[]) {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
    timer = setTimeout(() => {
      fn.call(this, ...args)
    }, delay)
  }
}

/* 节流 */
export function throttle(fn: any, interval: number = 300) {
  let lock = false
  return function (this: unknown, ...args: any[]) {
    if (lock) return
    lock = true
    setTimeout(() => (lock = false), interval)
    fn.bind(this)(...args)
  }
}
