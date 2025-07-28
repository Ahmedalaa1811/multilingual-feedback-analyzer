
export async function fetchStats() {
  const response = await fetch("http://localhost:8000/api/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
}