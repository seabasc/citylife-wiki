// CityLife Santos Wiki — Rule Data (Part 1/2)
const RULES_DATA = {
  categories: [
    { id:'community', title:'Community Rules', icon:'\u2705', color:'var(--accent-green)', rules:[
      { id:'comm-harassment', name:'Prohibited Behavior — Harassment, Bullying, Toxicity, Threats & Privacy Violations', content:'Engaging in any form of harassment, bullying, or toxic behavior—whether inside or outside the server—is strictly prohibited. This includes intentionally provoking or griefing other players, making malicious comments, or showing disrespect toward staff or fellow community members. Threats including doxing, DDoSing, or releasing personal info are forbidden. Zero-tolerance policy enforced.' },
      { id:'comm-impersonation', name:'Staff Impersonation', content:'Changing your name or Steam/Discord name to falsely represent yourself as a staff member, or claiming to be staff in any way, is strictly prohibited.' },
      { id:'comm-age', name:'Age Requirement — 18+', content:'CityLife is strictly an 18+ server following ESRB ratings. Players must be 18 years old or older.' },
      { id:'comm-dishonesty', name:'Dishonesty to Staff', content:'Players must be truthful when reporting events to staff. Deliberate falsehoods or misleading information will result in more severe consequences.' },
      { id:'comm-encouraging', name:'Encouraging Players to Break Rules', content:'Getting someone else to do your dirty work does not exclude you—all parties involved, whether directly or suggesting, will be punished.' }
    ]},
    { id:'general', title:'General Rules', icon:'\u2699\uFE0F', color:'var(--accent-cyan)', rules:[
      { id:'gen-mic', name:'Working Microphone', content:'Players must have a functional, good-quality microphone set to push-to-talk mode. Failure may result in removal from the server.' },
      { id:'gen-rwt', name:'No Real World Trading (RWT)', content:'Real world trading—including buying or selling in-game items, currency, or services for real currency—is strictly prohibited. Results in immediate disciplinary action up to permanent removal.' },
      { id:'gen-bugabuse', name:'Bug Abuse or Exploiting Mechanics', content:'Exploiting game bugs or abusing mechanics is strictly prohibited. Examples: using animations to conceal weapons, exploiting glitches to move while overweight, emoting through walls. Players face warnings to permanent bans.' },
      { id:'gen-combatlog', name:'Combat Logging', content:'Disconnecting during or immediately after a hostile situation to avoid roleplay consequences is strictly prohibited. Players must remain connected and actively participate.' }
    ]},
    { id:'arrest', title:'Arrest & Jail Procedures', icon:'\u26D4\uFE0F', color:'var(--accent-orange)', rules:[
      { id:'arrest-proper', name:'Proper Arrest Protocol', content:'Police must follow proper arrest procedures before cuffing and transporting a player. Citizens have the right to refuse arrest which should escalate the situation appropriately.' },
      { id:'arrest-resist', name:'Resisting Arrest', content:'Active resistance during an arrest will be documented. Continued resistance after being given multiple warnings constitutes active resistance.' },
      { id:'jail-break', name:'Jail Break Rules', content:'Breaking someone out of jail requires proper roleplay. You can only help people with a legitimate story/relationship or if they genuinely helped you before.' },
      { id:'jail-rules', name:'Incarceration Limits', content:'Certain crimes cannot be served in minimum-security jail. Check specific crime requirements before transporting.' }
    ]},

    { id:'frisking', title:'Frisking & Body Looting Rules', icon:'\uD83D\uDD0D', color:'var(--accent-purple)', rules:[
      { id:'frisk-consent', name:'Consent-Based Frisking', content:'Frisking must be consensual. Players can refuse a frisk, but refusal may escalate the situation in roleplay.' },
      { id:'frisk-bodies', name:'Body Looting Limits', content:'You cannot loot box cops during a fight. You may only rob one cop per scene. If you have a team of five, each person standing may loot ONE cop.' },
      { id:'frisk-inventory', name:'Inventory Access Rules', content:'If you access an inventory of a downed officer, that counts as your one body—you cannot go body to body finding who has the best loot.' },
      { id:'frisk-minimum', name:'Minimum Cops for Looting', content:'There must be a minimum of five cops on scene. The situation must stem from an airdrop, high-tier robbery, gang vs gang vs cops shootout, or similarly high-stakes situation.' }
    ]},
    { id:'gang-rules', title:'Gang Rules', icon:'\uD83D\uDED1\uFE0F', color:'var(--accent-red)', rules:[
      { id:'gang-blueprint', name:'Blueprint Wars', content:'Gangs may go to war over blueprints from another gang\'s bench. High-quality roleplay required. One-month cooldown after winning a blueprint. Gangs may not stockpile blueprints.' },
      { id:'gang-disband', name:'Gang Disbandment', content:'Disbanded gangs may no longer operate as a gang. Members must wait 30 days before joining another gang. During cooldown, members roleplay as civilians or small-time criminals.' },
      { id:'gang-inactive', name:'Inactivity & Strikes', content:'Inactive gangs may lose access to bench/warehouse. Rule-breaking involving multiple members results in a gang strike lasting 60 days. Gang leaders are responsible for their members\' actions.' },
      { id:'gang-block', name:'Block Rules — No Baiting, Pushing, Castle Defense', content:'No block baiting. After winning a 5-man fight, gangs may push an opposing gang\'s block immediately with a 30-minute cooldown. Non-whitelisted gangs cannot contest whitelisted gang blocks.' },
      { id:'gang-castle', name:'Castle Rule — Self-Defense Rights', content:'When in your OWNED street/block while passively hanging out and another player shoots first, you may return fire in self-defense. Only applies for whitelisted gangs.' },
      { id:'gang-spray', name:'Spray Rules — Defense Limit', content:'Maximum of five members may defend a spray. Prevents metagaming and unfair advantages.' },
      { id:'gang-thirdparty', name:'Third-Party Discords Prohibited', content:'Use of external Discord servers for RP coordination is strictly prohibited. Ensures transparency, fairness, and encourages in-game communication.' }
    ]}
  ]
};

