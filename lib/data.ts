import type {
  NewsArticle,
  ScoutEvent,
  Resource,
  ScoutUnit,
  LeaderProfile,
  Campaign,
  Programme,
  FAQ,
  TimelineEntry,
} from "./types"

// ─── NEWS (10 articles) ──────────────────────────────────────

export const newsArticles: NewsArticle[] = [
  {
    id: "n1",
    slug: "kibaha-scouts-plant-5000-trees",
    title: "Kibaha Scouts Plant 5,000 Trees in Ruvu River Restoration Project",
    summary:
      "Over 200 scouts from Kibaha District joined forces with the Forestry Commission to restore degraded areas along the Ruvu River, planting 5,000 indigenous trees in a single weekend.",
    content:
      "In a remarkable display of community spirit and environmental stewardship, more than 200 scouts from across Kibaha District participated in the Ruvu River Restoration Project last Saturday and Sunday. Working alongside officers from the Tanzania Forest Services Agency, the young scouts planted 5,000 indigenous tree seedlings including Mango, Neem, and Moringa species along the degraded riverbanks.",
    category: "Community Service",
    image: "/images/news/tree-planting.jpg",
    author: "James Mwakasege",
    date: "2026-02-15",
    readingTime: "4 min read",
    tags: ["Environment", "Community Service", "Ruvu River"],
    featured: true,
  },
  {
    id: "n2",
    slug: "annual-district-camporee-2026",
    title: "Annual District Camporee 2026: Registration Now Open",
    summary:
      "The much-anticipated Kibaha District Camporee returns in April with exciting new challenges, skill competitions, and fellowship opportunities for all scout sections.",
    content:
      "Registration is officially open for the 2026 Kibaha District Camporee, scheduled for April 18-20 at the Kibaha Scout Grounds. This year's theme, 'Scouts for Sustainable Communities,' will feature over 30 skill stations, pioneering challenges, and community service projects.",
    category: "Announcements",
    image: "/images/news/camporee.jpg",
    author: "District Commissioner Office",
    date: "2026-02-10",
    readingTime: "3 min read",
    tags: ["Camporee", "Events", "Registration"],
  },
  {
    id: "n3",
    slug: "three-scouts-earn-presidents-award",
    title: "Three Kibaha Scouts Earn the President's Scout Award",
    summary:
      "Aisha Mnzava, Joseph Kilimba, and Grace Mapunda have been recognized with Tanzania's highest scouting honor for their outstanding service and leadership.",
    content:
      "In a ceremony held at the State House in Dodoma, three scouts from Kibaha District were among the 25 scouts nationwide to receive the President's Scout Award. The award recognizes exceptional commitment to the Scout Promise and Law, community service, and personal development.",
    category: "Awards",
    image: "/images/news/award.jpg",
    author: "TSA Communications",
    date: "2026-02-01",
    readingTime: "5 min read",
    tags: ["Awards", "President's Award", "Achievement"],
  },
  {
    id: "n4",
    slug: "first-aid-training-partnership-red-cross",
    title: "Kibaha Scouts Partner with Red Cross for First Aid Training",
    summary:
      "A new partnership with the Tanzania Red Cross Society will bring certified first aid training to over 500 scouts and leaders across the district.",
    content:
      "The Tanzania Scouts Association Kibaha District has signed a memorandum of understanding with the Tanzania Red Cross Society to provide standardized first aid training. The program will run over six months, training scouts in basic life support, wound care, and emergency response.",
    category: "Training",
    image: "/images/news/first-aid.jpg",
    author: "Sarah Kimario",
    date: "2026-01-25",
    readingTime: "3 min read",
    tags: ["Training", "First Aid", "Partnership"],
  },
  {
    id: "n5",
    slug: "new-scout-hall-construction-begins",
    title: "Construction Begins on New Kibaha Scout Hall",
    summary:
      "Ground-breaking ceremony marks the start of construction for a modern scout hall that will serve as the district's headquarters and training center.",
    content:
      "The District Commissioner of Kibaha, along with scouting officials and community leaders, broke ground on the new Kibaha Scout Hall. The facility will include meeting rooms, a training center, storage for camping equipment, and an outdoor skills area.",
    category: "Announcements",
    image: "/images/news/construction.jpg",
    author: "District Commissioner Office",
    date: "2026-01-18",
    readingTime: "4 min read",
    tags: ["Infrastructure", "Scout Hall", "Development"],
  },
  {
    id: "n6",
    slug: "hygiene-campaign-schools",
    title: "Scouts Lead Handwashing Campaign Across 15 Kibaha Schools",
    summary:
      "Cub Scouts and Scout sections visited 15 primary schools to teach proper handwashing techniques and distribute hygiene kits as part of the Clean Hands initiative.",
    content:
      "As part of the ongoing Clean Hands, Healthy Communities campaign, scout volunteers visited 15 primary schools throughout Kibaha District to conduct interactive hygiene education sessions. The initiative reached over 3,000 students and distributed 500 hygiene kits.",
    category: "Community Service",
    image: "/images/news/hygiene.jpg",
    author: "Community Service Team",
    date: "2026-01-10",
    readingTime: "3 min read",
    tags: ["Hygiene", "Schools", "Community Service"],
  },
  {
    id: "n7",
    slug: "woodbadge-training-completed",
    title: "12 Leaders Complete Wood Badge Training in Kibaha",
    summary:
      "A dozen scout leaders from Kibaha District have successfully completed the prestigious Wood Badge leadership training programme.",
    content:
      "Twelve adult leaders from Kibaha District successfully completed the Wood Badge training held at the Minaki Scout Camp from January 3-8. The training covered advanced leadership skills, programme planning, and outdoor methods.",
    category: "Training",
    image: "/images/news/woodbadge.jpg",
    author: "Training Commissioner",
    date: "2026-01-08",
    readingTime: "4 min read",
    tags: ["Wood Badge", "Leadership", "Training"],
  },
  {
    id: "n8",
    slug: "rover-scouts-blood-drive",
    title: "Rover Scouts Organize Successful Blood Donation Drive",
    summary:
      "Rover Scout crews in Kibaha collected 150 pints of blood during a two-day donation drive at the Kibaha District Hospital.",
    content:
      "The Rover Scout section of Kibaha District organized a successful blood donation drive in partnership with the National Blood Transfusion Service. Over two days, 150 pints of blood were collected from scouts, leaders, and community members.",
    category: "Community Service",
    image: "/images/news/blood-drive.jpg",
    author: "Rover Section Lead",
    date: "2025-12-20",
    readingTime: "3 min read",
    tags: ["Blood Donation", "Rovers", "Community Service"],
  },
  {
    id: "n9",
    slug: "digital-skills-workshop",
    title: "Digital Skills Workshop Prepares Scouts for the Future",
    summary:
      "A two-day digital literacy workshop introduced over 80 scouts to coding basics, online safety, and digital citizenship.",
    content:
      "Kibaha District hosted its first Digital Skills Workshop, introducing scouts aged 12-17 to the fundamentals of coding, digital safety, and responsible online behavior. The workshop was facilitated by volunteers from the University of Dar es Salaam's Computer Science department.",
    category: "Training",
    image: "/images/news/digital.jpg",
    author: "Programme Commissioner",
    date: "2025-12-12",
    readingTime: "4 min read",
    tags: ["Digital Skills", "Training", "Technology"],
  },
  {
    id: "n10",
    slug: "kibaha-scout-week-celebrations",
    title: "Kibaha Celebrates Scout Week with Community Showcase",
    summary:
      "A week of activities culminated in a public showcase at the Kibaha Municipal grounds, featuring scout demonstrations, cultural performances, and a recruitment fair.",
    content:
      "Kibaha District marked Scout Week with seven days of activities that brought together over 1,000 scouts, leaders, parents, and community members. The celebration featured daily themes including Service Day, Skills Day, Culture Day, and culminated in a grand public showcase.",
    category: "Announcements",
    image: "/images/news/scout-week.jpg",
    author: "District Commissioner Office",
    date: "2025-12-01",
    readingTime: "5 min read",
    tags: ["Scout Week", "Celebration", "Community"],
  },
]

