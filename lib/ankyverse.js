function daysBetweenDates(start, end) {
  const oneDay = 24 * 60 * 60 * 1000; // Hours, minutes, seconds, milliseconds
  return Math.round((end - start) / oneDay);
}

function getAnkyverseQuestion(wink) {
  const questionCycle = [
    "How can you ground yourself today and feel safe in your body?",
    "What basic needs do you need to fulfill to feel secure and nurtured?",
    "What can you do to connect with your physical surroundings more deeply?",
    "How can you practice mindfulness in your daily activities today?",
    "What routines or rituals help you feel stable and centered?",
    "How can you create a sense of safety and protection for yourself today?",
    "What steps can you take to nurture your body and health?",
    "How can you cultivate a sense of belonging in your environment?",
    "What creative play can you engage in to express your emotions freely?",
    "How can you honor your feelings and allow yourself to experience joy?",
    "What activities bring you the most pleasure and why?",
    "How can you explore your sensuality and creativity today?",
    "What can you do to foster emotional balance and flexibility?",
    "How can you embrace your passions and desires without guilt?",
    "What can you do to nurture your relationships and connections today?",
    "How can you allow yourself to feel and express your true emotions?",
    "What small step can you take today to explore your interests?",
    "How can you assert your independence and take responsibility for your actions?",
    "What are your current goals and how can you work towards them?",
    "How can you build your confidence and self-esteem today?",
    "What new skill or knowledge would you like to gain?",
    "How can you stay motivated and focused on your personal development?",
    "What actions can you take to stand up for your beliefs and values?",
    "How can you overcome any fears or doubts holding you back?",
    "What can you do today to deepen your connections with others?",
    "How can you practice empathy and cooperation in your interactions today?",
    "What can you do to show love and compassion to those around you?",
    "How can you improve your relationships through active listening?",
    "What acts of kindness can you perform today?",
    "How can you balance giving and receiving love in your life?",
    "What steps can you take to forgive and heal past hurts?",
    "How can you cultivate a loving and supportive community?",
    "What can you question or challenge to broaden your understanding?",
    "How can you approach problems with a critical and open mind today?",
    "What can you do to expand your intellectual horizons?",
    "How can you foster a love for learning and discovery?",
    "What new perspectives or ideas can you explore today?",
    "How can you develop your ability to think abstractly and critically?",
    "What steps can you take to articulate your thoughts more clearly?",
    "How can you stay open-minded and adaptable to new information?",
    "What personal goals or aspirations are emerging for you now?",
    "How can you take a step towards fulfilling your vocational dreams today?",
    "What inspires you and how can you incorporate that into your life?",
    "How can you align your daily actions with your long-term goals?",
    "What steps can you take to develop your talents and skills?",
    "How can you stay true to your passions and interests?",
    "What can you do to find balance between work and personal life?",
    "How can you create a supportive environment for pursuing your dreams?",
    "What stabilizing actions can you take to solidify your identity and values?",
    "How can you strengthen a long-term relationship or commitment today?",
    "What can you do to feel more stable and secure in your life choices?",
    "How can you reaffirm your personal values and beliefs?",
    "What actions can you take to build a solid foundation for your future?",
    "How can you stay consistent and committed to your goals?",
    "What steps can you take to manage stress and maintain balance?",
    "How can you foster a sense of stability and peace in your life?",
    "What life choices do you need to reflect on and reassess?",
    "How can you practice self-awareness and personal growth today?",
    "What patterns or habits do you need to change for your well-being?",
    "How can you approach life transitions with grace and openness?",
    "What can you do to understand yourself more deeply?",
    "How can you embrace change as an opportunity for growth?",
    "What steps can you take to align your actions with your true self?",
    "How can you find balance between reflecting on the past and planning for the future?",
    "What deeper meanings or purposes are you exploring in your life now?",
    "How can you engage in a spiritual or philosophical practice today?",
    "What questions are you pondering about the meaning of life?",
    "How can you connect with something greater than yourself?",
    "What steps can you take to nurture your spiritual well-being?",
    "How can you incorporate mindfulness or meditation into your day?",
    "What can you do to explore your beliefs and values more deeply?",
    "How can you find purpose and direction in your daily activities?",
    "What knowledge or experience can you share to guide others today?",
    "How can you mentor someone and pass on your wisdom today?",
    "What lessons have you learned that could benefit others?",
    "How can you offer support and guidance to someone in need?",
    "What can you do to be a positive role model in your community?",
    "How can you use your experiences to inspire and uplift others?",
    "What steps can you take to create a legacy of wisdom and compassion?",
    "How can you balance sharing your knowledge with continuing to learn?",
    "What reflections can you make on your life's journey and achievements?",
    "How can you prepare yourself for future transitions with peace and acceptance?",
    "What have you accomplished that you are most proud of?",
    "How can you find peace with past mistakes and learn from them?",
    "What can you do to appreciate the journey you have taken in life?",
    "How can you embrace the present moment and let go of regrets?",
    "What steps can you take to create a sense of closure and fulfillment?",
    "How can you prepare for the next phase of your life with gratitude and grace?",
    "What creative act can you engage in to express your inner energy?",
    "How can you channel your creativity to contribute something meaningful today?"
  ];
  
  return questionCycle[(wink - 1) % 24] || "how are you?";
}