const DEFAULT_WIKI_PAGES = [
  { id:'welcome', title:'Welcome & Getting Started', content:'# Welcome to City Life Santos Wiki\n\nThis is your gang\'s central hub for all things CityLife Roleplay.\n\n## Quick Start\n- Browse rules in the **Rules** section\n- Mark locations on the **Map**\n- Track warrants and plan with **Calculators**\n- Write strategies in **Wiki Pages**\n\n## Tips\n- Press `Ctrl+K` for quick search\n- Click any rule category to expand it\n- Use map pins to save locations\n- Customize your theme from settings' },
  { id:'spawn-points', title:'Spawn Points & Getaway Routes', content:'# Spawn Points & Getaway Routes\n\n## Key Spawn Areas\n- Paleto Forest — hidden entrance, good for early planning\n- Grapeseat — central location with quick access to everything\n- Route 68 — main highway corridor, use with caution\n\n## Getaway Routes\n- Beach route through del Perro for coastal escapes\n- Highway route via Route 68 to Route 7 for northbound exits\n- Tunnel network under the city for underground escapes\n\n> **Pro tip:** Always map out at least two exit routes before a heist.' },
  { id:'gang-bases', title:'Known Gang Territories & Hot Zones', content:'# Known Gang Territories & Hot Zones\n\n## High-Tier Robbery Locations\n- Maze Bank Tower — highest payout, maximum heat\n- Power Station — mid-tier, frequent police response\n- Chemical Plant — steady income, moderate risk\n- Cargo Ship — outdoor location, requires multiple exits\n\n## Gun Store Locations (Spray Shops)\n- Sandy Shores ATF / Los Santos Police Armory\n- Del Perro Gun Shop\n- Route 68 Guns & Ammo\n- Paleto Forest Sheriff\'s Office vicinity\n\n> Always respect the spray defense limit — maximum 5 defenders.' }
];

let WARRANT_DATA = JSON.parse(localStorage.getItem('cls_warrants') || '[]');
function saveWarrants() { localStorage.setItem('cls_warrants', JSON.stringify(WARRANT_DATA)); }
let FAVORITES = JSON.parse(localStorage.getItem('cls_favorites') || '[]');
function saveFavorites() { localStorage.setItem('cls_favorites', JSON.stringify(FAVORITES)); }
let MAP_PINS = JSON.parse(localStorage.getItem('cls_map_pins') || '[]');
function saveMapPins() { localStorage.setItem('cls_map_pins', JSON.stringify(MAP_PINS)); }
