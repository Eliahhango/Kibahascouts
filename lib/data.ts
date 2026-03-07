import type {
  Campaign,
  FAQ,
  LeaderProfile,
  MediaItem,
  NewsArticle,
  Programme,
  Resource,
  ScoutEvent,
  ScoutUnit,
  TimelineEntry,
} from "./types"

// SAMPLE DATA ONLY:
// Replace these records with verified district content in Firestore before publishing production content.
export const SAMPLE_DATA_NOTICE =
  "Sample / Draft content is active. Replace every placeholder with verified district information before production publishing."

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    slug: "district-programme-update",
    title: "[SAMPLE] District Programme Update",
    summary: "Replace this summary with a verified district update.",
    content:
      "This is sample newsroom content. Replace with verified district information before publication.",
    category: "Announcements",
    image: "/images/news/scout-week.jpg",
    author: "[CONFIRM AUTHOR]",
    date: "2026-02-01",
    readingTime: "2 min read",
    tags: ["Sample"],
    featured: true,
    published: true,
  },
  {
    id: "n2",
    slug: "leader-training-notice",
    title: "[SAMPLE] Leader Training Notice",
    summary: "Verified training details will be published by the district office.",
    content:
      "This is sample training content. Replace date, venue, and training scope with verified details.",
    category: "Training",
    image: "/images/news/woodbadge.jpg",
    author: "[CONFIRM AUTHOR]",
    date: "2026-01-20",
    readingTime: "2 min read",
    tags: ["Training", "Sample"],
    published: true,
  },
  {
    id: "n3",
    slug: "new-scout-hall-construction-begins",
    title: "[SAMPLE] District Infrastructure Update",
    summary: "Infrastructure updates are pending verification.",
    content:
      "This is sample infrastructure content. Replace milestones and implementation details with verified updates.",
    category: "Announcements",
    image: "/images/news/construction.jpg",
    author: "[CONFIRM AUTHOR]",
    date: "2026-01-10",
    readingTime: "2 min read",
    tags: ["Infrastructure", "Sample"],
    published: true,
  },
  {
    id: "n4",
    slug: "community-service-planning",
    title: "[SAMPLE] Community Service Planning",
    summary: "Service plans will be published after district approval.",
    content:
      "This is sample community service content. Replace activity details and outcomes with verified records.",
    category: "Community Service",
    image: "/images/news/hygiene.jpg",
    author: "[CONFIRM AUTHOR]",
    date: "2025-12-15",
    readingTime: "2 min read",
    tags: ["Community Service", "Sample"],
    published: true,
  },
]

export const scoutEvents: ScoutEvent[] = [
  {
    id: "e1",
    slug: "leader-training-weekend",
    title: "[SAMPLE] Leader Training Weekend",
    description: "Replace this with verified training objectives and attendance instructions.",
    date: "2026-03-22",
    endDate: "2026-03-23",
    time: "[CONFIRM TIME]",
    location: "[CONFIRM VENUE]",
    image: "/images/events/training.jpg",
    registrationOpen: true,
    registrationUrl: "",
    category: "Training",
    published: true,
  },
  {
    id: "e2",
    slug: "district-community-day",
    title: "[SAMPLE] District Community Day",
    description: "Replace with verified event scope and participation details.",
    date: "2026-03-30",
    time: "[CONFIRM TIME]",
    location: "[CONFIRM VENUE]",
    image: "/images/events/cleanup.jpg",
    registrationOpen: false,
    registrationUrl: "",
    category: "Service",
    published: true,
  },
  {
    id: "e3",
    slug: "youth-orientation-session",
    title: "[SAMPLE] Youth Orientation Session",
    description: "Replace with verified onboarding and safeguarding briefing details.",
    date: "2026-04-05",
    time: "[CONFIRM TIME]",
    location: "[CONFIRM VENUE]",
    image: "/images/events/parents.jpg",
    registrationOpen: true,
    registrationUrl: "",
    category: "Orientation",
    published: true,
  },
  {
    id: "e4",
    slug: "district-camp-planning-meeting",
    title: "[SAMPLE] District Camp Planning Meeting",
    description: "Replace with verified planning agenda and participant list.",
    date: "2026-04-12",
    time: "[CONFIRM TIME]",
    location: "[CONFIRM VENUE]",
    image: "/images/events/camporee.jpg",
    registrationOpen: false,
    registrationUrl: "",
    category: "Planning",
    published: true,
  },
]

