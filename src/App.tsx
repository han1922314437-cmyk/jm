import { useMemo, useState, type ReactNode } from "react";

const MEMBER_FEE = 12;
const WHATSAPP_URL = "https://api.whatsapp.com/send?phone=60175821875";

const PRICES = {
  weekday: {
    nonMember: 26,
    member: 21,
  },
  weekend: {
    small: {
      nonMemberBase: 79,
      memberBase: 66,
      extraHour: 35,
      unlimitedAddon: 45,
    },
    large: {
      nonMemberBase: 106,
      memberBase: 96,
      extraHour: 45,
      unlimitedAddon: 55,
    },
  },
} as const;

type DayType = "weekday" | "weekend";
type Duration = "2" | "3" | "unlimited";
type RoomType = "small" | "large";
type Language = "en" | "zh";
type Activity = "perler" | "switch-boardgames";
type PerlerPackage = "1h" | "3h" | "5h" | "full-day";

type FeeInput = {
  dayType: DayType;
  pax: number;
  isMember: boolean;
  joinMember: boolean;
  duration: Duration;
};

type FeeBreakdown = {
  total: number;
  title: string;
  details: string[];
};

type Copy = {
  siteTitle: string;
  siteSubtitle: string;
  membershipLabel: string;
  membershipValue: string;
  resultLabel: string;
  languageButton: string;
  languageScreenTitle: string;
  languageScreenSubtitle: string;
  chooseEnglish: string;
  chooseChinese: string;
  chooseEnglishHint: string;
  chooseChineseHint: string;
  hoursTitle: string;
  hoursWeekdayLabel: string;
  hoursWeekdayValue: string;
  hoursWeekendLabel: string;
  hoursWeekendValue: string;
  currentHoursLabel: string;
  currentHoursWeekday: string;
  currentHoursWeekend: string;
  sectionVisitTitle: string;
  sectionVisitSubtitle: string;
  weekdayLabel: string;
  weekdayHint: string;
  weekendLabel: string;
  weekendHint: string;
  sectionPaxTitle: string;
  sectionPaxSubtitle: string;
  paxUnit: string;
  suggestedRoom: string;
  smallRoomLabel: string;
  largeRoomLabel: string;
  sectionMemberTitle: string;
  sectionMemberSubtitle: string;
  notMember: string;
  notMemberHint: string;
  alreadyMember: string;
  alreadyMemberHint: string;
  sectionJoinTitle: string;
  sectionJoinSubtitle: string;
  skipJoin: string;
  skipJoinHint: string;
  joinNow: string;
  joinNowHint: string;
  sectionDurationTitle: string;
  sectionDurationSubtitle: string;
  duration2: string;
  duration3: string;
  durationUnlimited: string;
  detailMemberFee: string;
  detailMemberPricing: string;
  detailNonMemberPricing: string;
  weekdayTitle: string;
  weekdayDetail: (pax: number, rate: number) => string;
  unlimitedTitle: (room: string) => string;
  firstTwoHours: (base: number) => string;
  unlimitedAddon: (amount: number) => string;
  timedTitle: (room: string, hours: number) => string;
  extraHours: (hours: number, amount: number) => string;
  noExtraCharge: string;
  whatsappButton: string;
  whatsappHint: string;
  whatsappIntro: string;
  whatsappVisitType: string;
  whatsappGroupSize: string;
  whatsappMembership: string;
  whatsappDuration: string;
  whatsappEstimatedTotal: string;
  whatsappCurrentHours: string;
  whatsappPreferredDate: string;
  whatsappPreferredTime: string;
  whatsappName: string;
  whatsappPhone: string;
  whatsappMemberYes: string;
  whatsappMemberNo: string;
  whatsappJoinYes: string;
  whatsappJoinNo: string;
  whatsappUnlimited: string;
};

