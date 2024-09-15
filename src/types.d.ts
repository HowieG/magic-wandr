type Category = "scenic" | "cultural" | "outdoor" | "food" | "entertainment" | string;

type DayOfWeek = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

interface Activity {
  name: string;
  neighborhood: string;
  category: Category;
  note: string;
  lat: number;
  lng: number;
  day: DayOfWeek;
  userNotes: string[];
  sources: string[];
}

type ActivityList = Activity[];
