export function getAvatarColor(username: string) {
  const colors = [
    "bg-red-100 text-red-700 border-red-300", // A
    "bg-orange-100 text-orange-700 border-orange-300", // B
    "bg-amber-100 text-amber-700 border-amber-300", // C
    "bg-yellow-100 text-yellow-700 border-yellow-300", // D
    "bg-lime-100 text-lime-700 border-lime-300", // E
    "bg-green-100 text-green-700 border-green-300", // F
    "bg-emerald-100 text-emerald-700 border-emerald-300", // G
    "bg-teal-100 text-teal-700 border-teal-300", // H
    "bg-cyan-100 text-cyan-700 border-cyan-300", // I
    "bg-sky-100 text-sky-700 border-sky-300", // J
    "bg-blue-100 text-blue-700 border-blue-300", // K
    "bg-indigo-100 text-indigo-700 border-indigo-300", // L
    "bg-violet-100 text-violet-700 border-violet-300", // M
    "bg-purple-100 text-purple-700 border-purple-300", // N
    "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300", // O
    "bg-pink-100 text-pink-700 border-pink-300", // P
    "bg-rose-100 text-rose-700 border-rose-300", // Q
    "bg-red-100 text-red-700 border-red-300", // R
    "bg-orange-100 text-orange-700 border-orange-300", // S
    "bg-amber-100 text-amber-700 border-amber-300", // T
    "bg-green-100 text-green-700 border-green-300", // U
    "bg-teal-100 text-teal-700 border-teal-300", // V
    "bg-blue-100 text-blue-700 border-blue-300", // W
    "bg-purple-100 text-purple-700 border-purple-300", // X
    "bg-pink-100 text-pink-700 border-pink-300", // Y
    "bg-rose-100 text-rose-700 border-rose-300", // Z
  ];

  const letter = (username || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const index =
    letter >= "A" && letter <= "Z"
      ? letter.charCodeAt(0) - 65
      : 20;

  return colors[index];
}