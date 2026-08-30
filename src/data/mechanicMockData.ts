export const mockAppointments = [
  {
    id: "1",
    client: "Sarah Jenkins",
    vehicle: "2022 Tesla Model 3",
    service: "Battery Health Check",
    date: "Today",
    time: "2:00 PM",
    status: "upcoming",
  },
  {
    id: "2",
    client: "Michael Chang",
    vehicle: "2021 Rivian R1T",
    service: "Suspension Tuning",
    date: "Tomorrow",
    time: "10:30 AM",
    status: "upcoming",
  },
  {
    id: "3",
    client: "Emma Watson",
    vehicle: "2023 Polestar 2",
    service: "Software Update & Diagnostics",
    date: "Thursday",
    time: "1:00 PM",
    status: "upcoming",
  },
];

export const mockReviews = [
  {
    id: "1",
    client: "David R.",
    rating: 5,
    comment: "Exceptional service! Found the EV issue quickly.",
    date: "2 days ago",
  },
  {
    id: "2",
    client: "Anita K.",
    rating: 5,
    comment: "Very knowledgeable about Rivian systems.",
    date: "1 week ago",
  },
];

export const mockProfile = {
  name: "Alex Thompson",
  bio: "Certified EV Specialist with 8 years of experience working on high-performance electric powertrains.",
  hourlyRate: 150,
  specialties: ["Tesla", "Rivian", "Battery Systems", "Performance Tuning"],
  certifications: ["ASE L3 Light Duty Hybrid/EV", "Tesla Master Technician"],
};

export const defaultAvailability = {
  monday: { available: true, start: "09:00", end: "17:00" },
  tuesday: { available: true, start: "09:00", end: "17:00" },
  wednesday: { available: true, start: "09:00", end: "17:00" },
  thursday: { available: true, start: "09:00", end: "17:00" },
  friday: { available: true, start: "09:00", end: "15:00" },
  saturday: { available: false, start: "09:00", end: "17:00" },
  sunday: { available: false, start: "09:00", end: "17:00" },
};
