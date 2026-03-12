export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const todayStr = () => {
  const d = new Date();
  return d.toISOString().split("T")[0];
};