var touchStartX = 0
var touchEndX = 0
var touchStartY = 0
var touchEndY = 0

function handleSwipeLeftRight(swipeLeftToRight, swipeRightToLeft) {
	var threshold = 100
	var touchDeltaX = Math.abs(touchEndX - touchStartX)
	var touchDeltaY = Math.abs(touchEndY - touchStartY)

	if (touchDeltaX > threshold && touchDeltaX > touchDeltaY) {
		if (touchEndX < touchStartX) swipeLeftToRight()
		if (touchEndX > touchStartX) swipeRightToLeft()
	}
}

document.addEventListener('touchstart', function (event) {
	touchStartX = event.changedTouches[0].screenX
	touchStartY = event.changedTouches[0].screenY
})

document.addEventListener('touchend', function (event) {
	touchEndX = event.changedTouches[0].screenX
	touchEndY = event.changedTouches[0].screenY

	handleSwipeLeftRight(clickButton('next'), clickButton('previous'))

	function clickButton(elementId) {
		var button = document.getElementById(elementId)
		if (button) {
			return function () {
				button.click()
			}
		}
		return noop
	}

	function noop() { }
})
