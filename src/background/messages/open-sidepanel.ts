import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // @ts-ignore
    chrome.sidePanel.open({ windowId: tabs[0].windowId })
  })

  res.send({
    message: "sidepanel opened"
  })
}

export default handler

// Open the sidepanel when the extension icon is clicked
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