const COPY: Record<Language, Copy> = {
  en: {
    siteTitle: "Fee Calculator",
    siteSubtitle:
      "Weekdays are charged per person. Weekends and public holidays are charged by room. Pick the group size, visit day, and membership status to see the final amount instantly.",
    membershipLabel: "Membership",
    membershipValue: "RM12 / lifetime",
    resultLabel: "Total",
    languageButton: "Change language",
    languageScreenTitle: "Choose your language",
    languageScreenSubtitle: "Please select a language before entering the Joy Move fee calculator.",
    chooseEnglish: "English",
    chooseChinese: "中文",
    chooseEnglishHint: "Enter in English",
    chooseChineseHint: "进入中文页面",
    hoursTitle: "Opening Hours",
    hoursWeekdayLabel: "Mon - Thu",
    hoursWeekdayValue: "5:00 PM - 11:00 PM",
    hoursWeekendLabel: "Fri - Sun & Public Holidays",
    hoursWeekendValue: "1:00 PM - 11:00 PM",
    currentHoursLabel: "Current hours",
    currentHoursWeekday: "5:00 PM - 11:00 PM",
    currentHoursWeekend: "1:00 PM - 11:00 PM",
    sectionVisitTitle: "Visit type",
    sectionVisitSubtitle: "Choose between per-person and per-room pricing",
    weekdayLabel: "Monday to Thursday",
    weekdayHint: "Per person",
    weekendLabel: "Friday to Sunday / Public holiday",
    weekendHint: "Per room",
    sectionPaxTitle: "Group size",
    sectionPaxSubtitle: "The calculator supports 1 to 9 people",
    paxUnit: "pax",
    suggestedRoom: "Suggested room",
    smallRoomLabel: "Small room (1 to 5 pax)",
    largeRoomLabel: "Large room (6 to 9 pax)",
    sectionMemberTitle: "Membership status",
    sectionMemberSubtitle: "Existing members get member pricing right away",
    notMember: "Not a member",
    notMemberHint: "Standard pricing",
    alreadyMember: "Already a member",
    alreadyMemberHint: "Member pricing",
    sectionJoinTitle: "Join membership?",
    sectionJoinSubtitle: "New members can use member pricing immediately",
    skipJoin: "Not this time",
    skipJoinHint: "Keep non-member pricing",
    joinNow: "Join now",
    joinNowHint: "Add RM12 and switch to member pricing",
    sectionDurationTitle: "Play duration",
    sectionDurationSubtitle: "More than 3 hours is treated as unlimited",
    duration2: "2 hours",
    duration3: "3 hours",
    durationUnlimited: "Unlimited",
    detailMemberFee: "Member registration fee",
    detailMemberPricing: "Using member pricing",
    detailNonMemberPricing: "Using non-member pricing",
    weekdayTitle: "Monday to Thursday (charged per person)",
    weekdayDetail: (pax: number, rate: number) => `${pax} pax x RM${rate}`,
    unlimitedTitle: (room: string) => `${room} (unlimited time)`,
    firstTwoHours: (base: number) => `First 2 hours RM${base}`,
    unlimitedAddon: (amount: number) => `Unlimited add-on RM${amount}`,
    timedTitle: (room: string, hours: number) => `${room} for ${hours} hours`,
    extraHours: (hours: number, amount: number) => `Extra ${hours} hour(s) RM${amount}`,
    noExtraCharge: "No extra time charge",
    whatsappButton: "Book on WhatsApp",
    whatsappHint: "Send your current selections directly to our team",
    whatsappIntro: "Hi Joy Move, I would like to make a booking.",
    whatsappVisitType: "Visit type",
    whatsappGroupSize: "Group size",
    whatsappMembership: "Membership",
    whatsappDuration: "Duration",
    whatsappEstimatedTotal: "Estimated total",
    whatsappCurrentHours: "Opening hours",
    whatsappPreferredDate: "Preferred date",
    whatsappPreferredTime: "Preferred time",
    whatsappName: "Name",
    whatsappPhone: "Phone",
    whatsappMemberYes: "Already a member",
    whatsappMemberNo: "Not a member",
    whatsappJoinYes: "Join membership now",
    whatsappJoinNo: "No new membership",
    whatsappUnlimited: "Unlimited",
  },
  zh: {
    siteTitle: "收费计算器",
    siteSubtitle: "工作日按人头收费，周末与公共假期按房间收费。选择人数、日期与会员状态，马上看到总价。",
    membershipLabel: "会员费用",
    membershipValue: "RM12 / 终生",
    resultLabel: "总价",
    languageButton: "切换语言",
    languageScreenTitle: "请选择语言",
    languageScreenSubtitle: "进入 Joy Move 收费计算器前，请先选择你要浏览的语言。",
    chooseEnglish: "English",
    chooseChinese: "中文",
    chooseEnglishHint: "Enter in English",
    chooseChineseHint: "进入中文页面",
    hoursTitle: "营业时间",
    hoursWeekdayLabel: "星期一至星期四",
    hoursWeekdayValue: "下午 5:00 - 晚上 11:00（如果需要3pm-4pm开门，请提前两小时预约）",
    hoursWeekendLabel: "星期五至星期日及公共假期",
    hoursWeekendValue: "下午 1:00 - 晚上 11:00",
    currentHoursLabel: "当前营业时间",
    currentHoursWeekday: "下午 5:00 - 晚上 11:00（如果需要3pm-4pm开门，请提前两小时预约）",
    currentHoursWeekend: "下午 1:00 - 晚上 11:00",
    sectionVisitTitle: "游玩日期",
    sectionVisitSubtitle: "选择按人头收费或按房间收费",
    weekdayLabel: "星期一至星期四",
    weekdayHint: "按人收费",
    weekendLabel: "星期五至星期日 / 公共假期",
    weekendHint: "按房间收费",
    sectionPaxTitle: "人数",
    sectionPaxSubtitle: "计算器支持 1 到 9 人",
    paxUnit: "人",
    suggestedRoom: "推荐房型",
    smallRoomLabel: "小房间（1 到 5 人）",
    largeRoomLabel: "大房间（6 到 9 人）",
    sectionMemberTitle: "会员状态",
    sectionMemberSubtitle: "已有会员可直接享受会员价格",
    notMember: "非会员",
    notMemberHint: "普通价格",
    alreadyMember: "已经是会员",
    alreadyMemberHint: "会员价格",
    sectionJoinTitle: "是否注册会员",
    sectionJoinSubtitle: "新会员可在本次立即使用会员价格",
    skipJoin: "这次不注册",
    skipJoinHint: "保持非会员价格",
    joinNow: "立即注册",
    joinNowHint: "加 RM12 并改用会员价格",
    sectionDurationTitle: "游玩时长",
    sectionDurationSubtitle: "超过 3 小时按无限时处理",
    duration2: "2 小时",
    duration3: "3 小时",
    durationUnlimited: "无限时",
    detailMemberFee: "会员注册费",
    detailMemberPricing: "使用会员价格",
    detailNonMemberPricing: "使用非会员价格",
    weekdayTitle: "星期一至星期四（按人头收费）",
    weekdayDetail: (pax: number, rate: number) => `${pax} 人 x RM${rate}`,
    unlimitedTitle: (room: string) => `${room}（无限时）`,
    firstTwoHours: (base: number) => `前 2 小时 RM${base}`,
    unlimitedAddon: (amount: number) => `无限时加价 RM${amount}`,
    timedTitle: (room: string, hours: number) => `${room} ${hours} 小时`,
    extraHours: (hours: number, amount: number) => `额外 ${hours} 小时 RM${amount}`,
    noExtraCharge: "没有额外时长费用",
    whatsappButton: "WhatsApp 预约",
    whatsappHint: "把当前选择直接发送给我们团队",
    whatsappIntro: "你好，我想预约 Joy Move。",
    whatsappVisitType: "日期类型",
    whatsappGroupSize: "人数",
    whatsappMembership: "会员状态",
    whatsappDuration: "时长",
    whatsappEstimatedTotal: "预估总价",
    whatsappCurrentHours: "营业时间",
    whatsappPreferredDate: "预约日期",
    whatsappPreferredTime: "预约时间",
    whatsappName: "称呼",
    whatsappPhone: "电话号码",
    whatsappMemberYes: "已经是会员",
    whatsappMemberNo: "非会员",
    whatsappJoinYes: "本次注册会员",
    whatsappJoinNo: "本次不注册会员",
    whatsappUnlimited: "无限时",
  },
};

