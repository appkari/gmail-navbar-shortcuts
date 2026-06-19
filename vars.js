const defaultColor = "#444746";
const defaultShowTitles = true;

const iconNames = [
  "inbox",
  "compose",
  "starred",
  "sent",
  "multipleMail",
  "trash",
  "setting",
  "badge",
  "alarm",
  "bell",
  "bookmark",
  "calendar",
  "cloudy",
  "controls",
  "global",
  "graph",
  "home",
  "location",
  "musicPlayer",
  "picture",
  "promotion",
  "target",
];

const defaultLinksMap = new Map([
  [
    "compose",
    {
      url: "https://mail.google.com/mail/u/0/#inbox?compose=new",
      title: "Compose",
      show: true,
    },
  ],
  [
    "inbox",
    {
      url: "https://mail.google.com/mail/u/0/#inbox",
      title: "Inbox",
      show: true,
    },
  ],
  [
    "starred",
    {
      url: "https://mail.google.com/mail/u/0/#starred",
      title: "Starred",
      show: true,
    },
  ],
  [
    "sent",
    {
      url: "https://mail.google.com/mail/u/0/#sent",
      title: "Sent",
      show: true,
    },
  ],
  [
    "trash",
    {
      url: "https://mail.google.com/mail/u/0/#trash",
      title: "Trash",
      show: true,
    },
  ],
  [
    "setting",
    {
      url: "https://mail.google.com/mail/u/0/#settings",
      title: "Settings",
      show: true,
    },
  ],
  [
    "multipleMail",
    {
      url: "https://mail.google.com/mail/u/0/#all",
      title: "All",
      show: true,
    },
  ],
  ["cloudy", { url: "", title: "", show: false }],
  ["badge", { url: "", title: "", show: false }],
  ["alarm", { url: "", title: "", show: false }],
  ["bell", { url: "", title: "", show: false }],
  ["bookmark", { url: "", title: "", show: false }],
  ["calendar", { url: "", title: "", show: false }],
  ["controls", { url: "", title: "", show: false }],
  ["global", { url: "", title: "", show: false }],
  ["graph", { url: "", title: "", show: false }],
  ["home", { url: "", title: "", show: false }],
  ["location", { url: "", title: "", show: false }],
  ["musicPlayer", { url: "", title: "", show: false }],
  ["picture", { url: "", title: "", show: false }],
  ["promotion", { url: "", title: "", show: false }],
  ["target", { url: "", title: "", show: false }],
]);
