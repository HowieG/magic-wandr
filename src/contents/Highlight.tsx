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


let activeButton: HTMLDivElement | null = null;
let debounceTimer: ReturnType<typeof setTimeout> | null = null;


function removeActiveButton() {
	if (activeButton) {
		activeButton.remove();
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

			// Create a container for the Shadow DOM
			const container = document.createElement('div');
			container.style.position = 'absolute';
			container.style.left = `${event.pageX - 25}px`;
			container.style.top = `${event.pageY - 25}px`;
			container.style.zIndex = '9999';

			// Create Shadow DOM
			const shadow = container.attachShadow({ mode: 'closed' });

			// Create button
			const button = document.createElement('button');
			button.id = 'magic-wander-button';

			// Apply styles
			const style = document.createElement('style');
			style.textContent = `
			  button {
			    width: 50px;
			    height: 50px;
			    border: none;
			    padding: 0;
			    cursor: pointer;
			    background-image: url(${magicWanderIcon});
			    background-size: contain;
			    background-position: center;
			    background-repeat: no-repeat;
			    background-color: transparent;
			    outline: none;
			  }
			`;

			// Add click event to the button
			button.addEventListener('click', (e) => {
				removeActiveButton();
				highlightRange(range);
				sendToBackground({
					name: "open-sidepanel"
				});
			});

			// Append button and styles to Shadow DOM
			shadow.appendChild(style);
			shadow.appendChild(button);

			// Append container to document body
			document.body.appendChild(container);
			activeButton = container;
		} else {
			removeActiveButton();
		}
	}, 500); // 500ms debounce delay
}

window.addEventListener('mouseup', (event) => {
	handleSelection(event);
});

// TODO: this is too frequent. Base it on mouse events? Should I account for non-mouse events?
// TODO: if I can get the mouse position, I can get rid of mouseup and just use selectionchange,
// though I still want to make sure their mouse is up before calling handleSelection
document.addEventListener('selectionchange', () => {
	removeActiveButton();
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