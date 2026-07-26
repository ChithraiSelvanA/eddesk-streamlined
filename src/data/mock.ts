// Mock data for EdDesk One admin panel

export type Student = {
  id: string;
  admissionNo: string;
  name: string;
  classId: string;
  className: string;
  section: string;
  rollNo: number;
  gender: "M" | "F";
  dob: string;
  parentId: string;
  parentName: string;
  parentMobile: string;
  feeStatus: "paid" | "due" | "overdue";
  feeDue: number;
  attendance: number; // percent
  avatarHue: number;
};

export type Parent = {
  id: string;
  name: string;
  mobile: string;
  email: string;
  occupation: string;
  childIds: string[];
  pendingTotal: number;
  unreadChats: number;
};

export type ClassRoom = {
  id: string;
  name: string; // "Grade 5"
  section: string; // "A"
  teacher: string;
  studentCount: number;
  subjects: string[];
  room: string;
};

export type Subject = {
  id: string;
  name: string;
  code: string;
  category: string;
};

export type Teacher = {
  id: string;
  name: string;
  subjects: string[];
  classes: string[];
  email: string;
  avatarHue: number;
};

export const subjects: Subject[] = [
  { id: "s1", name: "Mathematics", code: "MATH", category: "Core" },
  { id: "s2", name: "English Language", code: "ENG", category: "Core" },
  { id: "s3", name: "Science", code: "SCI", category: "Core" },
  { id: "s4", name: "Social Studies", code: "SST", category: "Core" },
  { id: "s5", name: "Computer Science", code: "CS", category: "Elective" },
  { id: "s6", name: "Physical Education", code: "PE", category: "Elective" },
  { id: "s7", name: "Art & Craft", code: "ART", category: "Elective" },
  { id: "s8", name: "Music", code: "MUS", category: "Elective" },
];

export const teachers: Teacher[] = [
  { id: "t1", name: "Aarav Mehta", subjects: ["Mathematics"], classes: ["Grade 5-A", "Grade 6-A"], email: "aarav@eddesk.one", avatarHue: 210 },
  { id: "t2", name: "Priya Sharma", subjects: ["English Language"], classes: ["Grade 4-A", "Grade 5-A"], email: "priya@eddesk.one", avatarHue: 340 },
  { id: "t3", name: "Rohan Iyer", subjects: ["Science"], classes: ["Grade 5-A", "Grade 5-B"], email: "rohan@eddesk.one", avatarHue: 145 },
  { id: "t4", name: "Meera Kapoor", subjects: ["Social Studies"], classes: ["Grade 6-A"], email: "meera@eddesk.one", avatarHue: 30 },
  { id: "t5", name: "Devansh Rao", subjects: ["Computer Science"], classes: ["Grade 6-A", "Grade 7-A"], email: "devansh@eddesk.one", avatarHue: 260 },
  { id: "t6", name: "Sana Qureshi", subjects: ["Art & Craft"], classes: ["Grade 4-A", "Grade 5-A"], email: "sana@eddesk.one", avatarHue: 15 },
];

export const classes: ClassRoom[] = [
  { id: "c1", name: "Grade 4", section: "A", teacher: "Priya Sharma", studentCount: 28, subjects: ["s1","s2","s3","s4","s7"], room: "Room 201" },
  { id: "c2", name: "Grade 5", section: "A", teacher: "Aarav Mehta", studentCount: 32, subjects: ["s1","s2","s3","s4","s5","s7"], room: "Room 202" },
  { id: "c3", name: "Grade 5", section: "B", teacher: "Rohan Iyer", studentCount: 30, subjects: ["s1","s2","s3","s4","s6"], room: "Room 203" },
  { id: "c4", name: "Grade 6", section: "A", teacher: "Meera Kapoor", studentCount: 34, subjects: ["s1","s2","s3","s4","s5","s8"], room: "Room 301" },
  { id: "c5", name: "Grade 7", section: "A", teacher: "Devansh Rao", studentCount: 29, subjects: ["s1","s2","s3","s4","s5","s6"], room: "Room 302" },
  { id: "c6", name: "Grade 8", section: "A", teacher: "Aarav Mehta", studentCount: 31, subjects: ["s1","s2","s3","s4","s5"], room: "Room 303" },
];