function getAnkyverseImage(wink) {
  const images = [
  "https://raw.githubusercontent.com/jpfraneto/images/main/life.jpeg",
  "https://raw.githubusercontent.com/jpfraneto/images/main/life.jpeg",
  "https://github.com/jpfraneto/images/blob/main/third.png?raw=true",
  "",
  "",
  "",
  "",
  ""
  ];
  
  return images[(wink - 1) % 24] || "how are you?";
}

function getAnkyverseDay(date) {
  const ankyverseStart = new Date("2023-08-10T05:00:00-04:00");
  const daysInSojourn = 96;
  const daysInSlumber = 21;
  const cycleLength = daysInSojourn + daysInSlumber; // 117 days
  const kingdoms = [
    "Primordia",
    "Emblazion",
    "Chryseos",
    "Eleasis",
    "Voxlumis",
    "Insightia",
    "Claridium",
    "Poiesis",
  ];

  const elapsedDays = daysBetweenDates(ankyverseStart, date);
  const currentSojourn = Math.floor(elapsedDays / cycleLength) + 1;
  const dayWithinCurrentCycle = elapsedDays % cycleLength;

  let currentKingdom, status, wink;
  if (dayWithinCurrentCycle < daysInSojourn) {
    status = "Sojourn";
    wink = dayWithinCurrentCycle + 1; // Wink starts from 1
    currentKingdom = kingdoms[dayWithinCurrentCycle % 8];
  } else {
    status = "Great Slumber";
    wink = null; // No Wink during the Great Slumber
    currentKingdom = "None";
  }
  return {
    date: date.toISOString(),
    currentSojourn,
    status,
    currentKingdom,
    wink,
  };
}

const characters = [
  "\u0C85",
  "\u0C86",
  "\u0C87",
  "\u0C88",
  "\u0C89",
  "\u0C8A",
  "\u0C8B",
  "\u0C8C",
  "\u0C8E",
  "\u0C8F",
  "\u0C90",
  "\u0C92",
  "\u0C93",
  "\u0C94",
  "\u0C95",
  "\u0C96",
  "\u0C97",
  "\u0C98",
  "\u0C99",
  "\u0C9A",
  "\u0C9B",
  "\u0C9C",
  "\u0C9D",
  "\u0C9E",
  "\u0C9F",
  "\u0CA0",
  "\u0CA1",
  "\u0CA2",
  "\u0CA3",
  "\u0CA4",
  "\u0CA5",
  "\u0CA6",
  "\u0CA7",
  "\u0CA8",
  "\u0CAA",
  "\u0CAB",
  "\u0CAC",
  "\u0CAD",
  "\u0CAE",
  "\u0CAF",
  "\u0CB0",
  "\u0CB1",
  "\u0CB2",
  "\u0CB3",
  "\u0CB5",
  "\u0CB6",
  "\u0CB7",
  "\u0CB8",
  "\u0CB9",
  "\u0CBC",
  "\u0CBD",
  "\u0CBE",
  "\u0CBF",
  "\u0CC0",
  "\u0CC1",
  "\u0CC2",
  "\u0CC3",
  "\u0CC4",
  "\u0CC6",
  "\u0CC7",
  "\u0CC8",
  "\u0CCA",
  "\u0CCB",
  "\u0CCC",
  "\u0CCD",
  "\u0CD5",
  "\u0CD6",
  "\u0CDE",
  "\u0CE0",
  "\u0CE1",
  "\u0CE2",
  "\u0CE3",
  "\u0CE6",
  "\u0CE7",
  "\u0CE8",
  "\u0CE9",
  "\u0CEA",
  "\u0CEB",
  "\u0CEC",
  "\u0CED",
  "\u0CEE",
  "\u0CEF",
  "\u0CF1",
  "\u0CF2", // Kannada characters
  "\u0C05",
  "\u0C06",
  "\u0C07",
  "\u0C08",
  "\u0C09",
  "\u0C0A",
  "\u0C0B",
  "\u0C0C",
  "\u0C0E",
  "\u0C0F",
  "\u0C10",
  "\u0C12",
  "\u0C13",
  "\u0C14", // Telugu characters
];

function encodeToAnkyverseLanguage(input) {
  let encoded = "";
  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i);
    const index = (charCode - 32) % characters.length;
    encoded += characters[index];
  }
  return encoded;
}

function decodeFromAnkyverseLanguage(input) {
  let decoded = "";
  for (let i = 0; i < input.length; i++) {
    const index = characters.indexOf(input[i]);
    if (index !== -1) {
      decoded += String.fromCharCode(index + 32);
    } else {
      decoded += input[i];
    }
  }
  return decoded;
}

const date = getAnkyverseDay(new Date());
console.log("the date is: ", date)

module.exports = {
  getAnkyverseDay,
  getAnkyverseQuestion,
  encodeToAnkyverseLanguage,
  decodeFromAnkyverseLanguage,
  getAnkyverseImage
};