const ACTIVITY_COPY = {
  en: {
    button: "Change activity",
    label: "Selected activity",
    screenTitle: "Choose your activity",
    screenSubtitle: "Please select what you would like to play before entering the fee calculator.",
    whatsappLabel: "Activity",
    perler: {
      title: "Perler Beads",
    },
    switchBoardgames: {
      title: "Nintendo Switch + Board Games",
    },
  },
  zh: {
    button: "\u5207\u6362\u9879\u76ee",
    label: "\u5df2\u9009\u9879\u76ee",
    screenTitle: "\u8bf7\u9009\u62e9\u6e38\u73a9\u9879\u76ee",
    screenSubtitle: "\u8fdb\u5165 Joy Move \u6536\u8d39\u8ba1\u7b97\u5668\u524d\uff0c\u8bf7\u5148\u9009\u62e9\u60f3\u4f53\u9a8c\u7684\u9879\u76ee\u3002",
    whatsappLabel: "\u6e38\u73a9\u9879\u76ee",
    perler: {
      title: "Perler Beads \u62fc\u8c46",
    },
    switchBoardgames: {
      title: "Nintendo Switch + \u684c\u6e38",
    },
  },
} as const;

const PERLER_COPY = {
  en: {
    pageTitle: "Perler Beads",
    pageSubtitle:
      "Perler Beads are priced per person. Choose 1 hour, 3 hours, 5 hours, or a full-day pass. Full-day rates depend on the visit day.",
    rateLabel: "Per person",
    rateValue: "From RM15",
    paxTitle: "Group size",
    paxSubtitle: "Choose how many people will join",
    dayTitle: "Visit day",
    daySubtitle: "Full-day pricing changes by day",
    packageTitle: "Choose a package",
    packageSubtitle: "All prices are charged per person",
    package1Label: "1 hour",
    package3Label: "3 hours",
    package5Label: "5 hours",
    packageFullDayLabel: "Full Day",
    noteTitle: "Bead-picking note",
    noteSubtitle: "This is for display only, not an automatic fee",
    noteFreeTime: "Each guest gets 10 minutes of free bead-picking time.",
    noteExtraCharge: "If bead-picking time exceeds 15 minutes, it will be charged as an extra 30 minutes.",
    noteCourtesy: "Please plan your selection time so no extra fee is incurred. Thank you for your understanding and cooperation.",
    resultTitle: (pax: number, packageLabel: string) => `${pax} pax - ${packageLabel}`,
    detailLine: (pax: number, packageLabel: string, pricePerPax: number) =>
      `${pax} pax x ${packageLabel} x ${formatMoney(pricePerPax)}`,
    whatsappIntro: "Hi Joy Move, I would like to book Perler Beads.",
    whatsappPackage: "Package",
    whatsappDay: "Visit day",
  },
  zh: {
    pageTitle: "Perler Beads \u62fc\u8c46",
    pageSubtitle:
      "\u62fc\u8c46\u6309\u6bcf\u4f4d\u987e\u5ba2\u8ba1\u4ef7\uff0c\u53ef\u9009 1 \u5c0f\u65f6\u30013 \u5c0f\u65f6\u30015 \u5c0f\u65f6\u6216\u5168\u5929\u7968\uff0c\u5168\u5929\u7968\u4ef7\u683c\u4f1a\u6839\u636e\u51fa\u73b0\u65e5\u671f\u4e0d\u540c\u3002",
    rateLabel: "\u6bcf\u4eba\u4ef7\u683c",
    rateValue: "\u8d77\u4ef7 RM15",
    paxTitle: "\u4eba\u6570",
    paxSubtitle: "\u9009\u62e9\u53c2\u4e0e\u7684\u4eba\u6570",
    dayTitle: "\u9884\u7ea6\u65e5\u671f",
    daySubtitle: "\u5168\u5929\u7968\u4ef7\u683c\u4f1a\u6839\u636e\u65e5\u671f\u4e0d\u540c",
    packageTitle: "\u9009\u62e9\u5957\u9910",
    packageSubtitle: "\u4ef7\u683c\u5747\u4ee5\u6bcf\u4f4d\u987e\u5ba2\u8ba1\u7b97",
    package1Label: "1 \u5c0f\u65f6",
    package3Label: "3 \u5c0f\u65f6",
    package5Label: "5 \u5c0f\u65f6",
    packageFullDayLabel: "\u5168\u5929\u7968",
    noteTitle: "\u89c4\u5219\u8bf4\u660e",
    noteSubtitle: "\u4ec5\u4f9b\u5c55\u793a\uff0c\u4e0d\u4f5c\u81ea\u52a8\u8ba1\u8d39",
    noteFreeTime: "\u6bcf\u4f4d\u987e\u5ba2\u53ef\u4eab\u670910\u5206\u949f\u514d\u8d39\u9009\u8c46\u65f6\u95f4\u3002",
    noteExtraCharge: "\u5982\u679c\u62fc\u8c46\u65f6\u95f4\u8d85\u8fc7 15 \u5206\u949f\uff0c\u5c06\u6309\u989d\u5916 30 \u5206\u949f\u8ba1\u8d39\u3002",
    noteCourtesy: "\u4e3a\u907f\u514d\u4ea7\u751f\u989d\u5916\u8d39\u7528\uff0c\u8bf7\u5408\u7406\u5b89\u6392\u62fc\u8c46\u65f6\u95f4\uff0c\u8c22\u8c22\u60a8\u7684\u7406\u89e3\u4e0e\u914d\u5408\u3002",
    resultTitle: (pax: number, packageLabel: string) => `${pax} \u4eba - ${packageLabel}`,
    detailLine: (pax: number, packageLabel: string, pricePerPax: number) =>
      `${pax} \u4eba x ${packageLabel} x ${formatMoney(pricePerPax)}`,
    whatsappIntro: "\u4f60\u597d\uff0c\u6211\u60f3\u9884\u7ea6 Joy Move \u7684 Perler Beads \u62fc\u8c46\u4f53\u9a8c\u3002",
    whatsappPackage: "\u5957\u9910",
    whatsappDay: "\u51fa\u73b0\u65e5\u671f",
  },
} as const;
const PERLER_PRICES = {
  "1h": 15,
  "3h": 39,
  "5h": 59,
  "full-day": {
    weekday: 79.9,
    weekend: 99.9,
  },
} as const;

