import type { PlasmoCSConfig } from "plasmo"
import { sendToBackground } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"
import magicWanderIcon from "data-base64:~/assets/magic-wander-icon.png"

// import {
// 	addActivityToStorage,
// 	localStorageInstance,
// 	processHighlightedText,
// 	removeActivityFromStorage
// } from "~/lib/helpers"

// 	const [activities] = useStorage<Activity[]>({
// 		key: "activities",
// 		instance: localStorageInstance
// 	})

export const config: PlasmoCSConfig = {
	matches: ["<all_urls>"]
}


let activeButton: HTMLButtonElement | null = null;

function removeActiveButton() {
	const buttonInDOM = document.getElementById('magic-wander-button');
	if (buttonInDOM) {
		buttonInDOM.parentNode.removeChild(buttonInDOM);
	}
	activeButton = null;
}

// TODO: convert to Tailwind
function handleSelection(event: MouseEvent) {
	// removeActiveButton();

	// Skip if the target is our button
	// if ((event.target as HTMLElement).id === 'magic-wander-button') {
	// 	return;
	// }

	setTimeout(() => {
		let selection = window.getSelection();
		let selectedText = selection.toString().trim();

		if (selectedText.length > 0) {
			let range = selection.getRangeAt(0);

			let button = document.createElement('button');
			button.id = 'magic-wander-button';
			const img = document.createElement('img');
			img.src = magicWanderIcon;
			img.style.width = '30px';
			img.style.height = '30px';
			button.appendChild(img);
			button.style.position = 'absolute';
			button.style.left = `${event.pageX - 40}px`;
			button.style.top = `${event.pageY - 15}px`;
			button.style.zIndex = '9999';

			// Add click event to the button
			button.addEventListener('click', (e) => {
				console.log("range: ", range);
				highlightRange(range);
				// removeActiveButton();
				sendToBackground({
					name: "open-sidepanel"
				});
			});

			document.body.appendChild(button);
			activeButton = button;
		}
	}, 700);
}

// Use mouseup event to trigger button creation
window.addEventListener('mouseup', (event) => {
	if ((event.target as HTMLElement).id !== 'magic-wander-button') {
		handleSelection(event);
	}
});

// Remove the button when the selection changes
window.addEventListener('selectionchange', () => {
	// setTimeout(removeActiveButton, 0);
});

// Remove the button when clicking anywhere else on the page
window.addEventListener('mousedown', (event) => {
	// removeActiveButton();
});

function highlightRange(range: Range) {
	const newNode = document.createElement('span');
	newNode.style.backgroundColor = 'lightgray';

	const processTextNode = (node: Text, start: number, end: number) => {
		const nodeRange = document.createRange();
		nodeRange.setStart(node, start);
		nodeRange.setEnd(node, end);
		const highlightSpan = newNode.cloneNode() as HTMLSpanElement;
		nodeRange.surroundContents(highlightSpan);
	};

	const processNodeSpan = (node: HTMLElement, start: number, end: number) => {
		const treeWalker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
		const textNodes: Text[] = [];

		while (treeWalker.nextNode()) {
			const node = treeWalker.currentNode as Text;
			if (range.intersectsNode(node)) {
				textNodes.push(node);
			}
		}

		textNodes.forEach(node => {
			const intersectingRange = range.cloneRange();
			intersectingRange.selectNodeContents(node);

			if (node === range.startContainer) {
				intersectingRange.setStart(node, range.startOffset);
			}
			if (node === range.endContainer) {
				intersectingRange.setEnd(node, range.endOffset);
			}

			const highlightSpan = newNode.cloneNode() as HTMLSpanElement;
			intersectingRange.surroundContents(highlightSpan);
		});
	}

	if (range.commonAncestorContainer.nodeType === Node.TEXT_NODE) {
		// Case 1: Selection within a single text node
		processTextNode(range.commonAncestorContainer as Text, range.startOffset, range.endOffset);
	} else {
		// Case 2: Selection spans multiple nodes
		processNodeSpan(range.commonAncestorContainer as HTMLElement, range.startOffset, range.endOffset);
	}

	// Clear the selection
	if (window.getSelection) {
		if (window.getSelection().empty) {  // Chrome
			window.getSelection().empty();
		} else if (window.getSelection().removeAllRanges) {  // Firefox
			window.getSelection().removeAllRanges();
		}
	} else if ((document as any).selection) {  // IE
		(document as any).selection.empty();
	}
}