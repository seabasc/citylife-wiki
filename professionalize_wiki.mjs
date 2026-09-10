import fs from 'fs';
import path from 'path';

const root = process.cwd();
const importFile = path.join(root, 'clrp_wiki_import.json');
const pagesDirectory = path.join(root, 'clrp_pages');
const imported = JSON.parse(fs.readFileSync(importFile, 'utf8'));

const replacements = [
  [/Here is your guide to the various ([^.]+) found around CityLife!?/gi, 'This article covers $1.'],
  [/This page goes over the various different ([^.]+)!?/gi, 'This article describes the available $1.'],
  [/This page goes over the various ([^.]+)!?/gi, 'This article describes the available $1.'],
  [/Interested in what the ([^.\n]+?) skill unlocks\? Click (?:the tab below|\[HERE\])/gi, 'See the linked $1 article for unlock details'],
  [/Best of luck out there, stay safe, and happy [^.\n!]+!/gi, 'Review the requirements before starting.'],
  [/Happy gardening!?/gi, ''],
  [/Embrace your inner botanist and remember, this guide is for virtual green thumbs only\.?/gi, 'Use this process only after confirming the required items and location.'],
  [/The (?:Thrilling|Great) Escape/gi, 'Exit Procedure'],
  [/The Art of the Heist: A Guide to Bank Robberies with Style/gi, 'Bank Heist Procedure'],
  [/The ([A-Za-z ]+) Caper: A New Kind of Score/gi, '$1 Procedure'],
  [/([A-Za-z ]+): The Insider[’\']s Guide/gi, '$1 Procedure'],
  [/([A-Za-z ]+): A Step-by-Step Guide to (?:Shiny|Glittering) Success/gi, '$1 Procedure'],
  [/Store Robbery 101: A Smooth Criminal[’\']s Playbook/gi, 'Store Robbery Procedure'],
  [/The Green Thumb Guide: Mastering the Art of "Gardening"/gi, 'Growing and Selling Procedure'],
  [/the grand finale/gi, 'the final step'],
  [/with flair/gi, 'appropriately'],
  [/with the grace and speed of a gazelle/gi, 'promptly'],
  [/a four-leaf clover/gi, 'a suitable participant'],
  [/the lion[’\']s den/gi, 'the location'],
  [/keep things spicy/gi, 'meet the required conditions'],
  [/your ticket to success/gi, 'a required tool'],
  [/your stage prop/gi, 'required equipment'],
  [/digital magician/gi, 'authorized participant'],
  [/Loot Like a Legend/gi, 'Collect the Available Items'],
  [/Gear Up for Glory/gi, 'Prepare Required Equipment'],
  [/Choose Your Pawn Wisely/gi, 'Confirm Participant Requirements'],
  [/The Performance of a Lifetime/gi, 'Complete Required Actions'],
  [/Every grand scheme starts with a clever selection\. Scout for a hostage who might just be your four-leaf clover\. Charm works wonders – a smile can be as powerful as a gun\./gi, 'Confirm that participant requirements are met before beginning.'],
  [/Don[’']t step into the location unprepared\. Your weapon is required equipment, your declaration that you mean business\. Hold it with purpose, but keep the theatrics sharp\./gi, 'Bring the required equipment and use it in accordance with the applicable rules.'],
  [/No game is worth playing without worthy opponents\. Make sure there are at least four officers on duty to meet the required conditions – after all, a heist without tension is just a withdrawal\./gi, 'Confirm that the required number of officers are on duty before starting.'],
  [/With your pieces in place, the real drama begins\. Cut the power by cutting into the Electrical Box and shroud your actions in mystery\. Hack the vault door like a authorized participant\. Drill into safety deposit boxes with precision, and melt through barriers with thermite\. Every move should be part of the masterpiece\./gi, 'Disable the power at the Electrical Box. Complete the required vault, deposit-box, and barrier interactions with the required tools.'],
  [/Sweep the vault for treasures – trolleys, tables, and everything that gleams\. This is your time to shine, so gather what[’']s yours appropriately\./gi, 'Collect the available vault items, including trolleys and tables, then prepare to leave.'],
  [/the final step! Vanish into the night with the grace of a shadow\. Whether by speed, cunning, or sheer nerve, leave them stunned and chasing ghosts\./gi, 'Leave the area using a planned route.'],
  [/Remember, a great heist isn[’']t just about what you take; it[’']s about the story you leave behind\. Be bold\. Be mysterious\. Be unforgettable\./gi, 'Follow all applicable rules throughout the activity.'],
  [/A good score needs an element of risk\. Make sure enough officers are on duty to keep things interesting\. No challenge\? No glory\./gi, 'Confirm that the required number of officers are on duty before starting.'],
  [/Every major heist begins with solid intel\./gi, 'Begin by obtaining the required information.'],
  [/Time is of the essence[^.]*\./gi, 'Proceed to the marked location promptly.'],
  [/Rally your crew and get moving\./gi, 'Coordinate with the required participants.'],
  [/You[’']ve come this far for what[’']s inside\./gi, 'Collect the available items.'],
  [/This is your time to shine[^.]*\./gi, 'Collect the available items and prepare to leave.'],
  [/Be bold, be daring[^.]*\./gi, 'Use the planned exit route.'],
  [/Get ready for some (?:vehicle boosting|choppy|scrappy) adventures!?/gi, 'Prepare the required equipment.'],
  [/Just like that, you[’']re all set to embark on an epic journey\./gi, 'Once the requirements are met, begin the activity.'],
  [/Your (?:Boosting Laptop & )?Phone is your guide!/gi, 'Use the relevant in-game application to follow the objective.'],
  [/whip out your phone and launch/gi, 'open your phone and launch'],
  [/Every grand scheme starts with a clever selection\. Scout for a hostage who might just be a suitable participant\. Charm works wonders – a smile can be as powerful as a gun\./gi, 'Confirm that participant requirements are met before beginning.'],
  [/Don[’']t step into the location unprepared\. Your weapon is required equipment, your declaration that you mean business\. Hold it with purpose, but keep the theatrics sharp\./gi, 'Bring the required equipment and use it in accordance with the applicable rules.'],
  [/No game is worth playing without worthy opponents\. Make sure there are at least four officers on duty to meet the required conditions – after all, a heist without tension is just a withdrawal\./gi, 'Confirm that the required number of officers are on duty before starting.'],
  [/With your pieces in place, the real drama begins\. Cut the power by cutting into the Electrical Box and shroud your actions in mystery\. Hack the vault door like a authorized participant\. Drill into safety deposit boxes with precision, and melt through barriers with thermite\. Every move should be part of the masterpiece\./gi, 'Disable the power at the Electrical Box. Complete the required vault, deposit-box, and barrier interactions with the required tools.'],
  [/Sweep the vault for treasures – trolleys, tables, and everything that gleams\. This is your time to shine, so gather what[’']s yours appropriately\./gi, 'Collect the available vault items, including trolleys and tables, then prepare to leave.'],
  [/the final step! Vanish into the night promptly\. Whether by speed, cunning, or sheer nerve, leave them stunned and chasing ghosts\./gi, 'Leave the area using a planned route.'],
  [/Welcome to the official CityLife Roleplay Wiki!/gi, 'This reference contains gameplay guides and community information.'],
  [/\*We know how excited you are[\s\S]*?CityLife Roleplay!\*/gi, ''],
  [/Before you start your journey into the city, /gi, 'Before playing, '],
  [/If your car goes on an adventure without you, treat it like a one-time-use coupon\. Once it[’']s gone, you[’']re stuck waiting for the next tsunami\./gi, 'If a vehicle is lost, wait for the next server restart before checking availability again.'],
  [/join our <mark[^>]*>supporter<\/mark> crew[\s\S]*?CityLife adventure!/gi, ''],
  [/Let your social-savvy self shine in the world of CityLife Roleplay!/gi, 'Use the platform in accordance with the applicable rules.'],
  [/let your refueling adventure begin!/gi, 'begin refueling.'],
  [/Choose Your Masterpiece/gi, 'Select the Image'],
  [/Begin your journey at/gi, 'Start at'],
  [/Begin your (?:mail delivery|fishing|towing|trucking|recycling) adventure/gi, 'Start the activity'],
  [/start your fishing adventure/gi, 'purchase fishing equipment'],
  [/Happy panning!/gi, ''],
  [/Ride and Shine/gi, 'Passenger Service'],
  [/turn every journey into a networking opportunity/gi, 'complete passenger service requests'],
  [/You[’']re now a towing pro![\s\S]*?good luck out there!/gi, 'The towing activity is complete.'],
  [/Kickstart your trucking journey/gi, 'Start the trucking activity'],
  [/get ready for an adventure/gi, 'review the route requirements'],
  [/your recycling adventure begins/gi, 'the recycling activity begins'],
  [/Whether you[’']re a newbie or a seasoned beekeeper, she[’']s got you covered\. Plus, she[’']s always happy to buy your surplus supplies\. It[’']s a win-win!/gi, 'The vendor sells supplies and purchases surplus materials.'],
  [/Expect weeks of grinding activities, building connections, and growing your influence before unlocking major features\./gi, 'Expect progression to require sustained activity before major features unlock.'],
  [/Keep grinding activities with your crew to progress through the levels/gi, 'Complete eligible activities to progress through the levels'],
  [/Start your caper by judiciously selecting a hostage\. Choose wisely, as this individual might just be your lucky charm! Remember, charm can be just as effective as force\./gi, 'Confirm that participant requirements are met before beginning.'],
  [/Begin your daring escapade by charmingly persuading a friendly local \(or two\) to join your adventure — as unwilling guests, of course\. Remember, this is a critical first step!/gi, 'Confirm the required participant count before beginning.'],
  [/Become a Legendary Oxy Supplier!/gi, 'Oxy Run Procedure'],
  [/You[’']ll have to discover this one through in-city connections and roleplay interactions, folks!/gi, 'This process requires verification before it can be documented.'],
];

function localFilename(url) {
  return `${new URL(url).pathname.replace(/^\/+/, '').replace(/\.md$/i, '').replace(/\//g, '-')}.md`;
}

function professionalize(content) {
  let result = content
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '')
    .replace(/\{% hint style="(?:info|warning|danger)" %\}\n?\*\*(?:TIP|WARNING):?\*\*\s*/gi, '> **Note:** ')
    .replace(/\{% hint style="(?:info|warning|danger)" %\}\n?/gi, '> ')
    .replace(/\{% endhint %\}/gi, '')
    .replace(/\n{3,}/g, '\n\n');
  for (const [pattern, replacement] of replacements) result = result.replace(pattern, replacement);
  return result.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trimEnd() + '\n';
}

for (const page of imported.pages) {
  page.content = professionalize(page.content);
  fs.writeFileSync(path.join(pagesDirectory, localFilename(page.url)), page.content, 'utf8');
}
fs.writeFileSync(importFile, `${JSON.stringify(imported, null, 2)}\n`, 'utf8');
console.log(`Professionalized ${imported.pages.length} imported pages.`);