function formatMoney(amount: number): string {
  return Number.isInteger(amount) ? `RM${amount}` : `RM${amount.toFixed(2)}`;
}

function getPerlerPackagePrice(perlerPackage: PerlerPackage, dayType: DayType): number {
  if (perlerPackage === "full-day") {
    return dayType === "weekday" ? PERLER_PRICES["full-day"].weekday : PERLER_PRICES["full-day"].weekend;
  }

  return PERLER_PRICES[perlerPackage];
}

function getPerlerPackageLabel(
  copy: Copy,
  perlerCopy: {
    package1Label: string;
    package3Label: string;
    package5Label: string;
    packageFullDayLabel: string;
  },
  perlerPackage: PerlerPackage,
  dayType: DayType,
): string {
  if (perlerPackage === "1h") {
    return perlerCopy.package1Label;
  }

  if (perlerPackage === "3h") {
    return perlerCopy.package3Label;
  }

  if (perlerPackage === "5h") {
    return perlerCopy.package5Label;
  }

  const dayLabel = dayType === "weekday" ? copy.weekdayLabel : copy.weekendLabel;
  const price = formatMoney(getPerlerPackagePrice(perlerPackage, dayType));
  return `${perlerCopy.packageFullDayLabel} (${dayLabel} ${price})`;
}

function calculatePerlerTotal(pax: number, perlerPackage: PerlerPackage, dayType: DayType): number {
  const safePax = Math.min(9, Math.max(1, Number(pax) || 1));
  return safePax * getPerlerPackagePrice(perlerPackage, dayType);
}

const PERLER_TEST_CASES: Array<{ name: string; pax: number; perlerPackage: PerlerPackage; dayType: DayType; expected: number }> = [
  {
    name: "Perler 1 hour package",
    pax: 2,
    perlerPackage: "1h",
    dayType: "weekday",
    expected: 30,
  },
  {
    name: "Perler 3 hours package",
    pax: 3,
    perlerPackage: "3h",
    dayType: "weekday",
    expected: 117,
  },
  {
    name: "Perler 5 hours package",
    pax: 4,
    perlerPackage: "5h",
    dayType: "weekend",
    expected: 236,
  },
  {
    name: "Perler full day weekday",
    pax: 1,
    perlerPackage: "full-day",
    dayType: "weekday",
    expected: 79.9,
  },
  {
    name: "Perler full day weekend",
    pax: 2,
    perlerPackage: "full-day",
    dayType: "weekend",
    expected: 199.8,
  },
];

function assertPerlerPricing(): void {
  const failures = PERLER_TEST_CASES.filter(
    (test) => Math.abs(calculatePerlerTotal(test.pax, test.perlerPackage, test.dayType) - test.expected) > 0.0001,
  );

  if (failures.length > 0) {
    throw new Error(
      `Perler pricing assertion failed: ${failures
        .map((test) => `${test.name} expected ${test.expected}, got ${calculatePerlerTotal(test.pax, test.perlerPackage, test.dayType)}`)
        .join("; ")}`,
    );
  }
}
function getRoomType(pax: number): RoomType {
  return pax <= 5 ? "small" : "large";
}