// ─── EVENTS (8 events) ──────────────────────────────────────

export const scoutEvents: ScoutEvent[] = [
  {
    id: "e1",
    slug: "district-camporee-2026",
    title: "Kibaha District Camporee 2026",
    description:
      "The annual gathering of all scout units in Kibaha District featuring skill competitions, pioneering challenges, campfire programmes, and community service projects. Theme: Scouts for Sustainable Communities.",
    date: "2026-04-18",
    endDate: "2026-04-20",
    time: "08:00 - 17:00",
    location: "Kibaha Scout Grounds, Kibaha Town",
    image: "/images/events/camporee.jpg",
    registrationOpen: true,
    category: "Camp",
  },
  {
    id: "e2",
    slug: "cub-scout-fun-day",
    title: "Cub Scout Fun Day",
    description:
      "A day of adventure activities, games, and badge work for Cub Scouts aged 7-11. Parents are welcome to attend and learn about the Cub Scout programme.",
    date: "2026-03-15",
    time: "09:00 - 15:00",
    location: "Kibaha Primary School Grounds",
    image: "/images/events/cubday.jpg",
    registrationOpen: true,
    category: "Activity Day",
  },
  {
    id: "e3",
    slug: "leader-training-weekend",
    title: "Basic Unit Leader Training (BULT)",
    description:
      "Essential training for new and aspiring scout leaders covering programme planning, outdoor skills, youth safeguarding, and unit management.",
    date: "2026-03-22",
    endDate: "2026-03-23",
    time: "08:00 - 17:00",
    location: "Minaki Scout Training Centre",
    image: "/images/events/training.jpg",
    registrationOpen: true,
    category: "Training",
  },
  {
    id: "e4",
    slug: "community-cleanup-day",
    title: "Community Clean-Up: Kibaha Market Area",
    description:
      "Monthly community service event where scouts join residents to clean and beautify the Kibaha market area. Bring gloves and water.",
    date: "2026-03-08",
    time: "07:00 - 12:00",
    location: "Kibaha Central Market",
    image: "/images/events/cleanup.jpg",
    registrationOpen: false,
    category: "Service",
  },
  {
    id: "e5",
    slug: "scout-parents-meeting",
    title: "Scout Parents Information Evening",
    description:
      "An evening session for parents and guardians to learn about scouting, upcoming activities, fees, and how to support their child's scouting journey.",
    date: "2026-03-05",
    time: "18:00 - 20:00",
    location: "Kibaha District Council Hall",
    image: "/images/events/parents.jpg",
    registrationOpen: false,
    category: "Meeting",
  },
  {
    id: "e6",
    slug: "swimming-badge-course",
    title: "Swimming Badge Assessment Day",
    description:
      "Scouts can complete their swimming proficiency badge with certified assessors. All levels welcome. Participants must bring medical clearance.",
    date: "2026-04-05",
    time: "09:00 - 14:00",
    location: "Kibaha Swimming Pool",
    image: "/images/events/swimming.jpg",
    registrationOpen: true,
    category: "Badge Work",
  },
  {
    id: "e7",
    slug: "world-scout-day-2026",
    title: "World Scout Day Celebration",
    description:
      "Join scouts around the world in celebrating World Scout Day with a district parade, renewal of the Scout Promise, and community service activities.",
    date: "2026-02-22",
    time: "10:00 - 16:00",
    location: "Kibaha Municipal Grounds",
    image: "/images/events/worldscoutday.jpg",
    registrationOpen: false,
    category: "Celebration",
  },
  {
    id: "e8",
    slug: "environmental-conservation-hike",
    title: "Ruvu River Conservation Hike",
    description:
      "A guided nature hike along the Ruvu River with environmental education stations, bird watching, and tree identification. Open to all scout sections.",
    date: "2026-04-12",
    time: "07:00 - 15:00",
    location: "Ruvu River Nature Trail, Kibaha",
    image: "/images/events/hike.jpg",
    registrationOpen: true,
    category: "Outdoor",
  },
]