export const resources: Resource[] = [
  {
    id: "r1",
    slug: "membership-registration-form",
    title: "Membership Registration Form",
    summary: "Verified downloadable file pending upload.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "[CONFIRM FILE SIZE]",
    publishDate: "2026-01-15",
    downloadUrl: "",
    published: true,
  },
  {
    id: "r2",
    slug: "volunteer-application-form",
    title: "Adult Volunteer Application Form",
    summary: "Verified downloadable file pending upload.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "[CONFIRM FILE SIZE]",
    publishDate: "2026-01-15",
    downloadUrl: "",
    published: true,
  },
  {
    id: "r3",
    slug: "child-safeguarding-guidance",
    title: "Child Safeguarding Guidance",
    summary: "Verified safeguarding guidance file pending upload.",
    category: "Policies",
    fileType: "PDF",
    fileSize: "[CONFIRM FILE SIZE]",
    publishDate: "2026-01-01",
    downloadUrl: "",
    published: true,
  },
  {
    id: "r4",
    slug: "leader-training-outline",
    title: "Leader Training Outline",
    summary: "Verified training outline pending upload.",
    category: "Training",
    fileType: "PDF",
    fileSize: "[CONFIRM FILE SIZE]",
    publishDate: "2025-12-20",
    downloadUrl: "",
    published: true,
  },
  {
    id: "r5",
    slug: "district-report-template",
    title: "District Report Template",
    summary: "Verified reporting template pending upload.",
    category: "Reports",
    fileType: "DOCX",
    fileSize: "[CONFIRM FILE SIZE]",
    publishDate: "2025-12-01",
    downloadUrl: "",
    published: true,
  },
]

export const scoutUnits: ScoutUnit[] = [
  {
    id: "u1",
    slug: "sample-unit-a",
    name: "[SAMPLE] Scout Unit A",
    type: "Pack",
    section: "Cub Scouts",
    ward: "[CONFIRM WARD]",
    meetingDay: "[CONFIRM DAY]",
    meetingTime: "[CONFIRM TIME]",
    meetingLocation: "[CONFIRM LOCATION]",
    leaders: [{ name: "[CONFIRM LEADER NAME]", role: "[CONFIRM ROLE]" }],
    memberCount: 0,
    established: "[CONFIRM YEAR]",
    contactEmail: "[CONFIRM UNIT EMAIL]",
    image: "/images/units/1st-pack.jpg",
    published: true,
  },
  {
    id: "u2",
    slug: "sample-unit-b",
    name: "[SAMPLE] Scout Unit B",
    type: "Troop",
    section: "Scouts",
    ward: "[CONFIRM WARD]",
    meetingDay: "[CONFIRM DAY]",
    meetingTime: "[CONFIRM TIME]",
    meetingLocation: "[CONFIRM LOCATION]",
    leaders: [{ name: "[CONFIRM LEADER NAME]", role: "[CONFIRM ROLE]" }],
    memberCount: 0,
    established: "[CONFIRM YEAR]",
    contactEmail: "[CONFIRM UNIT EMAIL]",
    image: "/images/units/1st-troop.jpg",
    published: true,
  },
  {
    id: "u3",
    slug: "sample-unit-c",
    name: "[SAMPLE] Scout Unit C",
    type: "Crew",
    section: "Rovers",
    ward: "[CONFIRM WARD]",
    meetingDay: "[CONFIRM DAY]",
    meetingTime: "[CONFIRM TIME]",
    meetingLocation: "[CONFIRM LOCATION]",
    leaders: [{ name: "[CONFIRM LEADER NAME]", role: "[CONFIRM ROLE]" }],
    memberCount: 0,
    established: "[CONFIRM YEAR]",
    contactEmail: "[CONFIRM UNIT EMAIL]",
    image: "/images/units/rover-crew.jpg",
    published: true,
  },
]

export const leadershipProfiles: LeaderProfile[] = [
  {
    id: "l1",
    name: "[CONFIRM NAME]",
    role: "District Commissioner",
    image: "/images/leaders/dc.jpg",
    bio: "Replace this with verified profile details.",
    since: "[CONFIRM YEAR]",
  },
  {
    id: "l2",
    name: "[CONFIRM NAME]",
    role: "District Secretary",
    image: "/images/leaders/ds.jpg",
    bio: "Replace this with verified profile details.",
    since: "[CONFIRM YEAR]",
  },
  {
    id: "l3",
    name: "[CONFIRM NAME]",
    role: "District Training Lead",
    image: "/images/leaders/dtc.jpg",
    bio: "Replace this with verified profile details.",
    since: "[CONFIRM YEAR]",
  },
]