function getRoomLabel(copy: Copy, roomType: RoomType): string {
  return roomType === "small" ? copy.smallRoomLabel.split("（")[0].split(" (")[0] : copy.largeRoomLabel.split("（")[0].split(" (")[0];
}

function calculateJoyMoveFee({
  dayType,
  pax,
  isMember,
  duration,
  language,
}: Omit<FeeInput, "joinMember"> & { language: Language }): FeeBreakdown {
  const safePax = Math.min(9, Math.max(1, Number(pax) || 1));
  const copy = COPY[language];

  if (dayType === "weekday") {
    const rate = isMember ? PRICES.weekday.member : PRICES.weekday.nonMember;
    return {
      total: safePax * rate,
      title: copy.weekdayTitle,
      details: [copy.weekdayDetail(safePax, rate)],
    };
  }

  const roomType = getRoomType(safePax);
  const room = PRICES.weekend[roomType];
  const base = isMember ? room.memberBase : room.nonMemberBase;
  const roomLabel = getRoomLabel(copy, roomType);

  if (duration === "unlimited") {
    return {
      total: base + room.unlimitedAddon,
      title: copy.unlimitedTitle(roomLabel),
      details: [copy.firstTwoHours(base), copy.unlimitedAddon(room.unlimitedAddon)],
    };
  }

  const hours = Math.max(2, Number(duration) || 2);
  const extra = Math.max(0, hours - 2) * room.extraHour;

  return {
    total: base + extra,
    title: copy.timedTitle(roomLabel, hours),
    details: [copy.firstTwoHours(base), hours > 2 ? copy.extraHours(hours - 2, extra) : copy.noExtraCharge],
  };
}

function calculateTotalWithMembership(input: FeeInput): number {
  const finalIsMember = input.isMember || input.joinMember;
  const baseResult = calculateJoyMoveFee({
    dayType: input.dayType,
    pax: input.pax,
    isMember: finalIsMember,
    duration: input.duration,
    language: "en",
  });
  return baseResult.total + (input.joinMember ? MEMBER_FEE : 0);
}

const TEST_CASES: Array<{ name: string; input: FeeInput; expected: number }> = [
  {
    name: "Weekday non-member, 2 pax",
    input: { dayType: "weekday", pax: 2, isMember: false, joinMember: false, duration: "2" },
    expected: 52,
  },
  {
    name: "Weekday new member registration uses member rate plus RM12",
    input: { dayType: "weekday", pax: 2, isMember: false, joinMember: true, duration: "2" },
    expected: 54,
  },
  {
    name: "Weekend small room new member registration uses member rate plus RM12",
    input: { dayType: "weekend", pax: 4, isMember: false, joinMember: true, duration: "3" },
    expected: 113,
  },
  {
    name: "Weekend large room member unlimited",
    input: { dayType: "weekend", pax: 6, isMember: true, joinMember: false, duration: "unlimited" },
    expected: 151,
  },
];

function assertPricing(): void {
  const failures = TEST_CASES.filter((test) => calculateTotalWithMembership(test.input) !== test.expected);

  if (failures.length > 0) {
    throw new Error(
      `Pricing assertion failed: ${failures
        .map((test) => `${test.name} expected ${test.expected}, got ${calculateTotalWithMembership(test.input)}`)
        .join("; ")}`,
    );
  }
}

function formatMembership(copy: Copy, isMember: boolean, joinMember: boolean): string {
  if (isMember) {
    return copy.whatsappMemberYes;
  }

  return joinMember ? `${copy.whatsappMemberNo} / ${copy.whatsappJoinYes}` : `${copy.whatsappMemberNo} / ${copy.whatsappJoinNo}`;
}

function formatDuration(copy: Copy, duration: Duration): string {
  if (duration === "2") {
    return copy.duration2;
  }

  if (duration === "3") {
    return copy.duration3;
  }

  return copy.whatsappUnlimited;
}

function formatActivity(language: Language, activity: Activity): string {
  const activityCopy = ACTIVITY_COPY[language];
  return activity === "perler" ? activityCopy.perler.title : activityCopy.switchBoardgames.title;
}

function buildWhatsAppLink({
  language,
  copy,
  activity,
  dayType,
  pax,
  isMember,
  joinMember,
  weekendDuration,
  total,
  currentHours,
}: {
  language: Language;
  copy: Copy;
  activity: Activity;
  dayType: DayType;
  pax: number;
  isMember: boolean;
  joinMember: boolean;
  weekendDuration: Duration;
  total: number;
  currentHours: string;
}): string {
  const visitType = dayType === "weekday" ? copy.weekdayLabel : copy.weekendLabel;
  const activityCopy = ACTIVITY_COPY[language];
  const messageLines = [
    copy.whatsappIntro,
    "",
    `${activityCopy.whatsappLabel}: ${formatActivity(language, activity)}`,
    `${copy.whatsappVisitType}: ${visitType}`,
    `${copy.whatsappGroupSize}: ${pax} ${copy.paxUnit}`,
    `${copy.whatsappMembership}: ${formatMembership(copy, isMember, joinMember)}`,
    `${copy.whatsappEstimatedTotal}: RM${total}`,
    `${copy.whatsappCurrentHours}: ${currentHours}`,
    "",
    `${copy.whatsappPreferredDate}: `,
    `${copy.whatsappPreferredTime}: `,
    `${copy.whatsappName}: `,
    `${copy.whatsappPhone}: `,
  ];

  if (dayType === "weekend") {
    messageLines.splice(6, 0, `${copy.whatsappDuration}: ${formatDuration(copy, weekendDuration)}`);
  }

  return `${WHATSAPP_URL}&text=${encodeURIComponent(messageLines.join("\n"))}`;
}

