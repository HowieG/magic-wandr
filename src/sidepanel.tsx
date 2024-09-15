import "~/src/style.css"


import React from 'react'
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api'
import { LinkIcon } from 'lucide-react'


// Note: You would need to replace 'YOUR_GOOGLE_MAPS_API_KEY' with an actual API key
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

const touristSpots = [
	{ name: "Land's End", neighborhood: "Outer Richmond", category: "scenic", note: "Coastal trail with stunning ocean views", lat: 37.7850, lng: -122.5060, day: "Saturday", userNotes: ["Watch the sunset from the Sutro Baths ruins", "Hike the Coastal Trail for breathtaking views"], sources: ["sftravel.com", "nps.gov"] },
	{ name: "China Basin Park", neighborhood: "Mission Bay", category: "entertainment", note: "Waterfront park near Oracle Park", lat: 37.7766, lng: -122.3894, day: "Sunday", userNotes: ["Great for pre-game picnics before Giants games", "Beautiful views of the Bay Bridge"], sources: ["sfrecpark.org"] },
	{ name: "Coit Tower", neighborhood: "North Beach", category: "cultural", note: "Iconic art deco tower with city views", lat: 37.8024, lng: -122.4058, day: "Friday", userNotes: ["Take the elevator to the top for panoramic views", "Check out the murals on the ground floor"], sources: ["sfrecpark.org", "atlasobscura.com"] },
	{ name: "Bi-Rite Creamery", neighborhood: "Mission", category: "food", note: "Famous ice cream shop with unique flavors", lat: 37.7617, lng: -122.4256, day: "Saturday", userNotes: ["Try the salted caramel flavor", "Expect a line, but it moves quickly"], sources: ["eater.com", "thrillist.com"] },
	{ name: "Exploratorium", neighborhood: "Embarcadero", category: "entertainment", note: "Interactive science museum", lat: 37.8017, lng: -122.3973, day: "Sunday", userNotes: ["Visit on Thursday evenings for adults-only night", "Don't miss the Tactile Dome"], sources: ["exploratorium.edu", "timeout.com"] },
	{ name: "Muir Woods", neighborhood: "Mill Valley", category: "scenic", note: "Ancient coastal redwood forest", lat: 37.8912, lng: -122.5719, day: "Saturday", userNotes: ["Make a reservation for parking or shuttle in advance", "Take the Canopy View Trail for a less crowded experience"], sources: ["nps.gov", "outsidelands.org"] },
	{ name: "The Painted Ladies", neighborhood: "Alamo Square", category: "scenic", note: "Iconic row of colorful Victorian houses", lat: 37.7762, lng: -122.4328, day: "Friday", userNotes: ["Best viewed from Alamo Square Park", "Great spot for a picnic with a view"], sources: ["sftravel.com", "atlasobscura.com"] },
	{ name: "Mission Dolores Park", neighborhood: "Mission", category: "entertainment", note: "Popular park with city views", lat: 37.7596, lng: -122.4269, day: "Sunday", userNotes: ["Great people-watching spot", "Bring a blanket and snacks for a relaxing afternoon"], sources: ["sfrecpark.org", "thebolditalic.com"] },
	{ name: "Ferry Building Marketplace", neighborhood: "Embarcadero", category: "food", note: "Gourmet marketplace in historic ferry terminal", lat: 37.7955, lng: -122.3937, day: "Saturday", userNotes: ["Visit during the farmers market on Saturdays", "Try the oysters at Hog Island Oyster Co."], sources: ["ferrybuildingmarketplace.com", "eater.com"] },
	{ name: "California Academy of Sciences", neighborhood: "Golden Gate Park", category: "cultural", note: "Natural history museum with planetarium", lat: 37.7699, lng: -122.4661, day: "Friday", userNotes: ["Visit on Thursday nights for NightLife events (21+)", "Don't miss the living roof"], sources: ["calacademy.org", "goldengatepark.com"] },
]

const categoryStyles = {
	scenic: { shadow: "shadow-[0_4px_10px_rgba(72,187,120,0.5)]", border: "border-l-[3px] border-green-500" },
	food: { shadow: "shadow-[0_4px_10px_rgba(245,101,101,0.5)]", border: "border-l-[3px] border-red-500" },
	entertainment: { shadow: "shadow-[0_4px_10px_rgba(246,224,94,0.5)]", border: "border-l-[3px] border-yellow-500" },
	cultural: { shadow: "shadow-[0_4px_10px_rgba(66,153,225,0.5)]", border: "border-l-[3px] border-blue-500" },
}

function SidebarComponent() {
	return (
		<div className="flex h-screen">
			<div className="w-full h-screen overflow-y-auto bg-gray-900 shadow-lg font-['Poppins',sans-serif]">
				<style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&family=Fredoka+One&display=swap');
          
          .creative-gradient {
            background-image: 
              radial-gradient(circle at 10% 20%, rgba(173, 216, 230, 0.15) 0%, rgba(135, 206, 250, 0.15) 25%, rgba(255, 192, 203, 0.15) 50%, rgba(216, 191, 216, 0.15) 75%, transparent 100%),
              linear-gradient(45deg, rgba(173, 216, 230, 0.1) 0%, rgba(135, 206, 250, 0.1) 25%, rgba(255, 192, 203, 0.1) 50%, rgba(216, 191, 216, 0.1) 75%, rgba(173, 216, 230, 0.1) 100%);
            background-size: 200% 200%;
            animation: gradientShift 20s ease infinite;
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
				<div className="h-64">
					<LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
						<GoogleMap
							mapContainerStyle={{ width: '100%', height: '100%' }}
							center={{ lat: 37.7749, lng: -122.4194 }}
							zoom={12}
						>
							{touristSpots.map((spot, index) => (
								<Marker key={index} position={{ lat: spot.lat, lng: spot.lng }} />
							))}
						</GoogleMap>
					</LoadScript>
				</div>
				<div className="p-4">
					<h2 className="text-2xl font-['Fredoka_One'] mb-1 text-white">Your trip to San Francisco, CA</h2>
					<p className="mb-4 text-sm text-gray-300">Fri Sep 13 - Sun Sep 15</p>
					<ul className="space-y-4">
						{touristSpots.map((spot, index) => (
							<li key={index} className={`p-3 rounded-lg ${categoryStyles[spot.category].shadow} ${categoryStyles[spot.category].border} creative-gradient transition-all duration-300 ease-in-out hover:shadow-lg hover:translate-y-[-2px] hover:brightness-105`}>
								<div>
									<h3 className="text-sm font-medium text-white">{spot.name}</h3>
									<p className="text-xs text-gray-300">{spot.neighborhood}</p>
								</div>
								<p className="mt-1 text-xs text-gray-200">{spot.note}</p>
								<p className="mt-1 text-xs text-gray-300">Best day to visit: {spot.day}</p>
								{spot.userNotes && spot.userNotes.length > 0 && (
									<div className="mt-2">
										<p className="text-xs font-medium text-gray-200">User Tips:</p>
										<ul className="list-disc list-inside">
											{spot.userNotes.map((note, noteIndex) => (
												<li key={noteIndex} className="text-xs text-gray-300">{note}</li>
											))}
										</ul>
									</div>
								)}
								<div className="flex items-center mt-2 space-x-2">
									{spot.sources.map((source, sourceIndex) => (
										<a key={sourceIndex} href={`https://${source}`} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-300 hover:text-blue-100">
											<LinkIcon className="w-3 h-3 mr-1" />
											<span className="text-xs">{source}</span>
										</a>
									))}
								</div>
							</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}

export default SidebarComponent