export const mediaItems: MediaItem[] = [
  {
    id: "m1",
    title: "Kibaha Camporee Highlights",
    kind: "video",
    thumbnail: "/images/campaigns/trees.jpg",
    href: "",
    description: "Camp activities and leadership moments from district participants.",
    displayOrder: 1,
    published: true,
  },
  {
    id: "m2",
    title: "Youth Leadership Stories",
    kind: "gallery",
    thumbnail: "/images/about-hero.jpg",
    href: "",
    description: "A photo gallery of youth-led service and training activities.",
    displayOrder: 2,
    published: true,
  },
  {
    id: "m3",
    title: "District Training Sessions",
    kind: "video",
    thumbnail: "/images/campaigns/membership.jpg",
    href: "",
    description: "Leader training highlights and field exercises across the district.",
    displayOrder: 3,
    published: true,
  },
]

export const campaigns: Campaign[] = [
  {
    id: "c1",
    title: "District Environmental Campaign",
    description: "Verified campaign scope and targets pending confirmation.",
    image: "/images/campaigns/trees.jpg",
    status: "Active",
    link: "/newsroom/district-programme-update",
  },
  {
    id: "c2",
    title: "Community Health Campaign",
    description: "Verified campaign implementation details pending confirmation.",
    image: "/images/campaigns/hygiene.jpg",
    status: "Active",
    link: "/newsroom/community-service-planning",
  },
  {
    id: "c3",
    title: "Membership Awareness Campaign",
    description: "Verified campaign plan pending confirmation.",
    image: "/images/campaigns/membership.jpg",
    status: "Upcoming",
    link: "/join",
  },
]