function buildPerlerWhatsAppLink({
  language,
  copy,
  pax,
  dayType,
  perlerPackage,
  total,
}: {
  language: Language;
  copy: Copy;
  pax: number;
  dayType: DayType;
  perlerPackage: PerlerPackage;
  total: number;
}): string {
  const activityCopy = ACTIVITY_COPY[language];
  const perlerCopy = PERLER_COPY[language];
  const packageLabel = getPerlerPackageLabel(copy, perlerCopy, perlerPackage, dayType);
  const message = [
    perlerCopy.whatsappIntro,
    "",
    `${activityCopy.whatsappLabel}: ${activityCopy.perler.title}`,
    `${perlerCopy.whatsappDay}: ${dayType === "weekday" ? copy.weekdayLabel : copy.weekendLabel}`,
    `${perlerCopy.whatsappPackage}: ${packageLabel}`,
    `${copy.whatsappGroupSize}: ${pax} ${copy.paxUnit}`,
    `${copy.whatsappEstimatedTotal}: ${formatMoney(total)}`,
    "",
    perlerCopy.noteFreeTime,
    perlerCopy.noteExtraCharge,
    "",
    `${copy.whatsappPreferredDate}: `,
    `${copy.whatsappPreferredTime}: `,
    `${copy.whatsappName}: `,
    `${copy.whatsappPhone}: `,
  ].join("\n");

  return `${WHATSAPP_URL}&text=${encodeURIComponent(message)}`;
}
assertPricing();
assertPerlerPricing();

