
/* DonorPortal_ProcessDonationAmount.js */

function debounceInput(cb, delay = 1024) {
  let timeout
  return (...args) => {
    clearInterval(timeout)
    timeout = setTimeout(() => {
      cb(...args)
    }, delay)
  }
}

function setCaretToEnd(el) {
  let selection = document.getSelection()
  let range = document.createRange()

  range.setStart(el.childNodes[0], el.innerText.length)

  range.collapse(true)
  selection.removeAllRanges()
  selection.addRange(range)
}

let debouncedPart = debounceInput(async event => {
  let amount = event.target.textContent

  if (!amount) amount = '100'
  
  if (parseInt(amount) < 10) amount = '10'
  else if (parseInt(amount) > 1000000) amount = '1000000'

  event.target.textContent = parseInt(amount).toLocaleString('en-us')

  setCaretToEnd(event.srcElement)

  await $setUser('DonorPortal_DonationAmount', event.target.textContent)
})

return event => {
  if (event.target.textContent) {
    event.target.textContent = event.target.textContent
      .trim()
      .replace(/\D/g, '')
    setCaretToEnd(event.srcElement)
  }

  debouncedPart(event)
}