export const programmes: Programme[] = [
  {
    slug: "kabu",
    title: "Kabu",
    ageRange: "5 - 10 years",
    description:
      "Kabu is the foundational youth section for children aged 5 to 10. It introduces scout values, discipline, teamwork, and the first badge pathway.",
    objectives: [
      "Introduce the Scout Promise, Law, salute, and positive conduct through age-appropriate guidance.",
      "Support whole-child growth across mental, physical, social, and spiritual development.",
      "Build confidence, communication, teamwork, and personal responsibility in small-group settings.",
      "Start formal progression from Membership through the Kabu star pathway with clear skill milestones.",
    ],
    activities: [
      "Guided outdoor play, nature observation, and simple exploration games.",
      "Introductory campcraft, hygiene routines, and supervised practical tasks.",
      "Creative learning through songs, stories, drawing, and role-play exercises.",
      "Simple good-turn and community service actions focused on cleanliness and care.",
    ],
    badges: [
      {
        title: "Membership Badge",
        image: "/images/badges/kabu/uanachama.jpg",
        description:
          "This badge marks official entry into Kabu Scouting. It introduces the Promise, Law, salute, and foundational identity for children aged 5 to 10.",
      },
      {
        title: "First Star Badge",
        image: "/images/badges/kabu/nyota-ya-kwanza.jpg",
        description:
          "The first development level for Kabu members, focused on basic practical skills, discipline, confidence, and everyday responsibility.",
      },
      {
        title: "Second Star Badge",
        image: "/images/badges/kabu/nyota-ya-pili.jpg",
        description:
          "Builds on the first star stage with stronger self-reliance, service habits, and improved application of Scouting values in daily life.",
      },
      {
        title: "Grand Star Badge",
        image: "/images/badges/kabu/nyota-kuu.jpg",
        description:
          "The highest Kabu award, granted after completing earlier star requirements and meeting the expected special-skill standards.",
      },
    ],
    progression: [
      "Membership Badge -> First Star Badge -> Second Star Badge -> Grand Star Badge",
    ],
    uniformGuidance:
      "Wear the approved Kabu uniform during meetings, training sessions, and district scout activities.",
    image: "/images/programmes/cubs.jpg",
  },
  {
    slug: "junia",
    title: "Junia",
    ageRange: "11 - 14 years",
    description:
      "Junia is for young scouts aged 11 to 14, focusing on practical scouting skills, patrol discipline, and progressive advancement through class and special badges.",
    objectives: [
      "Strengthen patrol-based discipline, teamwork, and personal self-reliance.",
      "Develop practical competence in campcraft, safety, communication, and problem solving.",
      "Deepen citizenship values through service, environmental care, and community responsibility.",
      "Progress through Membership, Second Class, First Class, and Torch badge standards.",
    ],
    activities: [
      "Patrol-led training drills, pioneering tasks, and structured outdoor practice.",
      "Camp activities including planning, setup, and multi-day field participation.",
      "Health, first-aid, communication, and observation exercises with practical assessment.",
      "Community and environmental service projects linked to badge progression.",
    ],
    badges: [
      {
        title: "Membership Badge",
        image: "/images/badges/junia/uanachama.jpg",
        description:
          "Confirms formal admission into Junia Scouting (ages 11 to 14), with emphasis on Promise, Law, patrol identity, and section discipline.",
      },
      {
        title: "Second Class Badge",
        image: "/images/badges/junia/daraja-la-pili.jpg",
        description:
          "The first class-level progression in Junia, assessing core fieldcraft, personal initiative, and consistent participation in unit and community tasks.",
      },
      {
        title: "First Class Badge",
        image: "/images/badges/junia/daraja-la-kwanza.jpg",
        description:
          "An advanced Junia class badge requiring stronger leadership behavior, wider practical skill competence, and patrol-level responsibility.",
      },
      {
        title: "Torch (Mwenge) Badge",
        image: "",
        description:
          "The top Junia badge, recognizing readiness for higher section progression through service, commitment, and national values. Official image pending upload.",
      },
    ],
    progression: [
      "Membership Badge -> Second Class Badge -> First Class Badge -> Torch (Mwenge) Badge",
    ],
    uniformGuidance:
      "Junia members should maintain full approved scout uniform and appear properly dressed in all official unit and district programmes.",
    image: "/images/programmes/scouts.jpg",
  },
  {
    slug: "sinia",
    title: "Sinia",
    ageRange: "15 - 17 years",
    description:
      "Sinia is the senior youth section for ages 15 to 17, emphasizing higher responsibility, advanced scouting standards, and preparation for Rover level.",
    objectives: [
      "Develop mature leadership, discipline, and ethical decision-making in Scouting life.",
      "Advance technical field competence in camp management, planning, and responsibility.",
      "Prepare members to mentor younger sections and lead meaningful service initiatives.",
      "Progress through Senior, Nyirenda, and Kilimanjaro standards with higher performance expectations.",
    ],
    activities: [
      "Advanced camps, field assignments, and practical expedition-style tasks.",
      "Leadership rotations in planning, directing teams, and evaluating outcomes.",
      "Applied community projects in health, environment, and social responsibility.",
      "Structured preparation, assessment, and reflection for upper Sinia badge requirements.",
    ],
    badges: [
      {
        title: "Membership Badge",
        image: "/images/badges/sinia/uanachama.jpg",
        description:
          "Marks formal induction into Sinia Scouting and confirms commitment to the section standards for ages 15 to 17.",
      },
      {
        title: "Senior Badge",
        image: "/images/badges/sinia/sinia.jpg",
        description:
          "A core Sinia advancement badge focused on maturity, leadership discipline, and dependable service performance.",
      },
      {
        title: "Nyirenda Badge",
        image: "/images/badges/sinia/nyirenda.jpg",
        description:
          "A higher Sinia stage that expects advanced skill application, continuous service, and role-model behavior for younger sections.",
      },
      {
        title: "Kilimanjaro Badge",
        image: "/images/badges/sinia/kilimanjaro.jpg",
        description:
          "The highest Sinia award, symbolizing resilience, high achievement, and readiness for major leadership and transition responsibilities.",
      },
    ],
    progression: [
      "Membership Badge -> Senior Badge -> Nyirenda Badge -> Kilimanjaro Badge",
    ],
    uniformGuidance:
      "Sinia scouts are expected to uphold full uniform standards and present proper insignia according to badge level.",
    image: "/images/programmes/scouts.jpg",
  },
  {
    slug: "rova-scouts",
    title: "Rova",
    ageRange: "18 - 26 years",
    description:
      "Rova is the young adult scout section for ages 18 to 26, focused on advanced leadership, service, and high-level badge achievements.",
    objectives: [
      "Form young adult leaders with strong civic responsibility and service values.",
      "Build advanced life and leadership skills in planning, teamwork, and communication.",
      "Strengthen mentorship capacity for supporting younger Scout sections and district programmes.",
      "Complete Impeesa, Chief Scout, and President's Scout progression through measurable impact.",
    ],
    activities: [
      "High-responsibility field activities, advanced campcraft, and expedition-style challenges.",
      "Community-impact projects with planning, implementation, and reporting phases.",
      "Mentorship support to Kabu, Junia, and Sinia sections during trainings and events.",
      "Service and advocacy engagements in health, environment, and youth development priorities.",
    ],
    badges: [
      {
        title: "Membership Badge",
        image: "/images/badges/rova/uanachama.jpg",
        description:
          "Confirms official admission into Rova Scouting (ages 18 to 26), with a focus on values, responsibility, and service identity.",
      },
      {
        title: "Impeesa Badge",
        image: "/images/badges/rova/impeesa.jpg",
        description:
          "The first major Rova progression badge, linked to Scouting heritage and practical leadership readiness.",
      },
      {
        title: "Chief Scout Badge",
        image: "/images/badges/rova/scout-mkuu.jpg",
        description:
          "An advanced Rova distinction requiring completion of higher-level personal development and community-service skill pathways.",
      },
      {
        title: "President's Scout Badge",
        image: "/images/badges/rova/raisi.jpg",
        description:
          "The highest Rova recognition, awarded for outstanding completion of progression requirements, leadership, and national-level merit.",
      },
    ],
    progression: [
      "Membership Badge -> Impeesa Badge -> Chief Scout Badge -> President's Scout Badge",
    ],
    uniformGuidance:
      "Rova members should wear approved rover uniform and official insignia during all formal scout functions.",
    image: "/images/programmes/rovers.jpg",
  },
]

