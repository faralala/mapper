// Инициализация карты
const map = L.map('map').setView([55.7522, 37.6156], 6)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map)

let markers = []
let currentMarker = null

function renderMarkers() {
	clearMarkers()
	markers.forEach(markerData => {
		const marker = createMarker(markerData)
		marker.addTo(map)
		marker.on('click', () => selectMarker(markerData))
		marker.on('dragend', () => updateMarkerPosition(marker, markerData))
		markerData.id = L.stamp(marker)
	})
}

function createMarker(markerData) {
	const { lat, lng, color } = markerData
	const latLng = L.latLng(lat, lng)
	const markHtmlStyles = `
	display: inherit;
	width: 20px;
	height: 20px;
	background-color: ${color};
	border: 2px solid #fff;
	border-radius: 50%;
	`
	return L.marker(latLng, {
		icon: L.divIcon({
			className: 'custom-marker',
			html: `<span style="${markHtmlStyles};">
			</span>`,
		}),
		draggable: true,
	}).bindPopup(`<strong>${markerData.type}</strong><br>${markerData.name}<br>${markerData.description}`)
}

function clearMarkers() {
	map.eachLayer(layer => {
		if (layer instanceof L.Marker) {
			map.removeLayer(layer)
		}
	})
}

function updateMarkerPosition(marker, markerData) {
	const newLatLng = marker.getLatLng()
	markerData.lat = newLatLng.lat
	markerData.lng = newLatLng.lng
	localStorage.setItem('markers', JSON.stringify(markers))
}

document.getElementById('addMark').addEventListener('click', () => {
	const type = document.getElementById('markType').value
	const name = document.getElementById('markName').value
	const description = document.getElementById('markDesc').value
	const color = document.getElementById('markColor').value
	const latLng = map.getCenter()

	const markerData = {
		type,
		name,
		description,
		color,
		lat: latLng.lat,
		lng: latLng.lng,
	}

	markers.push(markerData)
	localStorage.setItem('markers', JSON.stringify(markers))
	renderMarkers()
	clearMarkerInputs()
})

function clearMarkerInputs() {
	document.getElementById('markType').value = ''
	document.getElementById('markName').value = ''
	document.getElementById('markDesc').value = ''
	document.getElementById('markColor').value = '#ff0000'
}

document.getElementById('saveMark').addEventListener('click', () => {
	if (currentMarker) {
		currentMarker.type = document.getElementById('markType').value
		currentMarker.name = document.getElementById('markName').value
		currentMarker.description = document.getElementById('markDesc').value
		currentMarker.color = document.getElementById('markColor').value

		updateMarkerColor(currentMarker)

		localStorage.setItem('markers', JSON.stringify(markers))
		renderMarkers()
		selectMarker(currentMarker)
	}
})

function updateMarkerColor(marker) {
	const markerIcon = marker._icon
	if (markerIcon) {
		const markerColor = marker.color
		const markerDiv = markerIcon.querySelector('.marker-color')
		if (markerDiv) {
			markerDiv.style.backgroundColor = markerColor
		}
	}
}

function selectMarker(marker) {
	currentMarker = marker
	const markerInputs = document.getElementById('markInputs')
	const markerColorInput = document.getElementById('markColor')

	document.getElementById('markType').value = marker.type
	document.getElementById('markName').value = marker.name
	document.getElementById('markDesc').value = marker.description
	markerColorInput.value = marker.color

	updateMarkerColor(currentMarker)

	document.getElementById('addMark').style.display = 'none'
	document.getElementById('saveMark').style.display = 'inline-block'
	document.getElementById('delMark').style.display = 'inline-block'
}

document.getElementById('delMark').addEventListener('click', () => {
	if (currentMarker) {
		const index = markers.indexOf(currentMarker)
		if (index !== -1) {
			markers.splice(index, 1)
			localStorage.setItem('markers', JSON.stringify(markers))
			renderMarkers()
			currentMarker = null
			clearMarkerInputs()
		}
	}
})

map.on('click', () => {
	clearSelectedMarker()
})

function clearSelectedMarker() {
	currentMarker = null
	clearMarkerInputs()

	document.getElementById('addMark').style.display = 'inline-block'
	document.getElementById('saveMark').style.display = 'none'
	document.getElementById('delMark').style.display = 'none'
}

document.getElementById('filterInput').addEventListener('input', () => {
	const filterText = document.getElementById('filterInput').value.toLowerCase()
	map.eachLayer(layer => {
		if (layer instanceof L.Marker) {
			layer.setOpacity(0)
			const markerData = markers.find(m => layer._leaflet_id === m.id)
			if (markerData && markerData.description) {
				const description = markerData.description.toLowerCase()
				if (description.includes(filterText)) {
					layer.setOpacity(1)
				}
			}
		}
	})
})

const storedMarkers = localStorage.getItem('markers')
if (storedMarkers) {
	markers = JSON.parse(storedMarkers)
	renderMarkers()
}
