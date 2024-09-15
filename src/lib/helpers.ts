import { GoogleGenerativeAI } from "@google/generative-ai";



import { Storage } from "@plasmohq/storage";



import { Activity } from "../types"; // Make sure to import the Activity type


export const localStorageInstance = new Storage({
  area: "local"
})

const genAI = new GoogleGenerativeAI(process.env.PLASMO_PUBLIC_GEMINI_API_KEY)

const prompt_instructions = `
I'm visiting San Francisco. I'm putting recommended stops on a google map.
Please give me a JSON object according to this schema:

{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": {
      "type": "string"
    },
    "neighborhood": {
      "type": "string"
    },
    "category": {
      "type": "string",
      "enum": ["cultural", "entertainment", "food", "scenic"]
    },
    "note": {
      "type": "string"
    },
    "address": {
      "type": "string"
    },
    "lat": {
      "type": "number"
    },
    "lng": {
      "type": "number"
    },
    "day": {
      "type": "string",
      "enum": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  },
  "required": ["name", "neighborhood", "category", "note", "address", "lat", "lng", "day"],
  "additionalProperties": false
}

where

name is the name of the location
neighborhood is the neighborhood of the location
category is one of these type of locations: cultural, entertainment, food, scenic
note is a short note about the location
address is the address of the location
lat is the latitude of the location
lng is the longitude of the location
day is the day of the week the text recommends to visit the location. If none, recommend one

omit any code block markers. just return the JSON not the schema

`

export async function init() {
  localStorageInstance.set("activities", [])
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

export async function processHighlightedText(text: string) {
  // Use gemini-pro model for text-only input
  const model = genAI.getGenerativeModel({ model: "gemini-pro" })
  const prompt = `${prompt_instructions}\n\n${text}`;
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const response_text = response.text();
  console.log(response_text);

  try {
    const jsonResponse = JSON.parse(response_text);
    const activity: Activity = {
      name: jsonResponse.name,
      neighborhood: jsonResponse.neighborhood,
      category: jsonResponse.category,
      note: jsonResponse.note,
      address: jsonResponse.address,
      lat: jsonResponse.lat,
      lng: jsonResponse.lng,
      day: jsonResponse.day,
      // userNotes: jsonResponse.userNotes || [],
      // sources: await getCurrentWindowUrl()
      sources:
        "https://www.holidify.com/places/san-francisco/sightseeing-and-things-to-do.html"
    }

    await addActivityToStorage(activity);
    return activity;
  } catch (error) {
    console.error("Error parsing JSON or adding activity to storage:", error);
    throw error;
  }
}

// export async function addActivityToStorage(oActivity: Activity, pending = false) {
//   let aoActivity: Activity[] = (await getActivitiesFromStorage()) || []

//   if (!aoActivity.some((p) => p.activity_url === oActivity.activity_url)) {
//     if (pending) {
//       // Add to beginning of activities array so that it appears as first thumbnail
//       aoActivity.unshift(oActivity)
//     } else {
//       aoActivity.push(oActivity)
//       await addSelectedActivityToStorage(oActivity.activity_url)
//       // console.log(
//       //   "Added activity ",
//       //   oActivity,
//       //   "to storage. New activities: ",
//       //   aoActivity
//       // )
//     }
//     await localStorageInstance.set("activities", aoActivity)
//   }
// }

export async function addActivityToStorage(
  oActivity: Activity,
  pending = false
) {
  let aoActivity: Activity[] = (await getActivitiesFromStorage()) || []
    aoActivity.forEach((activity, index) => {
      console.log(`Activity ${index + 1}:`, activity)
    })
  aoActivity.push(oActivity)
  await localStorageInstance.set("activities", aoActivity)
  aoActivity.forEach((activity, index) => {
    console.log(`Activity ${index + 1}:`, activity)
  })
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