export const faqs: FAQ[] = [
  {
    question: "How can a young person join Kibaha Scouts?",
    answer: "Please contact the district office or a nearby unit for verified enrolment steps.",
  },
  {
    question: "How can adults volunteer?",
    answer: "Volunteer pathways, screening, and training requirements are provided by the district office.",
  },
  {
    question: "Where can I find official forms?",
    answer: "Forms are published in the Resources section when verified files are available.",
  },
]

export const timelineEntries: TimelineEntry[] = [
  {
    year: "[CONFIRM YEAR]",
    title: "District Milestone 1",
    description: "Replace with a verified historical milestone.",
  },
  {
    year: "[CONFIRM YEAR]",
    title: "District Milestone 2",
    description: "Replace with a verified historical milestone.",
  },
  {
    year: "[CONFIRM YEAR]",
    title: "District Milestone 3",
    description: "Replace with a verified historical milestone.",
  },
]

export const mainNavItems = [
  { label: "Home", href: "/" },
  {
    label: "About Kibaha Scouts",
    href: "/about",
    children: [
      { label: "District Overview", href: "/about" },
      { label: "Mission, Vision & Values", href: "/about#mission" },
      { label: "District Leadership", href: "/about#leadership" },
      { label: "History & Timeline", href: "/about#history" },
      { label: "Partners & Stakeholders", href: "/about#partners" },
      { label: "FAQs", href: "/about#faqs" },
    ],
  },
  {
    label: "Programmes",
    href: "/programmes",
    children: [
      { label: "Overview", href: "/programmes" },
      { label: "Kabu (5-10)", href: "/programmes/kabu" },
      { label: "Junia (11-14)", href: "/programmes/junia" },
      { label: "Sinia (15-17)", href: "/programmes/sinia" },
      { label: "Rova (18-26)", href: "/programmes/rova-scouts" },
    ],
  },
  {
    label: "Scout Units",
    href: "/units",
    children: [
      { label: "Unit Directory", href: "/units" },
      { label: "Find a Unit Near You", href: "/units#find" },
      { label: "Start a New Unit", href: "/units#start" },
    ],
  },
  {
    label: "Newsroom",
    href: "/newsroom",
    children: [
      { label: "All News", href: "/newsroom" },
      { label: "Announcements", href: "/newsroom?category=Announcements" },
      { label: "Training", href: "/newsroom?category=Training" },
      { label: "Community Service", href: "/newsroom?category=Community+Service" },
      { label: "Awards", href: "/newsroom?category=Awards" },
      { label: "Press & Downloads", href: "/newsroom#press" },
    ],
  },
  {
    label: "Events",
    href: "/events",
    children: [
      { label: "Upcoming Events", href: "/events" },
      { label: "Calendar View", href: "/events?view=calendar" },
      { label: "Past Events", href: "/events?past=true" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "All Resources", href: "/resources" },
      { label: "Forms", href: "/resources?category=Forms" },
      { label: "Training Materials", href: "/resources?category=Training" },
      { label: "Policies", href: "/resources?category=Policies" },
      { label: "Badge Requirements", href: "/resources?category=Badges" },
      { label: "Reports", href: "/resources?category=Reports" },
    ],
  },
  {
    label: "Safety & Youth Protection",
    href: "/safety",
  },
  {
    label: "Join / Volunteer",
    href: "/join",
    children: [
      { label: "Join as Youth", href: "/join#youth" },
      { label: "Volunteer as Leader", href: "/join#volunteer" },
      { label: "Donate / Support", href: "/join#donate" },
    ],
  },
  { label: "Contact", href: "/contact" },
]

