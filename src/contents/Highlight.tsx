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
let debounceTimer: ReturnType<typeof setTimeout> | null = null;


function removeActiveButton() {
	if (activeButton) {
		activeButton.parentNode.removeChild(activeButton);
	}
	activeButton = null;
}

// TODO: convert to Tailwind
function handleSelection(event: MouseEvent) {
	// Clear any existing timer
	if (debounceTimer !== null) {
		clearTimeout(debounceTimer);
	}

	// Set a new timer
	debounceTimer = setTimeout(() => {
		console.log('handleSelection');
		let selection = window.getSelection();
		let selectedText = selection.toString().trim();

		if (selectedText.length > 2) { // we expect a locale to have at least 3 characters
			
			console.log('handleSelection', selection);
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
				removeActiveButton();
				highlightRange(range);
				// removeActiveButton();
				sendToBackground({
					name: "open-sidepanel"
				});
			});

			document.body.appendChild(button);
			activeButton = button;
		} else {
			removeActiveButton();
		}
	}, 500); // 500ms debounce delay
}

window.addEventListener('mouseup', (event) => {
	handleSelection(event);
});

// TODO: this is too frequent. Base it on mouse events? Should I account for non-mouse events?
document.addEventListener('selectionchange', () => {
	removeActiveButton();
});

// Remove the button when clicking anywhere else on the page
window.addEventListener('mousedown', (event) => {
	// removeActiveButton();
});


// TODO: this doesn't work on nested reddit comments 
function highlightRange(range: Range) {
	console.log('highlightRange', range);
	const newNode = document.createElement('span');
	newNode.style.backgroundColor = 'lightgray';

	const processTextNode = (node: Text, start: number, end: number) => {
		const nodeRange = document.createRange();
		nodeRange.setStart(node, start);
		nodeRange.setEnd(node, end);
		const highlightSpan = newNode.cloneNode() as HTMLSpanElement;
		nodeRange.surroundContents(highlightSpan);
	};

	const processNodeSpan = () => {
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
		processNodeSpan();
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