import fs from 'fs';
import path from 'path';

const root = process.cwd();
const importFile = path.join(root, 'clrp_wiki_import.json');
const pagesDirectory = path.join(root, 'clrp_pages');
const imported = JSON.parse(fs.readFileSync(importFile, 'utf8'));

const replacements = [
  [/Here is your guide to the various ([^.]+) found around CityLife!?/gi, 'This guide covers the $1 available throughout CityLife.'],
  [/This page goes over the various different ([^.]+)!?/gi, 'This page describes the available $1.'],
  [/This page goes over the various ([^.]+)!?/gi, 'This page describes the available $1.'],
  [/Interested in what the ([^.\n]+?) skill unlocks\? Click (?:the tab below|\[HERE\])/gi, 'See the linked $1 article for complete unlock details'],
  [/Welcome to the official CityLife Roleplay Wiki!/gi, 'Welcome to the official CityLife Roleplay Wiki.'],
  [/Before you start your journey into the city, /gi, 'Before entering the city, '],
  [/whip out your phone and launch/gi, 'open your phone and launch'],
  [/Begin your journey at/gi, 'Start at'],
  [/Kickstart your trucking journey/gi, 'Start the trucking route'],
  [/let your refueling adventure begin!/gi, 'begin refueling.'],
  [/Happy gardening!?/gi, ''],
  [/Happy panning!?/gi, ''],
  [/Best of luck out there, stay safe, and happy ([^.\n!]+)!/gi, 'Follow the procedure carefully while $1.'],
  [/Become a Legendary Oxy Supplier!/gi, 'Oxy Run Guide'],
  [/The Art of the Heist: A Guide to Bank Robberies with Style/gi, 'Bank Heist Guide'],
  [/Store Robbery 101: A Smooth Criminal[’']s Playbook/gi, 'Store Robbery Guide'],
  [/The Green Thumb Guide: Mastering the Art of "Gardening"/gi, 'Growing and Selling Guide'],
  [/([A-Za-z ]+): A Step-by-Step Guide to (?:Shiny|Glittering) Success/gi, '$1 Guide'],
  [/([A-Za-z ]+): The Insider[’']s Guide/gi, '$1 Guide'],
  [/The ([A-Za-z ]+) Caper: A New Kind of Score/gi, '$1 Guide'],
  [/Loot Like a Legend/gi, 'Collect Available Items'],
  [/Gear Up for Glory/gi, 'Prepare Equipment'],
  [/Choose Your Pawn Wisely/gi, 'Select a Hostage'],
  [/The Performance of a Lifetime/gi, 'Complete the Heist'],
  [/Choose Your Masterpiece/gi, 'Select an Image'],
  [/Ride and Shine/gi, 'Passenger Service'],
  [/the grand finale/gi, 'the final step'],
  [/with the grace and speed of a gazelle/gi, 'as quickly as possible'],
  [/your ticket to success/gi, 'the tool required to proceed'],
  [/your stage prop/gi, 'the required equipment'],
  [/digital magician/gi, 'hacker'],
  [/get ready for an adventure/gi, 'review the route requirements'],
  [/your recycling adventure begins/gi, 'the recycling process begins'],
  [/Keep grinding activities with your crew to progress through the levels/gi, 'Continue completing eligible activities with your crew to progress through the levels'],
  [/Expect weeks of grinding activities, building connections, and growing your influence before unlocking major features\./gi, 'Expect progression to require several weeks of activity, relationship building, and increased influence before major features unlock.'],
  [/You[’']ll have to discover this one through in-city connections and roleplay interactions, folks!/gi, 'Discover this process through in-city connections and roleplay interactions.'],
  [/Every grand scheme starts with a clever selection\. Scout for a hostage who might just be your four-leaf clover\. Charm works wonders – a smile can be as powerful as a gun\./gi, 'Select a hostage to begin the heist. Charm and persuasion may be used instead of force.'],
  [/Don’t step into the lion’s den unprepared\. Your weapon is the required equipment, your declaration that you mean business\. Hold it with purpose, but keep the theatrics sharp\./gi, 'Bring a weapon and any other equipment required for the heist.'],
  [/No game is worth playing without worthy opponents\. Make sure there are at least four officers on duty to keep things spicy – after all, a heist without tension is just a withdrawal\./gi, 'Confirm that at least four officers are on duty before beginning the heist.'],
  [/With your pieces in place, the real drama begins\. Cut the power by cutting into the Electrical Box and shroud your actions in mystery\. Hack the vault door like a hacker\. Drill into safety deposit boxes with precision, and melt through barriers with thermite\. Every move should be part of the masterpiece\./gi, 'Cut the power at the Electrical Box, then hack the vault door. Drill into the safety deposit boxes and use thermite to cut through the barriers.'],
  [/Sweep the vault for treasures – trolleys, tables, and everything that gleams\. This is your time to shine, so gather what’s yours with flair\./gi, 'Collect all available vault items, including those on the trolleys and tables.'],
  [/the final step! Vanish into the night with the grace of a shadow\. Whether by speed, cunning, or sheer nerve, leave them stunned and chasing ghosts\./gi, 'Complete the final step by leaving the area using the planned escape route.'],
  [/Remember, a great heist isn’t just about what you take; it’s about the story you leave behind\. Be bold\. Be mysterious\. Be unforgettable\./gi, 'Follow all applicable rules throughout the heist.'],
  [/Start your caper by judiciously selecting a hostage\. Choose wisely, as this individual might just be your lucky charm! Remember, charm can be just as effective as force\./gi, 'Select a hostage to begin the robbery. Charm and persuasion may be used instead of force.'],
  [/Now, with all the pieces in place, it[’']s showtime! Take the reins, point your weapon, and let your creative genius guide the way\. Whether it[’']s a smooth talk or a swift action, make it memorable for all involved\./gi, 'Take control of the store by pointing your weapon and proceeding through force or persuasion as appropriate.'],
  [/Once you[’']ve made your mark, it[’']s time to vanish as quickly as possible\. Leave them wondering, 'Who was that masked marvel\?'/gi, 'Leave the area as quickly as possible.'],
  [/A good score needs an element of risk\. Make sure enough officers are on duty to keep things interesting\. No challenge\? No glory\./gi, 'Confirm that the required number of officers are on duty before beginning.'],
  [/Every major heist begins with solid intel\. In this case, head to the hidden black-market dealer, bringing along a specific “special item” they’re after\. Trade that item for exclusive details on the bank truck’s secret routes—no item, no intel\./gi, 'Bring the requested special item to the hidden black-market dealer and exchange it for details about the bank truck routes. The dealer will not provide the information without the item.'],
  [/These aren’t standard delivery drivers; they’re heavily guarded\. Come prepared with weapons, ammo, and any extra firepower you might need—explosives, thermite, or whatever suits your style\./gi, 'The bank truck is heavily guarded. Bring weapons, ammunition, and any additional equipment needed, such as explosives or thermite.'],
  [/Your first stop is the underworld contact who deals in black-market break-ins\. Seek out this “boss” for the chance to prove your skill\. Without their nod of approval, you won’t get anywhere near the lucrative neighborhoods\./gi, 'Contact the black-market break-in boss to gain access to house robbery jobs. The boss’s approval is required to enter the available neighborhoods.'],
  [/Houses aren’t pushovers—especially in a well-protected city\. Secure any specialized gear your that's required for a forced entry\. If you show up unprepared, you’ll be turning around empty-handed\./gi, 'Obtain all specialized equipment required for forced entry before traveling to the target house.'],
  [/Slip inside quietly\. Keep your noise to a minimum—pets might bark, neighbors might snoop, and homeowners might be lurking\. One wrong move can set off alarms, so stay on your toes\./gi, 'Enter quietly and minimize noise. Pets may bark, neighbors may investigate, homeowners may be present, and excessive noise may trigger an alarm.'],
  [/Embark on your botanical journey by collecting essential gardening supplies from Smoke on the Water\. You’ll need plant water, plant fertilizer, and plant pots!/gi, 'Collect plant water, plant fertilizer, and plant pots from Smoke on the Water.'],
  [/Monitor your plants like a proud plant parent \(Third eye\)\. Proper watering and feeding are crucial for top-notch quality — remember, it[’']s all about the end product!/gi, 'Monitor the plants using the Third eye. Water and fertilize them properly to maintain product quality.'],
  [/Now comes the thrilling conclusion! Harvest your plants, roll those joints at a covert location, and then engage in the fine art of salesmanship with locals using our innovative corner selling script \(activated through the Z radial menu\)\./gi, 'Harvest the plants, roll the joints at a covert location, and sell them to locals using the corner selling script in the Z radial menu.'],
  [/Great question! Start your fishing adventure by visiting any of our Hardware Stores - easily spotted by a white wrench icon on the map\. Purchase a Standard Fishing Rod to kick things off, as advanced rods require a higher fishing skill level\. Don[’']t forget to grab some bait while you[’']re there\. Happy fishing!/gi, 'Visit a Hardware Store, marked by a white wrench icon on the map. Purchase a Standard Fishing Rod and bait; advanced rods require a higher fishing skill level.'],
  [/With your new fishing gear in hand, you[’']re ready to explore the thrill of the catch! Go ahead and cast your line in any body of water that calls to you\. Remember, any spot with water is a potential fishing hotspot\. Embrace the adventure!/gi, 'With the fishing rod and bait equipped, cast your line in any body of water. Any location with water may serve as a fishing spot.'],
  [/Your majestic vehicle will pull up to you within 15 seconds of renting\. A truck is not just a truck - it[’']s your partner on this exciting journey\./gi, 'The rented truck will arrive within 15 seconds.'],
  [/Now that you[’']re officially a recycling warrior, make your way inside towards the glowing object\. Let the hunt begin!/gi, 'Proceed inside and interact with the glowing object to begin searching.'],
  [/Gold Rush, CityLifers!\s+Visit our chatty NPC at the mineshaft entrance on your GPS, and grab yourself a shiny gold pan\. No, it[’']s not a frying pan\.&#x20;/gi, 'Visit the NPC at the mineshaft entrance marked on your GPS and obtain a gold pan.'],
  [/Begin your quest at any of the whimsical Shops scattered across our map/gi, 'Visit any Shop marked on the map'],
  [/Now for the fun part, breathe in those absolutely-not-good-for-you chemicals! Vape on, daredevil/gi, 'Use the filled vape'],
  [/Embark on your botanical journey by collecting essential gardening supplies from Smoke on the Water\. You[’']ll need plant water, plant fertilizer, and plant pots!/gi, 'Collect plant water, plant fertilizer, and plant pots from Smoke on the Water.'],
  [/Adventure northward to the renowned Weed Farm! Here[’']s where you[’']ll lovingly pick weed plants for those precious seeds\. Keep an eye out for OG Kush seeds, as this is where your growing begins!/gi, 'Travel north to the Weed Farm and pick weed plants to obtain OG Kush seeds.'],
  [/Get ready for some thrilling adventures! First up, secure yourself a super-sleek VPN\./gi, 'Obtain a VPN to begin.'],
  [/Just like that, you[’']re all set to embark on an epic journey\. Your phone is your guide! Best of luck out there!/gi, 'Use your phone to follow the activity objectives.'],
  [/Begin your daring escapade by charmingly persuading a friendly local \(or two\) to join your adventure — as unwilling guests, of course\. Remember, this is a \*?critical\*? first step!/gi, 'Recruit one or two local hostages through persuasion. This is required before proceeding.'],
  [/Saving the best for last — the getaway\. Be bold, be daring\. This is your chance to make heist history with a departure as memorable as the heist itself!/gi, 'Complete the heist by executing the planned getaway.'],
  [/To begin your journey of stealing residential packages, you must first start your search around different neighbor hoods for houses with a package left on the porch\./gi, 'To steal residential packages, search neighborhoods for houses with a package left on the porch.'],
  [/Get ready for some vehicle boosting adventures! First up, secure yourself a super-sleek VPN and a Laptop from Digital Den!/gi, 'Obtain a VPN and a Laptop from Digital Den to begin vehicle boosting.'],
  [/Just like that, you[’']re all set to embark on an epic journey\. Your Boosting Laptop & Phone are your guide! Follow the procedure carefully while flipping\./gi, 'Use the Boosting Laptop and Phone to follow each objective while flipping the vehicle.'],
  [/Get ready for some scrappy adventures! First up, secure yourself a Circular Saw, and Saw Blade/gi, 'Obtain a Circular Saw and Saw Blade to begin'],
  [/Get ready for some choppy adventures! First up, secure yourself a super-sleek VPN\./gi, 'Obtain a VPN to begin the Chop Shop activity.'],
  [/Just like that, you[’']re all set to embark on an epic journey\. Your phone is your guide! Follow the procedure carefully while hunting\./gi, 'Use your phone to follow each objective while locating the vehicle.'],
  [/We[’']ve hand crafted various tabs inside this Wiki to help you navigate through the many different aspects that you will stumble upon during your adventure here at CityLife\. P\.S, different pages of the wiki have tips & warnings that are wise to abide by!/gi, 'Use the Wiki tabs to navigate CityLife topics. Review and follow all notes and warnings included on each page.'],
  [/Begin your mail delivery adventure by having a chat with the Mail Delivery Boss\. Choose the route that calls to you\. Remember, higher skill levels unlock better routes\./gi, 'Speak with the Mail Delivery Boss and select a route. Higher skill levels unlock additional routes.'],
  [/When you[’']ve reached the mineshaft, venture inside and set to work on the rich, abundant nodes peppered throughout the mine to collect stone! Ensure you[’']re well-prepared with plenty of food, water, and of course, pickaxes in your inventory\. Let the mining adventure begin!/gi, 'Enter the mineshaft and mine the available stone nodes. Bring sufficient food, water, and pickaxes.'],
  [/Step inside the Recycle Center and let your third eye guide you to the desk\. Use it to toggle on your recycling duty\. Your green journey begins now!/gi, 'Enter the Recycle Center and use the Third eye at the desk to toggle recycling duty.'],
  [/Fancy yourself a people person\? Offer rides to other players and turn every journey into a networking event on wheels\./gi, 'Offer rides to other players and use the fare meter to provide passenger service.'],
  [/Or if you[’']re a lone cruiser, toggle over to NPC Missions to hop into the queue for automated adventures\./gi, 'Alternatively, select NPC Missions to join the queue for automated taxi jobs.'],
  [/You[’']re now a towing pro! Your journey through the exciting world of towing has just begun\. Congratulations and good luck out there!/gi, 'The towing setup is complete. Begin accepting towing jobs.'],
  [/If your car goes on an adventure without you, treat it like a one-time-use coupon\. Once it[’']s gone, you[’']re stuck waiting for the next tsunami to bring it back from the impound lot\. Be safe rather than being sorry!/gi, 'If a vehicle is lost, it remains unavailable until the next tsunami returns it from the impound lot. Take precautions to avoid losing the vehicle.'],
  [/Once your vehicle[’']s belly is full, kindly return the hose with a touch of your third eye again on the gas tank\. Voila! You[’']re all set to zoom away to your next adventure!/gi, 'When refueling is complete, use the Third eye on the gas tank to return the hose before driving away.'],
  [/\*We know how excited you are to jump on into CityLife, so we[’']ve put this wonderful wiki together to help you achieve the best possible experience during your playtime here\. This wiki was curated to answer any and all of the questions you may run into during your adventures on CityLife Roleplay!\*/gi, 'This wiki provides reference information for common questions and activities in CityLife Roleplay.'],
  [/The Thrilling Escape/gi, 'Complete the Getaway'],
  [/Select a Hostage with Flair/gi, 'Select a Hostage'],
  [/For those seeking something extra special, join our <mark style="color:yellow;">supporter<\/mark> crew to unlock exclusive vehicular delights! Hop in, buckle up and zoom off into your CityLife adventure!\\/gi, 'A supporter membership is required to access supporter-exclusive vehicles.\\'],
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