// ─── RESOURCES (20 resources) ───────────────────────────────

export const resources: Resource[] = [
  {
    id: "r1",
    title: "Scout Membership Registration Form",
    summary: "Official form for new scout member registration in Kibaha District.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "245 KB",
    publishDate: "2026-01-15",
    downloadUrl: "#",
  },
  {
    id: "r2",
    title: "Adult Volunteer Application Form",
    summary: "Application form for adults wishing to volunteer as scout leaders.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "312 KB",
    publishDate: "2026-01-15",
    downloadUrl: "#",
  },
  {
    id: "r3",
    title: "Parental Consent & Medical Form",
    summary: "Required consent and medical information form for all camp and outdoor activities.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "189 KB",
    publishDate: "2025-12-01",
    downloadUrl: "#",
  },
  {
    id: "r4",
    title: "Kibaha District Annual Plan 2026",
    summary: "Complete annual programme plan including events, training schedule, and objectives.",
    category: "Reports",
    fileType: "PDF",
    fileSize: "1.8 MB",
    publishDate: "2026-01-01",
    downloadUrl: "#",
  },
  {
    id: "r5",
    title: "Scout Leader Handbook (TSA Edition)",
    summary: "Comprehensive guide for scout leaders covering programme delivery, outdoor methods, and youth development.",
    category: "Training",
    fileType: "PDF",
    fileSize: "4.2 MB",
    publishDate: "2025-09-01",
    downloadUrl: "#",
  },
  {
    id: "r6",
    title: "Cub Scout Badge Requirements",
    summary: "Complete list of badge requirements and progression steps for Cub Scouts.",
    category: "Badges",
    fileType: "PDF",
    fileSize: "890 KB",
    publishDate: "2025-08-15",
    downloadUrl: "#",
  },
  {
    id: "r7",
    title: "Scout Section Badge Requirements",
    summary: "Badge syllabus and requirements for the Scout section (ages 12-17).",
    category: "Badges",
    fileType: "PDF",
    fileSize: "1.1 MB",
    publishDate: "2025-08-15",
    downloadUrl: "#",
  },
  {
    id: "r8",
    title: "Rover Scout Programme Guide",
    summary: "Programme framework and service project guidelines for Rover Scouts.",
    category: "Badges",
    fileType: "PDF",
    fileSize: "750 KB",
    publishDate: "2025-08-15",
    downloadUrl: "#",
  },
  {
    id: "r9",
    title: "Child Safeguarding Policy",
    summary: "Kibaha Scouts child protection and safeguarding policy document.",
    category: "Policies",
    fileType: "PDF",
    fileSize: "420 KB",
    publishDate: "2025-07-01",
    downloadUrl: "#",
  },
  {
    id: "r10",
    title: "Code of Conduct for Leaders",
    summary: "Standards of behavior and ethical guidelines for all adult volunteers and leaders.",
    category: "Policies",
    fileType: "PDF",
    fileSize: "285 KB",
    publishDate: "2025-07-01",
    downloadUrl: "#",
  },
  {
    id: "r11",
    title: "Anti-Bullying Policy",
    summary: "Policy and procedures for preventing and addressing bullying in scouting activities.",
    category: "Policies",
    fileType: "PDF",
    fileSize: "310 KB",
    publishDate: "2025-07-01",
    downloadUrl: "#",
  },
  {
    id: "r12",
    title: "Unit Financial Report Template",
    summary: "Standardized template for unit-level financial reporting and fee management.",
    category: "Forms",
    fileType: "XLSX",
    fileSize: "156 KB",
    publishDate: "2025-11-01",
    downloadUrl: "#",
  },
  {
    id: "r13",
    title: "Outdoor Activity Risk Assessment Form",
    summary: "Required risk assessment form for all outdoor activities and camps.",
    category: "Forms",
    fileType: "DOCX",
    fileSize: "198 KB",
    publishDate: "2025-10-15",
    downloadUrl: "#",
  },
  {
    id: "r14",
    title: "First Aid Training Manual",
    summary: "Training manual covering basic first aid techniques for scouts and leaders.",
    category: "Training",
    fileType: "PDF",
    fileSize: "3.5 MB",
    publishDate: "2025-06-01",
    downloadUrl: "#",
  },
  {
    id: "r15",
    title: "Camping Skills Guidebook",
    summary: "Practical guide to camping skills including shelter, cooking, navigation, and safety.",
    category: "Training",
    fileType: "PDF",
    fileSize: "2.8 MB",
    publishDate: "2025-06-01",
    downloadUrl: "#",
  },
  {
    id: "r16",
    title: "District Census Report 2025",
    summary: "Annual membership census data including unit counts, demographics, and growth trends.",
    category: "Reports",
    fileType: "PDF",
    fileSize: "1.2 MB",
    publishDate: "2025-12-15",
    downloadUrl: "#",
  },
  {
    id: "r17",
    title: "Event Permission Slip Template",
    summary: "Standard permission slip template for parents/guardians for off-site activities.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "125 KB",
    publishDate: "2025-09-01",
    downloadUrl: "#",
  },
  {
    id: "r18",
    title: "Pioneering Projects Manual",
    summary: "Detailed instructions for pioneering projects including camp gadgets and rope bridges.",
    category: "Training",
    fileType: "PDF",
    fileSize: "5.1 MB",
    publishDate: "2025-05-01",
    downloadUrl: "#",
  },
  {
    id: "r19",
    title: "Community Service Project Reporting Form",
    summary: "Template for documenting and reporting community service hours and project outcomes.",
    category: "Forms",
    fileType: "PDF",
    fileSize: "178 KB",
    publishDate: "2025-10-01",
    downloadUrl: "#",
  },
  {
    id: "r20",
    title: "TSA Brand Guidelines for Units",
    summary: "Official brand guidelines including logo usage, colors, and communication standards for Kibaha units.",
    category: "Policies",
    fileType: "PDF",
    fileSize: "2.3 MB",
    publishDate: "2025-04-01",
    downloadUrl: "#",
  },
]

