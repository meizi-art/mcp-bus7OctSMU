# User Prompts History

This file documents all user prompts provided during the development of this project.

---

## Prompt 1
```text
Build me an app with screens that look like this. You can hotlink images from the html

# Glacier — Glassmorphism

## North Star: "Frozen Light"
Ethereal depth through layered translucent surfaces. Dark, atmospheric, and premium.

## Colors
- Primary (#7dd3fc): Ice-blue for interactive elements and accents.
- Background (#0a0e1a): Deep navy-black base.
- Tertiary (#c8a0f0): Soft lavender for secondary accents.
- All surface containers should feel like tinted glass layers.

## Glass Effect (Core Pattern)
- Cards/Panels: background: rgba(15, 21, 36, 0.6), backdrop-filter: blur(16px), border: 1px solid rgba(125, 211, 252, 0.1).
- Elevated glass: Increase opacity to 0.75 and blur to 24px.
- Borders: Always use semi-transparent primary or white at 8-15% opacity.

## Typography
- All fonts: Inter for clean, modern readability.
- Headlines: semibold, slightly tracked. Body: regular weight.
- Text colors: on_surface for primary, on_surface_variant for secondary.

## Elevation
- Depth through blur intensity and opacity, not shadows.
- Layer 0: solid background. Layer 1: 60% opacity + 16px blur. Layer 2: 75% + 24px blur.
- Subtle glow effects: box-shadow: 0 0 30px rgba(125, 211, 252, 0.05).

## Components
- Buttons: Primary = semi-transparent primary fill with border. Hover = increase opacity.
- Cards: Frosted glass with thin luminous border.
- Inputs: Glass background, thin border, glow on focus.

## Rules
- Never use opaque solid backgrounds on floating elements.
- Keep borders subtle — luminous, not structural.
- Limit glow effects to interactive states.
```

---

## Prompt 2
```text
change to a simple singapore bus arrival app. as simple as possible. i want to connect API later.
```

---

## Prompt 3
```text
git push https://<GITHUB_TOKEN>@github.com/meizi-art/mcp-bus7OctSMU.git
```

---

## Prompt 4
```text
• 1) create a /api folder under the project main to store all the apis
	• 2) Create a /api/health.js to monitor if the apis are working 
	• 3) integrate the LTA bus information  api endpoint 

	GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
	Header:  AccountKey: 
	
	# BusStopCode is the only required parameter.
	# Add &ServiceNo=7 to ask about one service only.
	# Refreshes every 20 seconds. JSON comes back by default.

I will add the LTA_ACCOUNT_KEY in vercel environment variables later
```

---

## Prompt 5
```text
create a prompt.md containing all my prompts located at project main
```
