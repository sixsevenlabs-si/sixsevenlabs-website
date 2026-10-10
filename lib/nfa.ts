// NFA item status by state. Paste updated rows straight from the spreadsheet (tab-separated, header kept).
const TSV = `
State	Suppressor	SBR	SBS	AOW	Tied to federal registration?	What state law says
Alabama	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs illegal if possessed “in violation of federal law.”
Alaska	Registered only	Registered only	Registered only	Allowed	Yes	Suppressors, SBRs and SBSs legal only if federally registered.
Arizona	Registered only	Registered only	Registered only	Allowed	Yes	May be possessed if “in compliance with federal law.”
Arkansas	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
California	Banned	Banned	Banned	Restricted	Yes	Banned: suppressors, SBRs and SBSs. Registered AOWs legal under PC 17710, except pen guns and assault-weapon configurations.
Colorado	Registered only	Registered only	Registered only	Allowed	Yes	Suppressors, SBRs and SBSs require a “valid permit and license for possession.”
Connecticut	Registered only	Restricted	Registered only	Restricted	Yes	Suppressors and SBSs legal if “licensed or otherwise permitted by federal or state law”. Most semi-auto SBRs are assault weapons.
Delaware	Banned	Restricted	Banned	Restricted	No	Banned: suppressors and SBSs. Semi-auto SBRs are banned too.
District of Columbia	Banned	Banned	Banned	Banned	No	Banned: these items cannot be registered.
Florida	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs banned unless “lawfully owned and possessed under provisions of federal law.”
Georgia	Registered only	Registered only	Registered only	Allowed	Yes	Exempt only if registered “in accordance with the dictates of the National Firearms Act.”
Hawaii	Banned	Banned	Banned	Restricted	No	Banned: suppressors, SBRs and SBSs.
Idaho	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Illinois	Banned	Restricted	Banned	Restricted	No	Banned: suppressors and SBSs. SBRs only for C&R licensees.
Indiana	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Iowa	Registered only	Registered only	Registered only	Allowed	Yes	Felony if possessed “in violation of federal law.”
Kansas	Allowed	Allowed	Registered only	Allowed	Yes	SBSs prohibited unless “in compliance with the national firearms act.”
Kentucky	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Louisiana	Registered only	Registered only	Registered only	Allowed	Yes	Legal only if “registered or transferred” under federal law.
Maine	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Maryland	Allowed	Restricted	Registered only	Restricted	Yes	SBRs and SBSs exempt only if “registered with the federal government”. Some semi-auto SBRs banned.
Massachusetts	Banned	Restricted	Banned	Restricted	No	Banned: suppressors and SBSs. SBRs not transferable in practice.
Michigan	Registered only	Registered only	Registered only	Restricted	Yes	Suppressors legal only if “licensed by the secretary of the treasury”. SBRs and SBSs need federal approval.
Minnesota	Registered only	Allowed	Banned	Allowed	Yes	Suppressors a felony if “not lawfully possessed under federal law”. SBSs banned.
Mississippi	Registered only	Allowed	Allowed	Allowed	Yes	Suppressors a misdemeanor if “not duly authorized under federal law.”
Missouri	Registered only	Registered only	Registered only	Allowed	Yes	An offense if possessed “in violation of federal law.”
Montana	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs exempt with a “valid federal tax stamp.”
Nebraska	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs a felony unless “qualified under the provisions of federal law.”
Nevada	Registered only	Registered only	Registered only	Allowed	Yes	SBRs and SBSs exempt if “registered with the United States Department of the Treasury.”
New Hampshire	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
New Jersey	Banned	Banned	Banned	Restricted	No	Banned: suppressors, SBRs and SBSs.
New Mexico	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
New York	Banned	Banned	Banned	Restricted	No	Banned: no civilian path for suppressors, SBRs or SBSs.
North Carolina	Registered only	Registered only	Registered only	Registered only	Yes	Exempt only if in compliance with the NFA.
North Dakota	Registered only	Registered only	Registered only	Registered only	Yes	Illegal unless the person “has complied with the National Firearms Act.”
Ohio	Registered only	Registered only	Registered only	Allowed	Yes	Exempt if “registered in the national firearms registration and transfer record.”
Oklahoma	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs a felony unless “lawfully possessed under federal law.”
Oregon	Registered only	Registered only	Registered only	Allowed	Yes	Defense only if “registered as required under federal law.”
Pennsylvania	Registered only	Allowed	Registered only	Registered only	Yes	Suppressors and SBSs: defense if the person “complied with the National Firearms Act.”
Rhode Island	Banned	Banned	Banned	Restricted	No	Banned: suppressors, SBRs and SBSs.
South Carolina	Allowed	Registered only	Registered only	Allowed	Yes	SBRs and SBSs banned unless “authorized to possess these weapons by” ATF.
South Dakota	Allowed	Allowed	Registered only	Allowed	Yes	SBSs exempt if registered “with the proper federal authority.”
Tennessee	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Texas	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Utah	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Vermont	Restricted	Allowed	Allowed	Allowed	Yes	Making a suppressor requires an approved Form 1. Possession is not tied.
Virginia	Allowed	Restricted	Registered only	Restricted	Yes	SBRs and SBSs exempt only if “possessed in compliance with federal law.”
Washington	Restricted	Registered only	Banned	Allowed	Yes	Suppressor use lawful only if “legally registered and possessed in accordance with federal law”. SBSs banned.
West Virginia	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
Wisconsin	Registered only	Registered only	Registered only	Allowed	Yes	Felony unless the person “complied with the licensing and registration requirements.”
Wyoming	Allowed	Allowed	Allowed	Allowed	No	No state NFA restriction.
`;

export const CHECKED = "October 9, 2026";

export const ITEMS = ["Suppressor", "SBR", "SBS", "AOW"] as const;
export const STATUSES = ["Allowed", "Registered only", "Restricted", "Banned"] as const;
export const BUCKETS = ["No restriction", "Tied to registration", "Banned"] as const;

export type Status = (typeof STATUSES)[number];
export type Bucket = (typeof BUCKETS)[number];
export type Row = { state: string; items: Status[]; tied: boolean; note: string };

export const NFA: Row[] = TSV.trim()
  .split("\n")
  .slice(1)
  .map((line) => {
    const [state, a, b, c, d, tied, note] = line.split("\t");
    return { state, items: [a, b, c, d] as Status[], tied: tied === "Yes", note };
  });

export const bucket = (r: Row): Bucket =>
  r.tied ? "Tied to registration" : r.items.every((s) => s === "Allowed") ? "No restriction" : "Banned";

// Status colors (see globals.css); always shown next to a text label, never alone.
export const TONE: Record<Status | Bucket, string> = {
  Allowed: "var(--good)",
  "No restriction": "var(--good)",
  "Registered only": "var(--warn)",
  "Tied to registration": "var(--warn)",
  Restricted: "var(--serious)",
  Banned: "var(--critical)",
};