const firstNames = ["Aanya","Vihaan","Ishaan","Diya","Kabir","Anaya","Arjun","Myra","Vivaan","Aarohi","Reyansh","Kiara","Advait","Saanvi","Ayaan","Anika","Neel","Zara","Rehan","Tara","Krish","Mira","Vedant","Ira","Aryan","Aditi","Yash","Ananya","Dhruv","Riya","Kavya","Nikhil"];
const lastNames = ["Sharma","Verma","Patel","Iyer","Nair","Reddy","Khan","Kapoor","Malhotra","Chopra","Bansal","Gupta","Rao","Menon","Sinha","Bose","Das","Joshi","Pandey","Trivedi"];

function seeded(i: number) { return (i * 9301 + 49297) % 233280 / 233280; }

export const parents: Parent[] = Array.from({ length: 20 }, (_, i) => {
  const first = firstNames[(i * 3) % firstNames.length];
  const last = lastNames[(i * 5) % lastNames.length];
  return {
    id: `p${i + 1}`,
    name: `${first} ${last}`,
    mobile: `+91 9${String(80000000 + i * 12345).padStart(9, "0")}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    occupation: ["Engineer","Doctor","Business Owner","Architect","Teacher","Designer"][i % 6],
    childIds: [],
    pendingTotal: [0, 0, 4500, 0, 12000, 0, 8000, 0][i % 8] || 0,
    unreadChats: i % 5 === 0 ? Math.floor(seeded(i) * 4) : 0,
  };
});

export const students: Student[] = Array.from({ length: 60 }, (_, i) => {
  const cls = classes[i % classes.length];
  const first = firstNames[i % firstNames.length];
  const last = lastNames[(i * 7) % lastNames.length];
  const parent = parents[i % parents.length];
  const statusPool: Student["feeStatus"][] = ["paid","paid","paid","due","overdue","paid","due","paid"];
  const status = statusPool[i % statusPool.length];
  const student: Student = {
    id: `st${i + 1}`,
    admissionNo: `EDK-${2025}-${String(1000 + i).padStart(4, "0")}`,
    name: `${first} ${last}`,
    classId: cls.id,
    className: `${cls.name}-${cls.section}`,
    section: cls.section,
    rollNo: Math.floor(i / classes.length) + 1,
    gender: i % 2 === 0 ? "M" : "F",
    dob: `201${3 + (i % 6)}-0${1 + (i % 9)}-1${i % 9}`,
    parentId: parent.id,
    parentName: parent.name,
    parentMobile: parent.mobile,
    feeStatus: status,
    feeDue: status === "paid" ? 0 : status === "due" ? 4500 : 12000,
    attendance: 78 + Math.floor(seeded(i) * 20),
    avatarHue: Math.floor(seeded(i * 3) * 360),
  };
  parent.childIds.push(student.id);
  return student;
});

export function getStudent(id: string) { return students.find(s => s.id === id); }
export function getClass(id: string) { return classes.find(c => c.id === id); }
export function getParent(id: string) { return parents.find(p => p.id === id); }
export function getSubject(id: string) { return subjects.find(s => s.id === id); }
export function studentsInClass(classId: string) { return students.filter(s => s.classId === classId); }

export const recentAdmissions = students.slice(0, 5);

export const pendingFeeStudents = students.filter(s => s.feeStatus !== "paid").slice(0, 6);

export type Notice = { id: string; title: string; body: string; author: string; date: string; audience: string; };
export const notices: Notice[] = [
  { id: "n1", title: "Parent-Teacher Meeting", body: "Scheduled for Saturday, 2 Aug at 10:00 AM in the school auditorium.", author: "Principal's Office", date: "2 days ago", audience: "All parents" },
  { id: "n2", title: "Sports Day rescheduled", body: "Due to weather, Sports Day moves to 14 Aug. Kit list updated.", author: "PE Department", date: "5 days ago", audience: "Grades 4–8" },
  { id: "n3", title: "Fee reminder — August cycle", body: "August tuition due by the 10th. Auto-reminders sent to 42 parents.", author: "Finance Office", date: "1 week ago", audience: "Selected parents" },
];

export type EventItem = { id: string; title: string; date: string; time: string; location: string; category: string; };
export const events: EventItem[] = [
  { id: "e1", title: "Annual Science Exhibition", date: "Aug 12", time: "9:00 AM", location: "Main Hall", category: "Academic" },
  { id: "e2", title: "Independence Day Assembly", date: "Aug 15", time: "8:00 AM", location: "Ground", category: "School" },
  { id: "e3", title: "Grade 8 Field Trip", date: "Aug 22", time: "7:30 AM", location: "Science City", category: "Trip" },
  { id: "e4", title: "PTM — Grades 5 & 6", date: "Aug 24", time: "10:00 AM", location: "Auditorium", category: "PTM" },
];

export type ChatThread = { id: string; parentName: string; classInfo: string; lastMessage: string; time: string; unread: number; hue: number; };
export const chats: ChatThread[] = [
  { id: "ch1", parentName: "Meera Kapoor", classInfo: "Parent of Aanya, Grade 5-A", lastMessage: "Could Aanya be excused early on Friday for a dental visit?", time: "12m", unread: 2, hue: 340 },
  { id: "ch2", parentName: "Rahul Verma", classInfo: "Parent of Ishaan, Grade 6-A", lastMessage: "Thanks for the update on the science project!", time: "1h", unread: 0, hue: 210 },
  { id: "ch3", parentName: "Priya Nair", classInfo: "Parent of Diya, Grade 4-A", lastMessage: "Is the fee receipt available on the portal?", time: "3h", unread: 1, hue: 145 },
  { id: "ch4", parentName: "Aditya Sinha", classInfo: "Parent of Kabir, Grade 7-A", lastMessage: "Please share the timetable for next month.", time: "1d", unread: 0, hue: 30 },
];

export type LeaveRequest = { id: string; studentName: string; className: string; reason: string; dates: string; status: "pending" | "approved" | "declined"; };
export const leaveRequests: LeaveRequest[] = [
  { id: "l1", studentName: "Aanya Sharma", className: "Grade 5-A", reason: "Family function", dates: "Aug 8 – Aug 10", status: "pending" },
  { id: "l2", studentName: "Ishaan Patel", className: "Grade 6-A", reason: "Medical", dates: "Aug 6", status: "pending" },
  { id: "l3", studentName: "Diya Iyer", className: "Grade 4-A", reason: "Travel", dates: "Aug 12 – Aug 15", status: "pending" },
];

export type Payment = { id: string; studentName: string; className: string; amount: number; method: string; date: string; receiptNo: string; };
export const recentPayments: Payment[] = [
  { id: "pay1", studentName: "Vihaan Verma", className: "Grade 6-A", amount: 12500, method: "UPI", date: "Today, 11:20", receiptNo: "RCT-8821" },
  { id: "pay2", studentName: "Myra Patel", className: "Grade 5-B", amount: 12500, method: "Bank Transfer", date: "Today, 10:04", receiptNo: "RCT-8820" },
  { id: "pay3", studentName: "Arjun Reddy", className: "Grade 7-A", amount: 14500, method: "Cash", date: "Yesterday", receiptNo: "RCT-8819" },
  { id: "pay4", studentName: "Aarohi Nair", className: "Grade 4-A", amount: 11000, method: "UPI", date: "Yesterday", receiptNo: "RCT-8818" },
  { id: "pay5", studentName: "Reyansh Khan", className: "Grade 8-A", amount: 15000, method: "Card", date: "2 days ago", receiptNo: "RCT-8817" },
];

export const holidays = [
  { id: "h1", name: "Independence Day", date: "Aug 15", type: "National" },
  { id: "h2", name: "Raksha Bandhan", date: "Aug 19", type: "Festival" },
  { id: "h3", name: "Janmashtami", date: "Aug 26", type: "Festival" },
  { id: "h4", name: "Ganesh Chaturthi", date: "Sep 7", type: "Festival" },
];

export const timetableSample = [
  { day: "Mon", slots: ["Math", "English", "Science", "Break", "SST", "Art"] },
  { day: "Tue", slots: ["English", "Math", "PE", "Break", "Science", "Music"] },
  { day: "Wed", slots: ["Science", "Math", "English", "Break", "SST", "CS"] },
  { day: "Thu", slots: ["Math", "Science", "English", "Break", "Art", "PE"] },
  { day: "Fri", slots: ["English", "SST", "Math", "Break", "Science", "Music"] },
  { day: "Sat", slots: ["Math", "Science", "—", "—", "—", "—"] },
];