export default function App() {
  const [language, setLanguage] = useState<Language | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [dayType, setDayType] = useState<DayType>("weekday");
  const [pax, setPax] = useState(2);
  const [perlerPackage, setPerlerPackage] = useState<PerlerPackage>("1h");
  const [isMember, setIsMember] = useState(false);
  const [joinMember, setJoinMember] = useState(false);
  const [weekendDuration, setWeekendDuration] = useState<Duration>("2");

  const fallbackLanguage: Language = language ?? "en";
  const copy = COPY[fallbackLanguage];
  const activityCopy = ACTIVITY_COPY[fallbackLanguage];
  const perlerCopy = PERLER_COPY[fallbackLanguage];
  const finalIsMember = isMember || joinMember;
  const roomType = getRoomType(pax);
  const currentHours = dayType === "weekday" ? copy.currentHoursWeekday : copy.currentHoursWeekend;
  const perlerPackagePrice = getPerlerPackagePrice(perlerPackage, dayType);
  const perlerPackageLabel = getPerlerPackageLabel(copy, perlerCopy, perlerPackage, dayType);
  const perlerTotal = calculatePerlerTotal(pax, perlerPackage, dayType);

  const result = useMemo(() => {
    const baseResult = calculateJoyMoveFee({
      dayType,
      pax,
      isMember: finalIsMember,
      duration: weekendDuration,
      language: fallbackLanguage,
    });

    const details = [...baseResult.details];
    let total = baseResult.total;

    if (joinMember) {
      total += MEMBER_FEE;
      details.push(`${copy.detailMemberFee} RM${MEMBER_FEE}`);
    }

    details.push(finalIsMember ? copy.detailMemberPricing : copy.detailNonMemberPricing);

    return { ...baseResult, total, details };
  }, [
    copy.detailMemberFee,
    copy.detailMemberPricing,
    copy.detailNonMemberPricing,
    dayType,
    fallbackLanguage,
    finalIsMember,
    joinMember,
    pax,
    weekendDuration,
  ]);

  const whatsappLink = buildWhatsAppLink({
    language: fallbackLanguage,
    copy,
    activity: activity ?? "perler",
    dayType,
    pax,
    isMember,
    joinMember,
    weekendDuration,
    total: result.total,
    currentHours,
  });

  const perlerWhatsappLink = buildPerlerWhatsAppLink({
    language: fallbackLanguage,
    copy,
    pax,
    dayType,
    perlerPackage,
    total: perlerTotal,
  });
  const perlerPackageChoices = [
    {
      value: "1h" as const,
      label: perlerCopy.package1Label,
      price: formatMoney(getPerlerPackagePrice("1h", dayType)),
    },
    {
      value: "3h" as const,
      label: perlerCopy.package3Label,
      price: formatMoney(getPerlerPackagePrice("3h", dayType)),
    },
    {
      value: "5h" as const,
      label: perlerCopy.package5Label,
      price: formatMoney(getPerlerPackagePrice("5h", dayType)),
    },
    {
      value: "full-day" as const,
      label: perlerCopy.packageFullDayLabel,
      price: `${copy.weekdayLabel} ${formatMoney(getPerlerPackagePrice("full-day", "weekday"))}\n${copy.weekendLabel} ${formatMoney(getPerlerPackagePrice("full-day", "weekend"))}`,
    },
  ];
  if (language === null) {
    return (
      <div className="app-shell language-shell">
        <div className="background-orb orb-one" />
        <div className="background-orb orb-two" />
        <div className="background-orb orb-three" />

        <main className="language-layout">
          <section className="language-panel panel">
            <p className="eyebrow">Joy Move</p>
            <h1>{COPY.en.languageScreenTitle}</h1>
            <p className="hero-copy">{COPY.en.languageScreenSubtitle}</p>
            <p className="hero-copy alt-copy">{COPY.zh.languageScreenSubtitle}</p>

            <div className="language-choice-grid">
              <button type="button" className="language-choice" onClick={() => setLanguage("en")}>
                <strong>{COPY.en.chooseEnglish}</strong>
                <span>{COPY.en.chooseEnglishHint}</span>
              </button>
              <button type="button" className="language-choice" onClick={() => setLanguage("zh")}>
                <strong>{COPY.zh.chooseChinese}</strong>
                <span>{COPY.zh.chooseChineseHint}</span>
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (activity === null) {
    return (
      <div className="app-shell language-shell">
        <div className="background-orb orb-one" />
        <div className="background-orb orb-two" />
        <div className="background-orb orb-three" />

        <main className="language-layout">
          <section className="language-panel panel">
            <p className="eyebrow">Joy Move</p>
            <h1>{activityCopy.screenTitle}</h1>
            <p className="hero-copy">{activityCopy.screenSubtitle}</p>

            <div className="language-choice-grid">
              <button type="button" className="language-choice" onClick={() => setActivity("perler")}>
                <strong>{activityCopy.perler.title}</strong>
              </button>
              <button type="button" className="language-choice" onClick={() => setActivity("switch-boardgames")}>
                <strong>{activityCopy.switchBoardgames.title}</strong>
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
  function handleMemberStatus(value: boolean) {
    setIsMember(value);
    if (value) {
      setJoinMember(false);
    }
  }

  if (activity === "perler") {
    return (
      <div className="app-shell">
        <div className="background-orb orb-one" />
        <div className="background-orb orb-two" />
        <div className="background-orb orb-three" />

        <main className="layout">
          <header className="hero panel">
            <div className="hero-copy-block">
              <p className="eyebrow">Joy Move</p>
              <h1>{perlerCopy.pageTitle}</h1>
            </div>

            <div className="hero-actions">
              <button type="button" className="language-switch" onClick={() => setLanguage(null)}>
                {copy.languageButton}
              </button>
              <button type="button" className="language-switch" onClick={() => setActivity(null)}>
                {activityCopy.button}
              </button>
              <div className="activity-tag">
                <span>{activityCopy.label}</span>
                <strong>{formatActivity(fallbackLanguage, activity)}</strong>
              </div>
              <div className="member-tag">
                <span>{perlerCopy.rateLabel}</span>
                <strong>{perlerCopy.rateValue}</strong>
              </div>
            </div>
          </header>

          <section className="content-grid">
            <div className="panel controls-panel">
              <Section step="01" title={perlerCopy.paxTitle} subtitle={perlerCopy.paxSubtitle}>
                <div className="counter-card">
                  <button type="button" className="counter-button" onClick={() => setPax((value) => Math.max(1, value - 1))}>
                    -
                  </button>
                  <div className="counter-value">
                    <strong>{pax}</strong>
                    <span>{copy.paxUnit}</span>
                  </div>
                  <button type="button" className="counter-button" onClick={() => setPax((value) => Math.min(9, value + 1))}>
                    +
                  </button>
                </div>
              </Section>

              <Section step="02" title={perlerCopy.dayTitle} subtitle="">
                <div className="choice-grid two-cols">
                  <Choice active={dayType === "weekday"} onClick={() => setDayType("weekday")}>
                    <span>{copy.weekdayLabel}</span>
                  </Choice>
                  <Choice active={dayType === "weekend"} onClick={() => setDayType("weekend")}>
                    <span>{copy.weekendLabel}</span>
                  </Choice>
                </div>
              </Section>

              <Section step="03" title={perlerCopy.packageTitle} subtitle={perlerCopy.packageSubtitle}>
                <div className="choice-grid package-grid">
                  {perlerPackageChoices.map((choice) => (
                    <Choice key={choice.value} active={perlerPackage === choice.value} onClick={() => setPerlerPackage(choice.value)}>
                      <span>{choice.label}</span>
                      <small>{choice.price}</small>
                    </Choice>
                  ))}
                </div>
              </Section>

              <div className="note-box">
                <h3>{perlerCopy.noteTitle}</h3>
                <ul>
                  <li>{perlerCopy.noteFreeTime}</li>
                  <li>{perlerCopy.noteExtraCharge}</li>
                  <li>{perlerCopy.noteCourtesy}</li>
                </ul>
              </div>
            </div>

            <aside className="panel result-panel">
              <p className="result-label">{copy.resultLabel}</p>
              <div className="result-card">
                <div className="price">{formatMoney(perlerTotal)}</div>
                <h2>{perlerCopy.resultTitle(pax, perlerPackageLabel)}</h2>
              </div>

              <div className="detail-list">
                <div className="detail-row">
                  <span className="detail-dot">OK</span>
                  <span>{perlerCopy.detailLine(pax, perlerPackageLabel, perlerPackagePrice)}</span>
                </div>
              </div>

              <a className="whatsapp-book-button" href={perlerWhatsappLink} target="_blank" rel="noreferrer">
                {copy.whatsappButton}
              </a>
              <p className="whatsapp-book-hint">{copy.whatsappHint}</p>
            </aside>
          </section>
        </main>
      </div>
    );
  }
  return (
    <div className="app-shell">
      <div className="background-orb orb-one" />
      <div className="background-orb orb-two" />
      <div className="background-orb orb-three" />

      <main className="layout">
        <header className="hero panel">
          <div className="hero-copy-block">
            <p className="eyebrow">Joy Move</p>
            <h1>{copy.siteTitle}</h1>
            <p className="hero-copy">{copy.siteSubtitle}</p>

          </div>

          <div className="hero-actions">
            <button type="button" className="language-switch" onClick={() => setLanguage(null)}>
              {copy.languageButton}
            </button>
            <button type="button" className="language-switch" onClick={() => setActivity(null)}>
              {activityCopy.button}
            </button>
            <div className="activity-tag">
              <span>{activityCopy.label}</span>
              <strong>{formatActivity(fallbackLanguage, activity)}</strong>
            </div>
            <div className="member-tag">
              <span>{copy.membershipLabel}</span>
              <strong>{copy.membershipValue}</strong>
            </div>
          </div>
        </header>

        <section className="content-grid">
          <div className="panel controls-panel">
            <Section step="01" title={copy.sectionVisitTitle} subtitle={copy.sectionVisitSubtitle}>
              <div className="choice-grid two-cols">
                <Choice active={dayType === "weekday"} onClick={() => setDayType("weekday")}>
                  <span>{copy.weekdayLabel}</span>
                  <small>{copy.weekdayHint}</small>
                </Choice>
                <Choice active={dayType === "weekend"} onClick={() => setDayType("weekend")}>
                  <span>{copy.weekendLabel}</span>
                  <small>{copy.weekendHint}</small>
                </Choice>
              </div>
            </Section>

            <Section step="02" title={copy.sectionPaxTitle} subtitle={copy.sectionPaxSubtitle}>
              <div className="counter-card">
                <button type="button" className="counter-button" onClick={() => setPax((value) => Math.max(1, value - 1))}>
                  -
                </button>
                <div className="counter-value">
                  <strong>{pax}</strong>
                  <span>{copy.paxUnit}</span>
                </div>
                <button type="button" className="counter-button" onClick={() => setPax((value) => Math.min(9, value + 1))}>
                  +
                </button>
              </div>

              {dayType === "weekend" && (
                <div className="hint-box">
                  {copy.suggestedRoom}: {roomType === "small" ? copy.smallRoomLabel : copy.largeRoomLabel}
                </div>
              )}
            </Section>

            <Section step="03" title={copy.sectionMemberTitle} subtitle={copy.sectionMemberSubtitle}>
              <div className="choice-grid two-cols">
                <Choice active={!isMember} onClick={() => handleMemberStatus(false)}>
                  <span>{copy.notMember}</span>
                  <small>{copy.notMemberHint}</small>
                </Choice>
                <Choice active={isMember} onClick={() => handleMemberStatus(true)}>
                  <span>{copy.alreadyMember}</span>
                  <small>{copy.alreadyMemberHint}</small>
                </Choice>
              </div>
            </Section>

            {!isMember && (
              <Section step="04" title={copy.sectionJoinTitle} subtitle={copy.sectionJoinSubtitle}>
                <div className="choice-grid two-cols">
                  <Choice active={!joinMember} onClick={() => setJoinMember(false)}>
                    <span>{copy.skipJoin}</span>
                    <small>{copy.skipJoinHint}</small>
                  </Choice>
                  <Choice active={joinMember} onClick={() => setJoinMember(true)}>
                    <span>{copy.joinNow}</span>
                    <small>{copy.joinNowHint}</small>
                  </Choice>
                </div>
              </Section>
            )}

            {dayType === "weekend" && (
              <Section step={isMember ? "04" : "05"} title={copy.sectionDurationTitle} subtitle={copy.sectionDurationSubtitle}>
                <div className="choice-grid three-cols">
                  <Choice active={weekendDuration === "2"} onClick={() => setWeekendDuration("2")}>
                    <span>{copy.duration2}</span>
                  </Choice>
                  <Choice active={weekendDuration === "3"} onClick={() => setWeekendDuration("3")}>
                    <span>{copy.duration3}</span>
                  </Choice>
                  <Choice active={weekendDuration === "unlimited"} onClick={() => setWeekendDuration("unlimited")}>
                    <span>{copy.durationUnlimited}</span>
                  </Choice>
                </div>
              </Section>
            )}
          </div>

          <aside className="panel result-panel">
            <p className="result-label">{copy.resultLabel}</p>
            <div className="result-card">
              <div className="price">RM{result.total}</div>
              <h2>{result.title}</h2>
            </div>

            <div className="detail-list">
              {result.details.map((item) => (
                <div key={item} className="detail-row">
                  <span className="detail-dot">OK</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <a className="whatsapp-book-button" href={whatsappLink} target="_blank" rel="noreferrer">
              {copy.whatsappButton}
            </a>
            <p className="whatsapp-book-hint">{copy.whatsappHint}</p>
          </aside>
        </section>
      </main>
    </div>
  );
}

type SectionProps = {
  step: string;
  title: string;
  subtitle: string;
  children: ReactNode;
};

function Section({ step, title, subtitle, children }: SectionProps) {
  return (
    <section className="section-card">
      <div className="section-head">
        <div>
          <p className="section-step">{step}</p>
          <h3>{title}</h3>
          {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
        </div>
      </div>
      {children}
    </section>
  );
}

type ChoiceProps = {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
};

function Choice({ active, onClick, children }: ChoiceProps) {
  return (
    <button type="button" className={active ? "choice active" : "choice"} onClick={onClick}>
      {children}
    </button>
  );
}