// ─── SCOUT UNITS (10 units) ────────────────────────────────

export const scoutUnits: ScoutUnit[] = [
  {
    id: "u1",
    slug: "1st-kibaha-pack",
    name: "1st Kibaha Cub Scout Pack",
    type: "Pack",
    section: "Cub Scouts",
    ward: "Kibaha Mjini",
    meetingDay: "Saturday",
    meetingTime: "09:00 - 11:30",
    meetingLocation: "Kibaha Primary School Hall",
    leaders: [
      { name: "Akela Martha Lugembe", role: "Pack Leader" },
      { name: "Baloo David Shayo", role: "Assistant Pack Leader" },
    ],
    memberCount: 32,
    established: "2015",
    contactEmail: "1stkibahapack@tsa-kibaha.org",
    image: "/images/units/1st-pack.jpg",
  },
  {
    id: "u2",
    slug: "2nd-kibaha-pack",
    name: "2nd Kibaha Cub Scout Pack",
    type: "Pack",
    section: "Cub Scouts",
    ward: "Mlandizi",
    meetingDay: "Sunday",
    meetingTime: "14:00 - 16:30",
    meetingLocation: "Mlandizi Community Centre",
    leaders: [
      { name: "Akela Rose Msangi", role: "Pack Leader" },
    ],
    memberCount: 24,
    established: "2018",
    contactEmail: "2ndkibahapack@tsa-kibaha.org",
    image: "/images/units/2nd-pack.jpg",
  },
  {
    id: "u3",
    slug: "1st-kibaha-troop",
    name: "1st Kibaha Scout Troop",
    type: "Troop",
    section: "Scouts",
    ward: "Kibaha Mjini",
    meetingDay: "Saturday",
    meetingTime: "14:00 - 17:00",
    meetingLocation: "Kibaha Secondary School",
    leaders: [
      { name: "Scoutmaster John Mhagama", role: "Troop Leader" },
      { name: "ASM Fatuma Hassan", role: "Assistant Troop Leader" },
    ],
    memberCount: 45,
    established: "2010",
    contactEmail: "1stkibahatroop@tsa-kibaha.org",
    image: "/images/units/1st-troop.jpg",
  },
  {
    id: "u4",
    slug: "3rd-kibaha-troop",
    name: "3rd Kibaha Scout Troop",
    type: "Troop",
    section: "Scouts",
    ward: "Kwala",
    meetingDay: "Saturday",
    meetingTime: "10:00 - 13:00",
    meetingLocation: "Kwala Scout Den",
    leaders: [
      { name: "Scoutmaster Peter Mbwilo", role: "Troop Leader" },
    ],
    memberCount: 28,
    established: "2017",
    contactEmail: "3rdkibahatroop@tsa-kibaha.org",
    image: "/images/units/3rd-troop.jpg",
  },
  {
    id: "u5",
    slug: "kibaha-rover-crew",
    name: "Kibaha Rover Scout Crew",
    type: "Crew",
    section: "Rovers",
    ward: "Kibaha Mjini",
    meetingDay: "Sunday",
    meetingTime: "15:00 - 17:30",
    meetingLocation: "Kibaha Youth Centre",
    leaders: [
      { name: "Crew Advisor Michael Tarimo", role: "Crew Advisor" },
      { name: "ACA Neema Joseph", role: "Assistant Crew Advisor" },
    ],
    memberCount: 18,
    established: "2019",
    contactEmail: "kibaharovers@tsa-kibaha.org",
    image: "/images/units/rover-crew.jpg",
  },
  {
    id: "u6",
    slug: "tumbi-pack",
    name: "Tumbi Cub Scout Pack",
    type: "Pack",
    section: "Cub Scouts",
    ward: "Tumbi",
    meetingDay: "Saturday",
    meetingTime: "09:00 - 11:00",
    meetingLocation: "Tumbi Primary School",
    leaders: [
      { name: "Akela Happy Mwakalinga", role: "Pack Leader" },
    ],
    memberCount: 20,
    established: "2020",
    contactEmail: "tumbipack@tsa-kibaha.org",
    image: "/images/units/tumbi-pack.jpg",
  },
  {
    id: "u7",
    slug: "ruvu-troop",
    name: "Ruvu Scout Troop",
    type: "Troop",
    section: "Scouts",
    ward: "Ruvu",
    meetingDay: "Sunday",
    meetingTime: "09:00 - 12:00",
    meetingLocation: "Ruvu Secondary School",
    leaders: [
      { name: "Scoutmaster Grace Mapunda", role: "Troop Leader" },
      { name: "ASM Said Omary", role: "Assistant Troop Leader" },
    ],
    memberCount: 35,
    established: "2014",
    contactEmail: "ruvutroop@tsa-kibaha.org",
    image: "/images/units/ruvu-troop.jpg",
  },
  {
    id: "u8",
    slug: "picha-ya-ndege-troop",
    name: "Picha ya Ndege Scout Troop",
    type: "Troop",
    section: "Scouts",
    ward: "Picha ya Ndege",
    meetingDay: "Saturday",
    meetingTime: "14:00 - 16:30",
    meetingLocation: "Picha ya Ndege Community Hall",
    leaders: [
      { name: "Scoutmaster Amina Bakari", role: "Troop Leader" },
    ],
    memberCount: 22,
    established: "2021",
    contactEmail: "pichatroop@tsa-kibaha.org",
    image: "/images/units/picha-troop.jpg",
  },
  {
    id: "u9",
    slug: "visiga-pack",
    name: "Visiga Cub Scout Pack",
    type: "Pack",
    section: "Cub Scouts",
    ward: "Visiga",
    meetingDay: "Sunday",
    meetingTime: "10:00 - 12:00",
    meetingLocation: "Visiga Primary School",
    leaders: [
      { name: "Akela Juma Mwenda", role: "Pack Leader" },
    ],
    memberCount: 18,
    established: "2022",
    contactEmail: "visigapack@tsa-kibaha.org",
    image: "/images/units/visiga-pack.jpg",
  },
  {
    id: "u10",
    slug: "magindu-troop",
    name: "Magindu Scout Troop",
    type: "Troop",
    section: "Scouts",
    ward: "Magindu",
    meetingDay: "Saturday",
    meetingTime: "09:00 - 12:00",
    meetingLocation: "Magindu Secondary School",
    leaders: [
      { name: "Scoutmaster Halima Ngoma", role: "Troop Leader" },
      { name: "ASM Robert Minja", role: "Assistant Troop Leader" },
    ],
    memberCount: 30,
    established: "2016",
    contactEmail: "magindutroop@tsa-kibaha.org",
    image: "/images/units/magindu-troop.jpg",
  },
]

