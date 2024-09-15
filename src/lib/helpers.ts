import { Storage } from "@plasmohq/storage";

export const localStorageInstance = new Storage({
  area: "local"
})

export async function init() {
  let activities: Activity[] | null =
    await localStorageInstance.get("activities")
  // if (!chatResponses || chatResponses.length === 0) {
  //   let chatMessage: ChatMessage = {
  //     type: "response",
  //     text: "Hi, I'm ShopAdvisor! 😊 How can I help?"
  //   }

  //   let chatResponse: ChatMessageResponse = {
  //     type: "chat_message",
  //     data: chatMessage
  //   }

  //   await addChatResponsesToStorage(chatResponse)
  // }
}

export async function getActivitiesFromStorage(): Promise<Activity[]> {
  const aActivity: Activity[] | null = await localStorageInstance.get("activities")
  return aActivity || []
}

export async function addSelectedActivityToStorage(
  activityUrl: ActivityUrl
): Promise<void> {
  const hasInteractedWithThumbnail = await localStorageInstance.get<boolean>(
    "has_interacted_with_thumbnail"
  )
  if (hasInteractedWithThumbnail === true) {
    // If the user has interacted (e.g. chatted) about the thumbnail and they add another thumbnail,
    // we can assume they're moving on and only want to focus on the new thumbnail so leave only this activity in the array
    await localStorageInstance.set("selected_activities", [activityUrl])
  } else {
    // If the user has not yet had any interaction with the thumbnail, we can assume they want to take an action that involves
    // a string of thumbnails (e.g. a comparison), so append this activity to the array
    let aSelectedActivity: ActivityUrl[] = await getSelectedActivitiesFromStorage()
    aSelectedActivity.push(activityUrl)

    await localStorageInstance.set("selected_activities", aSelectedActivity)
  }

  localStorageInstance.set("has_interacted_with_thumbnail", false)
  //   console.log(
  //     "Added selected activity ",
  //     activityUrl,
  //     "to storage. New selected_activities: ",
  //     aSelectedActivity
  //   )
}

export async function addActivityToStorage(oActivity: Activity, pending = false) {
  let aoActivity: Activity[] = (await getActivitiesFromStorage()) || []

  if (!aoActivity.some((p) => p.activity_url === oActivity.activity_url)) {
    if (pending) {
      // Add to beginning of activities array so that it appears as first thumbnail
      aoActivity.unshift(oActivity)
    } else {
      aoActivity.push(oActivity)
      await addSelectedActivityToStorage(oActivity.activity_url)
      // console.log(
      //   "Added activity ",
      //   oActivity,
      //   "to storage. New activities: ",
      //   aoActivity
      // )
    }
    await localStorageInstance.set("activities", aoActivity)
  }
}

export async function removeActivityFromStorage(activityUrl: ActivityUrl) {
  let aoActivity: Activity[] = (await getActivitiesFromStorage()) || []
  aoActivity = aoActivity.filter((p) => p.activity_url !== activityUrl)
  await localStorageInstance.set("activities", aoActivity)
  //   console.log(
  //     "Removed activity ",
  //     activityUrl,
  //     "from storage. New activities: ",
  //     aoActivity
  //   )

  // Also remove from selected activities
  removeSelectedActivityFromStorage(activityUrl)
}

export function getCurrentWindowUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError)
      }

      if (tabs[0] && tabs[0].url) {
        resolve(tabs[0].url)
      } else {
        reject(new Error("No active tab found"))
      }
    })
  })
}