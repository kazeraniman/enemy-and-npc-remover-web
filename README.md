# Elden Ring Enemy and NPC Remover
An Elden Ring mod which helps removes any selected NPC / enemy, whether to aid with phobias or for other reasons.

## Concept
The [original mod](https://www.nexusmods.com/eldenring/mods/4392) worked by replacing the files for a given character using [ModEngine2](https://github.com/soulsmods/ModEngine2). While the original mod works perfectly, it requires the user to find the ID of the enemy or NPC they wish to replace and then rename the files to that ID. This adds a bit of friction to the experience. This mod tries to help with this by providing a website which lets you pick the from a list of all entities and then provides you with the files to put in the mod folder to replace them. If you do not wish to run scripts on your computer, and just for general ease-of-use, I encourage using this version over the desktop version.

## Webpage
The current, live page may be viewed [here](https://kazeraniman.github.io/enemy-and-npc-remover-web/).

## Desktop Version
Want to use the tool offline, or want a desktop version for any other reason? Find it [here](https://github.com/kazeraniman/NpcRemover).

## Pre-requisites
Make sure to install [ModEngine2](https://github.com/soulsmods/ModEngine2) as that is what will use the generate files to replace the characters. Follow the instructions on the page.

## Usage
A button is provided on the webpage to display the usage instructions, but they are provided here as well for convenience.  
1. Select what you would like to replace by clicking on the appropriate row in the "Available Enemies / NPCs" table. Feel free to use the search bar to filter to what you want, as well as clicking on the info icons to launch a search on the wiki to check what you want to replace.
2. Select what will replace your choices with the "Replacement Type" dropdown. Turtles are recommended as they reduce the chance of softlocks and loading issues.
3. Confirm your choices In the "Replaced Enemies / NPCs" table. You may remove choices by clicking on the appropriate row or use the "Clear" button to remove them all.
4. Click "Download Replacements" to download a zip file of all the files needed to perform the replacements. You can save this anywhere (the "Downloads" folder if you're indecisive); we'll be deleting it when we're done.
5. Extract the files in the zip file you just downloaded (right-click → "Extract All...").
6. Navigate to the extracted files and copy all of them. This should not include any folders; just the files. The only things copied should be `.dcx` files.
7. Navigate to the `mod` folder where you have installed ModEngine2. Please keep in mind this should be the `mod` folder inside ModEngine2, not the ModEngine2 folder itself.
8. Navigate to the `chr` folder inside the `mod` folder. If it does not exist, create it first. Ensure it is called exactly `chr`.
9. Paste all the copied files into this folder.
10. Launch your game the normal way you do with ModEngine2 and confirm that everything is working as intended. You will not need to follow the previous steps again unless you want to change the replacements.

## Attribution
The original idea for this mod and the mod which provides the files to use as replacements is found [here](https://www.nexusmods.com/eldenring/mods/4392) as was uploaded by [Vlobster](https://next.nexusmods.com/profile/Vlobster).  
This mod is a leftover of a mod made by "SolowD" which was named "Remove ants and hands-spiders (not only)" which appears to have since been removed.  
[The ID file](/res/ids.json) is a copy of [Character.json](https://github.com/vawser/Smithbox/blob/main/src/StudioCore/Assets/Aliases/Characters/ER/Character.json) provided by [Smithbox](https://github.com/vawser/Smithbox). It has since been minified to reduce the file size.