// ─── LEADERSHIP (8 profiles) ───────────────────────────────

export const leadershipProfiles: LeaderProfile[] = [
  {
    id: "l1",
    name: "Bwana Scout Elias Mwaipopo",
    role: "District Commissioner",
    image: "/images/leaders/dc.jpg",
    bio: "Serving as District Commissioner since 2020, Elias brings over 15 years of scouting experience and a passion for youth development in Coast Region.",
    since: "2020",
  },
  {
    id: "l2",
    name: "Bi Scout Angela Massawe",
    role: "Deputy District Commissioner",
    image: "/images/leaders/ddc.jpg",
    bio: "Angela oversees programme quality and adult leader development across all sections. A Wood Badge holder with expertise in outdoor education.",
    since: "2021",
  },
  {
    id: "l3",
    name: "Bwana Scout Francis Lyimo",
    role: "District Training Commissioner",
    image: "/images/leaders/dtc.jpg",
    bio: "Francis leads all training initiatives for adult volunteers, ensuring quality programme delivery through the training scheme.",
    since: "2019",
  },
  {
    id: "l4",
    name: "Bi Scout Mariam Khamis",
    role: "District Programme Commissioner",
    image: "/images/leaders/dpc.jpg",
    bio: "Mariam coordinates the district programme calendar, badge systems, and inter-unit activities across Cub Scout, Scout, and Rover sections.",
    since: "2022",
  },
  {
    id: "l5",
    name: "Bwana Scout Charles Ndunguru",
    role: "District Secretary",
    image: "/images/leaders/ds.jpg",
    bio: "Charles manages district administration, communications, and stakeholder relationships, keeping the district organized and connected.",
    since: "2020",
  },
  {
    id: "l6",
    name: "Bi Scout Rehema Mwalimu",
    role: "District Treasurer",
    image: "/images/leaders/dt.jpg",
    bio: "Rehema oversees district finances, fundraising initiatives, and ensures transparent stewardship of all funds.",
    since: "2021",
  },
  {
    id: "l7",
    name: "Bwana Scout Ibrahim Mzee",
    role: "Cub Scout Section Leader",
    image: "/images/leaders/csl.jpg",
    bio: "Ibrahim coordinates all Cub Scout activities in Kibaha, working closely with Pack Leaders to deliver an engaging programme for younger scouts.",
    since: "2023",
  },
  {
    id: "l8",
    name: "Bi Scout Esther Komba",
    role: "Community Relations Officer",
    image: "/images/leaders/cro.jpg",
    bio: "Esther builds partnerships with schools, government, and community organizations to support scouting programmes and service projects.",
    since: "2022",
  },
]

