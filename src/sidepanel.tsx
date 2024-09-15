import { useState } from "react"
import "~/src/style.css"

function Test() {
	const [data, setData] = useState("")

	return (
		<div className="bg-green-500">
			<h2>
				Welcome to your
				<a href="https://www.plasmo.com" target="_blank">
					{" "}
					Plasmo
				</a>{" "}
				Extension!
			</h2>
			<input onChange={(e) => setData(e.target.value)} value={data} />
			<a href="https://docs.plasmo.com" target="_blank">
				View Docs
			</a>
		</div>
	)
}

export default Test