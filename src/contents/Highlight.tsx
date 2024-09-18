// import { useEffect, useState } from "react"
// import { sendToBackground } from "@plasmohq/messaging"
// import type { PlasmoCSConfig } from "plasmo"
// import { useStorage } from "@plasmohq/storage/hook"


// // import type {
// // 	PlasmoCSConfig,
// // 	PlasmoCSUIProps,
// // 	PlasmoGetInlineAnchorList,
// // 	PlasmoGetStyle
// // } from "plasmo"
// // import type { FC } from "react"

// export const config: PlasmoCSConfig = {
// 	matches: ["<all_urls>"],
// 	world: "MAIN"
// }

// import {
// 	addActivityToStorage,
// 	localStorageInstance,
// 	processHighlightedText,
// 	removeActivityFromStorage
// } from "~/lib/helpers"

// const Highlight = () => {
// 	const [activities] = useStorage<Activity[]>({
// 		key: "activities",
// 		instance: localStorageInstance
// 	})

// 	const [showButton, setShowButton] = useState(false)
// 	const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 })
// 	const [selectedRange, setSelectedRange] = useState<Range | null>(null)

// 	useEffect(() => {
// 		const handleSelection = () => {
// 			const selection = window.getSelection()
// 			if (selection.toString().trim() !== "") {
// 				const range = selection.getRangeAt(0)
// 				setSelectedRange(range)
// 				const rect = range.getBoundingClientRect()
// 				setButtonPosition({
// 					top: rect.bottom + window.scrollY,
// 					left: rect.left + window.scrollX
// 				})
// 				setShowButton(true)
// 			} else {
// 				setShowButton(false)
// 				setSelectedRange(null)
// 			}
// 		}

// 		document.addEventListener("mouseup", handleSelection)
// 		return () => document.removeEventListener("mouseup", handleSelection)
// 	}, [])

// 	const handleButtonClick = () => {
// 		if (selectedRange) {
// 			highlightRange(selectedRange)
			
// 			// Process the highlighted text
// 			const highlightedText = selectedRange.toString()
// 			processHighlightedText(highlightedText)
// 		}

// 		sendToBackground({
// 			name: "open-sidepanel"
// 		})

// 		setShowButton(false)
// 	}

// 	// Add this function to your component
// 	const highlightRange = (range: Range) => {
// 		const newNode = document.createElement('span')
// 		newNode.style.backgroundColor = "rgba(128, 0, 128, 0.2)" // Light purple with opacity
		
// 		const treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT)
// 		const textNodes: Text[] = []
		
// 		while (treeWalker.nextNode()) {
// 			const node = treeWalker.currentNode as Text
// 			if (range.intersectsNode(node)) {
// 				textNodes.push(node)
// 			}
// 		}
		
// 		textNodes.forEach(node => {
// 			const intersectingRange = range.cloneRange()
// 			intersectingRange.selectNodeContents(node)
			
// 			if (node === range.startContainer) {
// 				intersectingRange.setStart(node, range.startOffset)
// 			}
// 			if (node === range.endContainer) {
// 				intersectingRange.setEnd(node, range.endOffset)
// 			}
			
// 			const highlightSpan = newNode.cloneNode() as HTMLSpanElement
// 			intersectingRange.surroundContents(highlightSpan)
// 		})
// 	}

// 	document.addEventListener('mouseup', function () {
// 		let selectedText = window.getSelection().toString();
// 		console.log(selectedText)
// 		if (selectedText.length > 0) {
// 			let range = window.getSelection().getRangeAt(0);
// 			let newNode = document.createElement('span');
// 			newNode.style.backgroundColor = 'lightgray';
// 			range.surroundContents(newNode);
// 		}
// 	});

// 	chrome.runtime.onInstalled.addListener(function () {
// 		chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
// 			chrome.declarativeContent.onPageChanged.addRules([{
// 				conditions: [
// 					new chrome.declarativeContent.PageStateMatcher({
// 						pageUrl: { hostEquals: 'www.reddit.com' },
// 					})
// 				],
// 				actions: [new chrome.declarativeContent.ShowPageAction()]
// 			}]);
// 		});
// 	});

// 	return showButton ? (
// 		<div
// 			style={{
// 				position: "absolute",
// 				top: `${buttonPosition.top}px`,
// 				left: `${buttonPosition.left}px`,
// 				zIndex: 9999
// 			}}>
// 			<button
// 				onClick={handleButtonClick}
// 				style={{
// 					padding: "5px 10px",
// 					background: "#887bff",
// 					color: "white",
// 					border: "none",
// 					borderRadius: "4px",
// 					cursor: "pointer"
// 				}}>
// 				MagicWander
// 			</button>
// 		</div>
// 	) : null
// }

// export default Highlight


import type { PlasmoCSConfig } from "plasmo"
import magicWanderIcon from "data-base64:~/assets/magic-wander-icon.png"

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"]
}

window.addEventListener("mouseup", () => {
	setTimeout(() => {
		let selection = window.getSelection();
		let selectedText = selection.toString().trim();

		if (selectedText.length > 0) {
			let range = selection.getRangeAt(0);
			let rect = range.getBoundingClientRect();

			// Create and position the button
			let button = document.createElement('button');
			const img = document.createElement('img');
			img.src = magicWanderIcon;
			img.style.width = '30px';
			img.style.height = '30px';
			button.appendChild(img);
			button.style.position = 'absolute';
			button.style.left = `${rect.left + window.scrollX - 50}px`; // Position to the left
			button.style.top = `${rect.top + window.scrollY + rect.height / 2 - button.offsetHeight / 2}px`;
			button.style.zIndex = '9999';

			// Add click event to the button
			button.addEventListener('click', () => {
				let newNode = document.createElement('span');
				newNode.style.backgroundColor = 'lightgray';
				range.surroundContents(newNode);
				button.remove(); // Remove the button after highlighting
			});

			document.body.appendChild(button);

			// Remove the button when the selection changes
			document.addEventListener('selectionchange', function removeButton() {
				button.remove();
				document.removeEventListener('selectionchange', removeButton);
			});
		}
	}, 700); // delay to account for cancelling or triple clicking
});