// ─── CAMPAIGNS ──────────────────────────────────────────────

export const campaigns: Campaign[] = [
  {
    id: "c1",
    title: "Plant a Million Trees Initiative",
    description:
      "Kibaha scouts are leading a district-wide campaign to plant one million trees by 2028, restoring degraded habitats and combating climate change in the Coast Region.",
    image: "/images/campaigns/trees.jpg",
    status: "Active",
    link: "/newsroom/kibaha-scouts-plant-5000-trees",
  },
  {
    id: "c2",
    title: "Clean Hands, Healthy Communities",
    description:
      "Bringing hygiene education and handwashing stations to every primary school in Kibaha District. Scouts teach, build, and maintain hygiene facilities.",
    image: "/images/campaigns/hygiene.jpg",
    status: "Active",
    link: "/newsroom/hygiene-campaign-schools",
  },
  {
    id: "c3",
    title: "Every Child a Scout",
    description:
      "A membership drive aiming to reach 2,000 youth in Kibaha by December 2026 through school demonstrations, open days, and community outreach.",
    image: "/images/campaigns/membership.jpg",
    status: "Active",
    link: "/join",
  },
]

// ─── PROGRAMMES ─────────────────────────────────────────────

export const programmes: Programme[] = [
  {
    slug: "cub-scouts",
    title: "Cub Scouts",
    ageRange: "7 - 11 years",
    description:
      "The Cub Scout programme introduces young children to the world of scouting through play, creativity, and outdoor adventures. Cubs learn teamwork, basic life skills, and develop a sense of community through fun activities guided by the Cub Scout Promise and Law.",
    objectives: [
      "Develop social skills through teamwork and cooperation",
      "Build confidence through age-appropriate challenges",
      "Learn basic outdoor and survival skills",
      "Understand community responsibility through service",
      "Foster curiosity and a love of learning",
    ],
    activities: [
      "Nature walks and wildlife observation",
      "Basic camping and outdoor cooking",
      "Arts and crafts projects",
      "Team games and sports",
      "Community clean-up projects",
      "Storytelling and cultural activities",
      "Swimming and water safety",
    ],
    badges: [
      "Membership Badge",
      "Adventure Badge",
      "Creative Badge",
      "Helping Hand Badge",
      "Outdoor Skills Badge",
      "Safety Badge",
      "World Friendship Badge",
    ],
    progression: [
      "Bronze Arrow: Complete 3 activity badges and a service project",
      "Silver Arrow: Complete 6 activity badges and demonstrate leadership",
      "Gold Arrow: Complete 10 activity badges and pass the Leaping Wolf trail",
      "Leaping Wolf: Final Cub Scout award, ready for transition to Scouts",
    ],
    uniformGuidance:
      "Cub Scouts wear a green shirt with district and pack number patches, khaki shorts or trousers, green socks, and the TSA Cub Scout neckerchief in the unit's designated color.",
    image: "/images/programmes/cubs.jpg",
  },
  {
    slug: "scouts",
    title: "Scouts",
    ageRange: "12 - 17 years",
    description:
      "The Scout section is where young people develop real-world skills through challenging outdoor adventures, leadership opportunities, and meaningful community service. Scouts learn to be self-reliant, work in patrols, and contribute positively to society.",
    objectives: [
      "Develop leadership and teamwork through the patrol system",
      "Master outdoor skills including camping, hiking, and navigation",
      "Build character through adherence to the Scout Promise and Law",
      "Serve the community through planned service projects",
      "Prepare for responsible citizenship",
    ],
    activities: [
      "Overnight and weekend camping",
      "Hiking and backpacking expeditions",
      "Pioneering and construction projects",
      "First aid training and practice",
      "Community service projects",
      "Environmental conservation activities",
      "Navigation and orienteering",
      "Cultural exchange programmes",
    ],
    badges: [
      "Tenderfoot Badge",
      "Second Class Badge",
      "First Class Badge",
      "Campcraft Badge",
      "Navigation Badge",
      "First Aid Badge",
      "Community Service Badge",
      "Environmental Badge",
      "Leadership Badge",
    ],
    progression: [
      "Tenderfoot: Basic scouting skills and Scout Promise",
      "Second Class: Intermediate skills in camping, first aid, and service",
      "First Class: Advanced outdoor skills and leadership demonstration",
      "President's Scout Award: Highest achievement in Tanzanian Scouting",
    ],
    uniformGuidance:
      "Scouts wear a khaki shirt with district, troop number, and patrol patches, dark green shorts or trousers, green socks, and the TSA Scout neckerchief with woggle.",
    image: "/images/programmes/scouts.jpg",
  },
  {
    slug: "rovers",
    title: "Rover Scouts",
    ageRange: "18 - 25 years",
    description:
      "Rover Scouts are young adults who apply their scouting values to make a real difference in the world. Through self-directed service projects, leadership, and community development, Rovers prepare to be active, responsible citizens and future leaders.",
    objectives: [
      "Lead community development and service projects",
      "Develop professional and life skills for adulthood",
      "Mentor younger scouts as assistant leaders",
      "Engage in national and international scouting opportunities",
      "Promote peace, sustainability, and social responsibility",
    ],
    activities: [
      "Community development projects",
      "Environmental conservation expeditions",
      "Leadership training and mentoring",
      "International scouting exchanges",
      "Disaster relief and first response",
      "Career development workshops",
      "Advocacy and awareness campaigns",
    ],
    badges: [
      "Rover Membership Badge",
      "Service Badge",
      "Leadership Badge",
      "Environment Badge",
      "Global Citizenship Badge",
      "Entrepreneurship Badge",
    ],
    progression: [
      "Rover Investiture: Commitment to Rover Scout ideals and service",
      "Service Star: Completion of a significant community service project",
      "Rover Scout Award: Demonstrated sustained leadership and service",
      "Baden-Powell Award: Highest recognition for exceptional Rover service",
    ],
    uniformGuidance:
      "Rover Scouts wear a dark green shirt with district and crew patches, dark trousers, and the distinctive Rover Scout neckerchief with the Rover emblem woggle.",
    image: "/images/programmes/rovers.jpg",
  },
]

