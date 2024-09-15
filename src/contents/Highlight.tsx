import { useEffect, useState } from "react"
import { sendToBackground } from "@plasmohq/messaging"
import type { PlasmoCSConfig } from "plasmo"
import { useStorage } from "@plasmohq/storage/hook"


// import type {
// 	PlasmoCSConfig,
// 	PlasmoCSUIProps,
// 	PlasmoGetInlineAnchorList,
// 	PlasmoGetStyle
// } from "plasmo"
// import type { FC } from "react"

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"],
	world: "MAIN"
}

import {
	addActivityToStorage,
	localStorageInstance,
	removeActivityFromStorage
} from "~/lib/helpers"

const Highlight = () => {
	const [activities] = useStorage<Activity[]>({
		key: "activities",
		instance: localStorageInstance
	})

	const [showButton, setShowButton] = useState(false)
	const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
	const [selectedRange, setSelectedRange] = useState<Range | null>(null)

	useEffect(() => {
		console.log("activities", activities)

		const handleSelection = () => {
			const selection = window.getSelection()
			if (selection.toString().trim() !== "") {
				const range = selection.getRangeAt(0)
				setSelectedRange(range)
				const rect = range.getBoundingClientRect()
				setButtonPosition({
					top: rect.bottom + window.scrollY,
					left: rect.left + window.scrollX
				})
				setShowButton(true)
			} else {
				setShowButton(false)
				setSelectedRange(null)
			}
		}

		document.addEventListener("mouseup", handleSelection)
		return () => document.removeEventListener("mouseup", handleSelection)
	}, [])

	const handleButtonClick = () => {
		// addActivityToStorage(selectedRange)
		sendToBackground({
			name: "open-sidepanel"
		})

		if (selectedRange) {
			const span = document.createElement("span")
			span.style.backgroundColor = "rgba(128, 0, 128, 0.2)" // Light purple with opacity
			selectedRange.surroundContents(span)
		}

		setShowButton(false)
	}

	return showButton ? (
		<div
			style={{
				position: "absolute",
				top: `${buttonPosition.top}px`,
				left: `${buttonPosition.left}px`,
				zIndex: 9999
			}}>
			<button
				onClick={handleButtonClick}
				style={{
					padding: "5px 10px",
					background: "#007bff",
					color: "white",
					border: "none",
					borderRadius: "4px",
					cursor: "pointer"
				}}>
				Wandr
			</button>
		</div>
	) : null
}

export default Highlight