// ─── FAQs ───────────────────────────────────────────────────

export const faqs: FAQ[] = [
  {
    question: "What age can my child join scouting in Kibaha?",
    answer:
      "Children can join Cub Scouts from age 7. The Scout section is for ages 12-17, and Rover Scouts is for young adults aged 18-25. We welcome youth of all backgrounds.",
  },
  {
    question: "How much does it cost to join?",
    answer:
      "Annual membership fees vary by unit but typically range from TZS 10,000 to TZS 25,000 per year. This covers insurance, basic materials, and TSA registration. Some units offer fee waivers for families in need.",
  },
  {
    question: "Do I need scouting experience to volunteer as a leader?",
    answer:
      "No prior scouting experience is needed! All new leaders receive Basic Unit Leader Training (BULT) and ongoing support. We value enthusiasm, commitment to youth development, and a clean background check.",
  },
  {
    question: "How can I find a scout unit near me?",
    answer:
      "Visit our Scout Units page to browse all active units in Kibaha District. You can filter by ward, meeting day, and section (Cub Scouts, Scouts, or Rovers).",
  },
  {
    question: "What happens at a typical scout meeting?",
    answer:
      "Meetings usually last 2-3 hours and include an opening ceremony, skill instruction, practical activities, games, and a closing. Scouts work in small groups (patrols or sixes) for most activities.",
  },
  {
    question: "Is scouting safe for my child?",
    answer:
      "Safety is our top priority. All leaders undergo background screening, child safeguarding training, and first aid certification. We follow strict policies on adult-to-youth ratios, activity risk assessments, and reporting procedures.",
  },
]

// ─── TIMELINE ───────────────────────────────────────────────

export const timelineEntries: TimelineEntry[] = [
  {
    year: "1966",
    title: "Scouting Established in Coast Region",
    description:
      "Following Tanzania's independence, the Tanzania Scouts Association expanded scouting into the Coast Region, laying the groundwork for the Kibaha District.",
  },
  {
    year: "1978",
    title: "First Scout Troop in Kibaha",
    description:
      "The first officially registered scout troop was established at Kibaha Secondary School, marking the beginning of organized scouting in the district.",
  },
  {
    year: "1995",
    title: "Kibaha District Formally Constituted",
    description:
      "TSA formally recognized Kibaha as an independent scouting district with its own commissioner and administrative structure.",
  },
  {
    year: "2005",
    title: "First Cub Scout Packs Opened",
    description:
      "Three Cub Scout packs were established, extending scouting to younger children aged 7-11 for the first time in Kibaha.",
  },
  {
    year: "2015",
    title: "Membership Milestone: 500 Scouts",
    description:
      "The district celebrated reaching 500 active members across all sections, with 10 registered units operating in Kibaha.",
  },
  {
    year: "2020",
    title: "Community Service Excellence Award",
    description:
      "Kibaha Scouts received the National Community Service Excellence Award for outstanding youth-led community development projects.",
  },
  {
    year: "2026",
    title: "New Scout Hall Under Construction",
    description:
      "Construction begins on a dedicated scout hall and training center, representing a new era for scouting infrastructure in Kibaha.",
  },
]

// ─── NAVIGATION ─────────────────────────────────────────────

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
      { label: "Cub Scouts (7-11)", href: "/programmes/cub-scouts" },
      { label: "Scouts (12-17)", href: "/programmes/scouts" },
      { label: "Rover Scouts (18-25)", href: "/programmes/rovers" },
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
